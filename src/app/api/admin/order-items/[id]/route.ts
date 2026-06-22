export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const { costPrice } = await req.json();

  const item = await prisma.orderItem.update({
    where: { id },
    data: { costPrice: costPrice !== null && costPrice !== "" ? parseFloat(costPrice) : null },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const item = await prisma.orderItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });

  await prisma.orderItem.delete({ where: { id } });

  // Recalcula o total do pedido
  const remaining = await prisma.orderItem.findMany({ where: { orderId: item.orderId } });
  const newTotal = remaining.reduce((s, i) => s + i.price * i.quantity, 0);
  await prisma.order.update({
    where: { id: item.orderId },
    data: { total: newTotal, subtotal: newTotal },
  });

  return NextResponse.json({ ok: true, newTotal });
}
