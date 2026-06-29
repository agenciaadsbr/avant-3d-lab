export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Saldo acumulado: receitas + aportes - despesas a partir de uma data de corte
export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const dateFilter = from ? { gte: new Date(from) } : undefined;

  const [receitas, despesas, aportes] = await Promise.all([
    prisma.order.aggregate({
      _sum: { amountPaid: true },
      where: { status: { not: "cancelled" }, ...(dateFilter ? { createdAt: dateFilter } : {}) },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: dateFilter ? { date: dateFilter } : {},
    }),
    prisma.cashInjection.aggregate({
      _sum: { amount: true },
      where: dateFilter ? { date: dateFilter } : {},
    }),
  ]);

  const saldo = (receitas._sum.amountPaid || 0) + (aportes._sum.amount || 0) - (despesas._sum.amount || 0);
  return NextResponse.json({ saldo, from: from || null });
}
