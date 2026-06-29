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
  const dateFilter = from ? { gte: new Date(from) } : undefined;

  const [receitas, despesasOperacionais, despesasEstoque, aportes, estoque, cadernoAberto] = await Promise.all([
    // Receitas recebidas
    prisma.order.aggregate({
      _sum: { amountPaid: true },
      where: { status: { not: "cancelled" }, ...(dateFilter ? { createdAt: dateFilter } : {}) },
    }),
    // Despesas operacionais (excluindo reposição de estoque)
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { category: { not: "estoque" }, ...(dateFilter ? { date: dateFilter } : {}) },
    }),
    // Despesas de estoque separadas
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { category: "estoque", ...(dateFilter ? { date: dateFilter } : {}) },
    }),
    // Aportes e retiradas de capital
    prisma.cashInjection.aggregate({
      _sum: { amount: true },
      where: dateFilter ? { date: dateFilter } : {},
    }),
    // Valor do estoque atual ao custo
    prisma.product.aggregate({
      _sum: { costPrice: true },
      where: { active: true, NOT: { slug: "venda-manual" } },
    }),
    // A receber (caderno)
    prisma.order.findMany({
      where: { paymentStatus: { not: "paid" }, status: { not: "cancelled" } },
      select: { total: true, amountPaid: true },
    }),
  ]);

  const receitasVal    = receitas._sum.amountPaid || 0;
  const despesasOpVal  = despesasOperacionais._sum.amount || 0;
  const despesasEstVal = despesasEstoque._sum.amount || 0;
  const aportesVal     = aportes._sum.amount || 0;
  const estoqueVal     = estoque._sum.costPrice || 0;
  const aReceberVal    = cadernoAberto.reduce((s, o) => s + (o.total - o.amountPaid), 0);

  // Caixa = receitas + aportes - despesas operacionais (estoque não conta pois virou mercadoria)
  const caixa = receitasVal + aportesVal - despesasOpVal;

  // Patrimônio = caixa + estoque (ao custo) + a receber
  const patrimonio = caixa + estoqueVal + aReceberVal;

  return NextResponse.json({
    caixa,
    despesasOperacionais: despesasOpVal,
    despesasEstoque: despesasEstVal,
    estoqueValor: estoqueVal,
    aReceber: aReceberVal,
    patrimonio,
    receitas: receitasVal,
    aportes: aportesVal,
    from: from || null,
  });
}
