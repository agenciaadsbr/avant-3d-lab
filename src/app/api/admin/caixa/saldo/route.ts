export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Saldo acumulado total: receitas + aportes - despesas
export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const [receitas, despesas, aportes] = await Promise.all([
    prisma.order.aggregate({ _sum: { amountPaid: true }, where: { status: { not: "cancelled" } } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.cashInjection.aggregate({ _sum: { amount: true } }),
  ]);

  const saldo = (receitas._sum.amountPaid || 0) + (aportes._sum.amount || 0) - (despesas._sum.amount || 0);
  return NextResponse.json({ saldo });
}
