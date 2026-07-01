export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");

  if (!clientId)
    return NextResponse.json({ error: "clientId obrigatório" }, { status: 400 });

  const pedidos = await prisma.order.findMany({
    where: {
      userId: clientId,
      paymentMethod: "caderno",
      paymentStatus: { not: "paid" },
      status: { not: "cancelled" },
    },
    select: {
      id: true, total: true, amountPaid: true, dueDate: true,
      items: { select: { quantity: true, price: true, size: true, componentName: true, product: { select: { name: true } } } },
      installments: { orderBy: { number: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calcula o saldo pendente de cada pedido
  const pedidosComSaldo = pedidos.map(p => ({
    id: p.id,
    total: p.total,
    amountPaid: p.amountPaid,
    saldoPendente: p.total - p.amountPaid,
    dueDate: p.dueDate,
    items: p.items || [],
    installments: p.installments || [],
  }));

  return NextResponse.json({ pedidos: pedidosComSaldo });
}
