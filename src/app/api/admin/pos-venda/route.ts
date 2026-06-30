export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const tresDiasAtras = new Date();
  tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);

  const orders = await prisma.order.findMany({
    where: {
      status: "delivered",
      deliveredAt: { lte: tresDiasAtras, not: null },
      followUpSentAt: null,
    },
    include: {
      user: { select: { id: true, name: true, phone: true } },
      items: { select: { quantity: true, size: true, componentName: true, product: { select: { name: true } } } },
    },
    orderBy: { deliveredAt: "asc" },
  });

  return NextResponse.json({ orders });
}
