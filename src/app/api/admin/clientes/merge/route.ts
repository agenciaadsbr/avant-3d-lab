export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST { keepId, removeId } — move todos os pedidos de removeId para keepId e exclui removeId
export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { keepId, removeId } = await req.json();
  if (!keepId || !removeId || keepId === removeId)
    return NextResponse.json({ error: "IDs inválidos" }, { status: 400 });

  // Mover pedidos
  const { count } = await prisma.order.updateMany({
    where: { userId: removeId },
    data: { userId: keepId },
  });

  // Mover endereços
  await prisma.address.updateMany({
    where: { userId: removeId },
    data: { userId: keepId },
  });

  // Excluir duplicata
  await prisma.user.delete({ where: { id: removeId } });

  return NextResponse.json({ ok: true, ordersMoved: count });
}
