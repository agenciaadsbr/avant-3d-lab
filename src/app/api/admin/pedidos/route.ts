export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date");
  const paymentMethod = searchParams.get("paymentMethod");

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (paymentMethod) where.paymentMethod = paymentMethod;
  if (date) {
    const d = new Date(date);
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const end = new Date(d); end.setHours(23, 59, 59, 999);
    where.createdAt = { gte: start, lte: end };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { userId, newCustomer, items, paymentMethod, paymentStatus, amountPaid, notes, createdAt, dueDate, installments } = body;

  let customerId = userId;

  if (newCustomer?.name) {
    const email = newCustomer.email || `${newCustomer.name.toLowerCase().replace(/\s+/g, ".")}.${Date.now()}@cliente.accessfit.com.br`;
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      customerId = existing.id;
    } else {
      const user = await prisma.user.create({
        data: { name: newCustomer.name, email, phone: newCustomer.phone || null, role: "customer" },
      });
      customerId = user.id;
    }
  }

  if (!customerId) return NextResponse.json({ error: "Cliente obrigatório" }, { status: 400 });
  if (!items?.length) return NextResponse.json({ error: "Adicione ao menos um item" }, { status: 400 });

  // "Venda Manual" só é necessário como fallback se algum item não tiver productId
  const needsFallback = items.some((i: any) => !i.productId);
  let fallbackProductId: string | null = null;
  if (needsFallback) {
    const vendaManual = await prisma.product.findFirst({ where: { name: "Venda Manual" } });
    if (!vendaManual) return NextResponse.json({ error: "Selecione um produto do catálogo ou cadastre 'Venda Manual'." }, { status: 400 });
    fallbackProductId = vendaManual.id;
  }

  const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
  const paid = parseFloat(amountPaid) || 0;

  try {
    // Decrementar estoque dos produtos vinculados
    for (const item of items) {
      if (item.productId) {
        await prisma.product.updateMany({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        userId: customerId,
        status: body.status || "delivered",
        paymentMethod: paymentMethod || "pix",
        paymentStatus: paymentStatus || "paid",
        amountPaid: paid,
        total: subtotal,
        subtotal,
        shipping: 0,
        discount: 0,
        notes: notes || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        installmentCount: installments || 1,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        items: {
          create: items.map((i: any) => ({
            productId: i.productId || fallbackProductId!,
            quantity: i.quantity,
            price: i.price,
            size: i.size || null,
            componentName: i.componentName || null,
          })),
        },
      }
    );

    // Decrementar estoque dos componentes se foi vendido um componente de um Conjunto
    for (const item of items) {
      if (item.componentName) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product?.isConjunto) {
          await prisma.conjuntoItem.updateMany({
            where: { conjuntoId: item.productId, name: item.componentName },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    }

    return NextResponse.json(order);
  } catch (e: any) {
    console.error("Erro ao criar pedido:", e);
    return NextResponse.json({ error: e?.message || "Erro interno ao criar pedido." }, { status: 500 });
  }
}
