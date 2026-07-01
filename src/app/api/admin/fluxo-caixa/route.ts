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

  const startDate = from ? new Date(from + "T00:00:00") : new Date("2020-01-01");
  const endDate = to ? new Date(to + "T23:59:59") : new Date();

  const [orders, expenses, aportes] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: { not: "cancelled" },
        amountPaid: { gt: 0 },
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        createdAt: true,
        amountPaid: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.expense.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      select: {
        id: true,
        date: true,
        description: true,
        amount: true,
        category: true,
        paymentMethod: true,
        supplier: { select: { name: true } },
      },
      orderBy: { date: "asc" },
    }),
    prisma.cashInjection.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      select: { id: true, date: true, amount: true, description: true },
      orderBy: { date: "asc" },
    }),
  ]);

  // Saldo anterior (tudo antes do período)
  const [receitasAntes, despesasAntes, aportesAntes] = await Promise.all([
    prisma.order.aggregate({
      _sum: { amountPaid: true },
      where: { status: { not: "cancelled" }, amountPaid: { gt: 0 }, createdAt: { lt: startDate } },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { lt: startDate } },
    }),
    prisma.cashInjection.aggregate({
      _sum: { amount: true },
      where: { date: { lt: startDate } },
    }),
  ]);

  const saldoAnterior =
    (receitasAntes._sum.amountPaid || 0) +
    (aportesAntes._sum.amount || 0) -
    (despesasAntes._sum.amount || 0);

  // Montar movimentações
  type Mov = {
    id: string;
    date: Date;
    description: string;
    tipo: "entrada" | "saida";
    categoria: string;
    valor: number;
  };

  const movs: Mov[] = [
    ...orders.map(o => ({
      id: "order-" + o.id,
      date: o.createdAt,
      description: `Venda — ${o.user?.name || "cliente"}`,
      tipo: "entrada" as const,
      categoria: "venda",
      valor: o.amountPaid,
    })),
    ...expenses.map(e => ({
      id: "exp-" + e.id,
      date: e.date,
      description: e.description + (e.supplier ? ` (${e.supplier.name})` : ""),
      tipo: "saida" as const,
      categoria: e.category,
      valor: e.amount,
    })),
    ...aportes.map(a => ({
      id: "aporte-" + a.id,
      date: a.date,
      description: a.description || (a.amount >= 0 ? "Aporte de capital" : "Retirada de capital"),
      tipo: (a.amount >= 0 ? "entrada" : "saida") as "entrada" | "saida",
      categoria: "aporte",
      valor: Math.abs(a.amount),
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calcular saldo corrente
  let saldo = saldoAnterior;
  const extrato = movs.map(m => {
    if (m.tipo === "entrada") saldo += m.valor;
    else saldo -= m.valor;
    return { ...m, date: m.date.toISOString(), saldo };
  });

  const totalEntradas = movs.filter(m => m.tipo === "entrada").reduce((s, m) => s + m.valor, 0);
  const totalSaidas = movs.filter(m => m.tipo === "saida").reduce((s, m) => s + m.valor, 0);

  return NextResponse.json({
    saldoAnterior,
    saldoFinal: saldo,
    totalEntradas,
    totalSaidas,
    extrato,
  });
}
