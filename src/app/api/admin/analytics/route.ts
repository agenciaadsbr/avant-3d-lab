import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // 1. LUCRO REAL
    const orders = await prisma.order.findMany({
      where: { paymentStatus: "paid" },
      include: { items: true },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalCost = (await prisma.orderItem.aggregate({
      where: { costPrice: { not: null } },
      _sum: { costPrice: true },
    }))._sum.costPrice || 0;

    const lucroReal = totalRevenue - totalCost;
    const margemTotal = totalRevenue > 0 ? ((lucroReal / totalRevenue) * 100).toFixed(2) : "0";

    // 2. MARGEM POR PRODUTO
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { orderItems: true },
    });

    const productMargins = await Promise.all(
      products.map(async (product) => {
        const sales = await prisma.orderItem.aggregate({
          where: { productId: product.id },
          _sum: { quantity: true, costPrice: true },
        });

        const faturamento = product.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const custo = sales._sum.costPrice || 0;
        const lucro = faturamento - custo;
        const margem = faturamento > 0 ? ((lucro / faturamento) * 100).toFixed(2) : "0";

        return {
          id: product.id,
          name: product.name,
          faturamento,
          custo,
          lucro,
          margem: parseFloat(margem),
          quantidade: sales._sum.quantity || 0,
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

    // 4. PREVISÃO DE ESTOQUE (quando vai acabar)
    const predictions = await Promise.all(
      products.map(async (product) => {
        const sales = await prisma.orderItem.findMany({
          where: { productId: product.id },
          include: { order: true },
          orderBy: { order: { createdAt: "asc" } },
        });

        if (sales.length === 0) return null;

        const firstSale = sales[0].order.createdAt;
        const daysActive = Math.max(1, Math.floor((Date.now() - firstSale.getTime()) / (1000 * 60 * 60 * 24)));
        const totalSold = sales.reduce((sum, s) => sum + s.quantity, 0);
        const velocidade = totalSold / daysActive;
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

    return NextResponse.json({
      lucroReal: {
        faturamento: totalRevenue.toFixed(2),
        custo: totalCost.toFixed(2),
        lucro: lucroReal.toFixed(2),
        margem: margemTotal,
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
