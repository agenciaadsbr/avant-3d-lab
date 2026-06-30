export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  // Total vendido no período
  const totalResult = await prisma.order.aggregate({
    _sum: { total: true },
    where,
  });

  // Vendas por mês
  const orders = await prisma.order.findMany({
    where,
    select: { total: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Agrupar por mês
  const vendidosPorMes: { [key: string]: number } = {};
  orders.forEach(order => {
    const mes = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
    vendidosPorMes[mes] = (vendidosPorMes[mes] || 0) + order.total;
  });

  return NextResponse.json({
    total: totalResult._sum.total || 0,
    vendidosPorMes,
    quantidade: orders.length,
  });
}
