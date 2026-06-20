export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Deleta pedidos atualizados nos últimos 30 minutos (os do import)
  const since = new Date(Date.now() - 30 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: { updatedAt: { gte: since } },
    select: { id: true },
  });

  const ids = orders.map(o => o.id);

  if (ids.length === 0)
    return NextResponse.json({ ok: true, deleted: 0, message: "Nenhum pedido recente encontrado." });

  await prisma.orderItem.deleteMany({ where: { orderId: { in: ids } } });
  await prisma.order.deleteMany({ where: { id: { in: ids } } });

  // Deleta também os gastos importados agora
  const expenses = await prisma.expense.findMany({
    where: { createdAt: { gte: since } },
    select: { id: true },
  });
  await prisma.expense.deleteMany({ where: { createdAt: { gte: since } } });

  return NextResponse.json({ ok: true, deletedOrders: ids.length, deletedExpenses: expenses.length });
}
