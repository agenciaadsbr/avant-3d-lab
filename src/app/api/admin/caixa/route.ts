export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Receitas recebidas no período
export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: any = { status: { not: "cancelled" } };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) { const d = new Date(to); d.setHours(23,59,59,999); where.createdAt.lte = d; }
  }

  const result = await prisma.order.aggregate({
    _sum: { amountPaid: true },
    where,
  });

  return NextResponse.json({ total: result._sum.amountPaid || 0 });
}
