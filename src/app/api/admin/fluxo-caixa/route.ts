export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MARKER = "__saldo_abertura__";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const startDate = from ? new Date(from + "T00:00:00.000Z") : new Date("2020-01-01");
  const endDate = to ? new Date(to + "T23:59:59.999Z") : new Date();

  // Verificar se existe saldo de abertura configurado
  const aberturaEntry = await prisma.cashInjection.findFirst({
    where: { description: { startsWith: MARKER } },
    orderBy: { createdAt: "desc" },
  });

  const aberturaDate = aberturaEntry ? aberturaEntry.date : null;
  const aberturaAmount = aberturaEntry ? aberturaEntry.amount : null;

  // Se há saldo de abertura e o período começa a partir dele, ignora histórico anterior
  const usarAbertura = aberturaDate && startDate >= aberturaDate;

  let saldoAnterior: number;

  if (usarAbertura && aberturaAmount !== null) {
    // Calcula apenas o que aconteceu entre a data de abertura e o início do período filtrado
    if (startDate.getTime() === aberturaDate.getTime()) {
      // Período começa exatamente na data de abertura
      saldoAnterior = aberturaAmount;
    } else {
      // Há transações entre abertura e início do período
      const [ordensInter, despesasInter, aportesInter] = await Promise.all([
        prisma.order.findMany({
          where: { status: { not: "cancelled" }, paymentStatus: { in: ["paid", "partial"] }, paymentMethod: { not: "caderno" }, createdAt: { gte: aberturaDate, lt: startDate } },
          select: { total: true, amountPaid: true, paymentStatus: true },
        }),
        prisma.expense.aggregate({ _sum: { amount: true }, where: { OR: [{ paymentMethod: { not: "cartao_credito" }, date: { gte: aberturaDate, lt: startDate } }, { paymentMethod: "cartao_credito", dueDate: { gte: aberturaDate, lt: startDate } }] } }),
        prisma.cashInjection.aggregate({
          _sum: { amount: true },
          where: { date: { gte: aberturaDate, lt: startDate }, NOT: { description: { startsWith: MARKER } } },
        }),
      ]);
      const receitasInter = ordensInter.reduce((s, o) => s + (o.paymentStatus === "paid" ? o.total : o.amountPaid), 0);
      saldoAnterior = aberturaAmount + receitasInter + (aportesInter._sum.amount || 0) - (despesasInter._sum.amount || 0);
    }
  } else {
    // Sem saldo de abertura: soma tudo antes do período
    const ordensAntes = await prisma.order.findMany({
      where: { status: { not: "cancelled" }, paymentStatus: { in: ["paid", "partial"] }, paymentMethod: { not: "caderno" }, createdAt: { lt: startDate } },
      select: { total: true, amountPaid: true, paymentStatus: true },
    });
    const receitasAntesVal = ordensAntes.reduce((s, o) => s + (o.paymentStatus === "paid" ? o.total : o.amountPaid), 0);
    const [despesasAntes, aportesAntes] = await Promise.all([
      prisma.expense.aggregate({ _sum: { amount: true }, where: { OR: [{ paymentMethod: { not: "cartao_credito" }, date: { lt: startDate } }, { paymentMethod: "cartao_credito", dueDate: { lt: startDate } }] } }),
      prisma.cashInjection.aggregate({
        _sum: { amount: true },
        where: { date: { lt: startDate }, NOT: { description: { startsWith: MARKER } } },
      }),
    ]);
    saldoAnterior = receitasAntesVal + (aportesAntes._sum.amount || 0) - (despesasAntes._sum.amount || 0);
  }

  // Buscar movimentações do período (excluindo entrada de abertura)
  const [orders, expensesNormais, expensesCartao, aportes] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: { not: "cancelled" },
        paymentStatus: { in: ["paid", "partial"] },
        paymentMethod: { not: "caderno" },
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        id: true, createdAt: true, amountPaid: true, total: true,
        paymentMethod: true, paymentStatus: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    // Despesas normais (não cartão) → usa campo date
    prisma.expense.findMany({
      where: { paymentMethod: { not: "cartao_credito" }, date: { gte: startDate, lte: endDate } },
      select: { id: true, date: true, description: true, amount: true, category: true, paymentMethod: true, supplier: { select: { name: true } } },
      orderBy: { date: "asc" },
    }),
    // Despesas de cartão → usa campo dueDate (mês da fatura = saída real do caixa)
    prisma.expense.findMany({
      where: { paymentMethod: "cartao_credito", dueDate: { gte: startDate, lte: endDate } },
      select: { id: true, dueDate: true, description: true, amount: true, category: true, paymentMethod: true, installments: true, installmentNumber: true, supplier: { select: { name: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.cashInjection.findMany({
      where: { date: { gte: startDate, lte: endDate }, NOT: { description: { startsWith: MARKER } } },
      select: { id: true, date: true, amount: true, description: true },
      orderBy: { date: "asc" },
    }),
  ]);

  type Mov = { id: string; date: Date; description: string; tipo: "entrada" | "saida"; categoria: string; valor: number };

  const movs: Mov[] = [
    ...orders.map(o => ({
      id: "order-" + o.id,
      date: o.createdAt,
      description: `Venda — ${o.user?.name || "cliente"}`,
      tipo: "entrada" as const,
      categoria: "venda",
      valor: o.paymentStatus === "paid" ? o.total : o.amountPaid,
    })),
    ...expensesNormais.map(e => ({
      id: "exp-" + e.id,
      date: e.date,
      description: e.description + (e.supplier ? ` (${e.supplier.name})` : ""),
      tipo: "saida" as const,
      categoria: e.category,
      valor: e.amount,
    })),
    ...expensesCartao.map((e: any) => ({
      id: "card-" + e.id,
      date: e.dueDate,
      description: `💳 ${e.description}${e.installments > 1 ? ` (${e.installmentNumber}/${e.installments}x)` : ""}${e.supplier ? ` — ${e.supplier.name}` : ""}`,
      tipo: "saida" as const,
      categoria: "cartao",
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
    abertura: aberturaEntry ? { amount: aberturaEntry.amount, date: aberturaEntry.date.toISOString().split("T")[0] } : null,
  });
}
