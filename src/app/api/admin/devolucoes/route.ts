export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrementProductStock, restoreProductStock } from "@/lib/stock";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: any = {};
  if (status) where.status = status;

  const returns = await prisma.return.findMany({
    where,
    include: {
      order: {
        include: {
          user: true,
          items: { include: { product: true } },
        },
      },
      replacementProduct: true,
    },
    orderBy: { requestedAt: "desc" },
  });

  return NextResponse.json({ returns });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { orderId, reason, amount, itemIds } = await req.json();

  if (!orderId || !amount) {
    return NextResponse.json({ error: "Faltam campos" }, { status: 400 });
  }

  const devolution = await prisma.return.create({
    data: {
      orderId,
      reason,
      amount,
      orderItemIds: JSON.stringify(itemIds || []),
    },
    include: { order: true },
  });

  return NextResponse.json({ devolution });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id, status, replacementProductId, replacementSize } = await req.json();

  // Troca do produto substituto (independente da mudança de status)
  if (replacementProductId !== undefined) {
    const current = await prisma.return.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Devolução não encontrada" }, { status: 404 });

    const itemIds: string[] = JSON.parse(current.orderItemIds || "[]");
    const items = itemIds.length
      ? await prisma.orderItem.findMany({ where: { id: { in: itemIds } } })
      : [];
    const quantity = items.reduce((s, i) => s + i.quantity, 0) || 1;

    // Se já havia um substituto enviado, restaura o estoque dele antes de trocar
    if (current.replacementProductId && current.replacementSentAt) {
      await restoreProductStock(current.replacementProductId, quantity, current.replacementSize);
    }

    if (replacementProductId) {
      await decrementProductStock(replacementProductId, quantity, replacementSize);
    }

    const devolution = await prisma.return.update({
      where: { id },
      data: {
        replacementProductId: replacementProductId || null,
        replacementSize: replacementSize || null,
        replacementSentAt: replacementProductId ? new Date() : null,
      },
    });
    return NextResponse.json({ devolution });
  }

  const statusMap: { [key: string]: string } = {
    aprovar: "aprovado",
    rejeitar: "rejeitado",
    receber: "recebido",
    reembolsar: "reembolsado",
  };

  // Restaura o estoque dos itens devolvidos ao marcar como "recebido" (uma única vez)
  if (status === "receber") {
    const current = await prisma.return.findUnique({
      where: { id },
      include: { order: { include: { items: true } } },
    });
    if (current && !current.stockRestored) {
      const itemIds: string[] = JSON.parse(current.orderItemIds || "[]");
      const items = itemIds.length
        ? current.order.items.filter(i => itemIds.includes(i.id))
        : current.order.items; // devoluções antigas sem itemIds: restaura o pedido todo
      for (const item of items) {
        await restoreProductStock(item.productId, item.quantity, item.size);
      }
    }
  }

  const devolution = await prisma.return.update({
    where: { id },
    data: {
      status: statusMap[status] || status,
      ...(status === "aprovar" && { approvedAt: new Date() }),
      ...(status === "receber" && { returnedAt: new Date(), stockRestored: true }),
      ...(status === "reembolsar" && { reimbursedAt: new Date() }),
    },
  });

  return NextResponse.json({ devolution });
}
