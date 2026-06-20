export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Busca todos os pedidos do caderno com saldo em aberto
  const orders = await prisma.order.findMany({
    where: { paymentMethod: "caderno", paymentStatus: { not: "paid" } },
    select: { id: true },
  });

  const ids = orders.map(o => o.id);

  if (ids.length === 0)
    return NextResponse.json({ ok: true, deleted: 0 });

  await prisma.orderItem.deleteMany({ where: { orderId: { in: ids } } });
  await prisma.order.deleteMany({ where: { id: { in: ids } } });

  return NextResponse.json({ ok: true, deleted: ids.length });
}
