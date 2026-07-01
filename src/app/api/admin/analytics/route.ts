export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Período padrão: últimos 3 meses
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const startDate = from ? new Date(from + "T00:00:00.000Z") : defaultFrom;
    const endDate = to ? new Date(to + "T23:59:59.999Z") : defaultTo;

    const orderFilter = {
      status: { not: "cancelled" },
      paymentStatus: { in: ["paid", "partial"] },
      createdAt: { gte: startDate, lte: endDate },
    };

    // 1. LUCRO REAL
    const orders = await prisma.order.findMany({
      where: orderFilter,
      include: { items: { include: { product: true } } },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    // Usa o custo ATUAL do produto cadastrado, não o salvo no momento da venda
    // (pedidos antigos podem ter sido criados antes do custo ser preenchido)
    const totalCost = orders.reduce((sum, order) =>
      sum + order.items.reduce((s, item) => s + (item.product.costPrice || 0) * item.quantity, 0), 0
    );

    const lucroReal = totalRevenue - totalCost;
    const margemTotal = totalRevenue > 0 ? ((lucroReal / totalRevenue) * 100).toFixed(2) : "0";

    // 2. MARGEM POR PRODUTO
    const products = await prisma.product.findMany({
      where: { active: true },
    });

    const productMargins = await Promise.all(
      products.map(async (product) => {
        const itemsInPeriod = await prisma.orderItem.findMany({
          where: {
            productId: product.id,
            order: { status: { not: "cancelled" }, paymentStatus: { in: ["paid", "partial"] }, createdAt: { gte: startDate, lte: endDate } }
          },
        });

        const faturamento = itemsInPeriod.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const quantidade = itemsInPeriod.reduce((sum, item) => sum + item.quantity, 0);
        // Usa o custo ATUAL do produto, não o salvo no item (que pode estar zerado em pedidos antigos)
        const custo = quantidade * (product.costPrice || 0);
        const lucro = faturamento - custo;
        const margem = faturamento > 0 ? ((lucro / faturamento) * 100).toFixed(2) : "0";

        return {
          id: product.id,
          name: product.name,
          faturamento,
          custo,
          lucro,
          margem: parseFloat(margem),
          quantidade,
        };
      })
    );

    // 3. ANÁLISE ABC
    const totalFaturamento = productMargins.reduce((sum, p) => sum + p.faturamento, 0);
    let acumulado = 0;

    const productABC = productMargins
      .sort((a, b) => b.faturamento - a.faturamento)
      .map((p) => {
        acumulado += p.faturamento;
        const percentual = (acumulado / totalFaturamento) * 100;
        let classe = "A";
        if (percentual > 50 && percentual <= 80) classe = "B";
        if (percentual > 80) classe = "C";

        return {
          ...p,
          classe,
          percentual: ((p.faturamento / totalFaturamento) * 100).toFixed(2),
        };
      });

    // 4. PREVISÃO DE ESTOQUE (baseado na velocidade média de venda)
    const predictions = await Promise.all(
      products.map(async (product) => {
        const salesInPeriod = await prisma.orderItem.findMany({
          where: {
            productId: product.id,
            order: { status: { not: "cancelled" }, paymentStatus: { in: ["paid", "partial"] }, createdAt: { gte: startDate, lte: endDate } }
          },
        });

        if (salesInPeriod.length === 0) return null;

        const totalSoldInPeriod = salesInPeriod.reduce((sum, s) => sum + s.quantity, 0);
        const daysInPeriod = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const velocidade = totalSoldInPeriod / daysInPeriod;
        const diasRestantes = velocidade > 0 ? Math.floor(product.stock / velocidade) : 999;

        return {
          id: product.id,
          name: product.name,
          stock: product.stock,
          velocidade: velocidade.toFixed(2),
          diasRestantes: diasRestantes === 999 ? "∞" : diasRestantes,
          esgotadoEm: diasRestantes === 999 ? "Nunca" : new Date(Date.now() + diasRestantes * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR"),
        };
      })
    );

    // Período em formato legível
    const periodLabel = `${startDate.toLocaleDateString("pt-BR")} a ${endDate.toLocaleDateString("pt-BR")}`;

    return NextResponse.json({
      periodo: periodLabel,
      lucroReal: {
        faturamento: totalRevenue.toFixed(2),
        custo: totalCost.toFixed(2),
        lucro: lucroReal.toFixed(2),
        margem: margemTotal,
        descricao: `Pedidos ENTREGUES e PAGOS no período: ${periodLabel}`
      },
      margensPorProduto: productMargins.sort((a, b) => b.margem - a.margem),
      analiseABC: productABC,
      previsaoEstoque: predictions.filter(p => p !== null).sort((a, b) => (typeof a?.diasRestantes === 'number' && typeof b?.diasRestantes === 'number' ? a.diasRestantes - b.diasRestantes : 0)),
    });
  } catch (err) {
    console.error("Erro ao calcular analytics:", err);
    return NextResponse.json({ error: "Erro ao calcular analytics" }, { status: 500 });
  }
}
