export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    // 1. TICKET MÉDIO
    const ordersForTicket = await prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { status: { not: "cancelled" }, paymentStatus: "paid" },
    });
    const ticketMedio = ordersForTicket._count > 0
      ? ordersForTicket._sum.total! / ordersForTicket._count
      : 0;

    // 2. PREVISÃO DE CAIXA
    const now = new Date();
    const treintaDiasAtras = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const despesasTrinta = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: treintaDiasAtras } },
    });
    const despesasDia = (despesasTrinta._sum.amount || 0) / 30;

    const caixaAtual = await prisma.cashInjection.aggregate({
      _sum: { amount: true },
    });
    const caixa = caixaAtual._sum.amount || 0;
    const diasRestantes = despesasDia > 0 ? Math.floor(caixa / despesasDia) : 999;

    // 3. CICLO DE CAIXA (tempo médio entre venda e recebimento)
    const ordersForCiclo = await prisma.order.findMany({
      where: { paymentStatus: "paid", status: { not: "cancelled" } },
      select: { createdAt: true, amountPaid: true, total: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    let cicloMedio = 0;
    if (ordersForCiclo.length > 0) {
      const tempoTotal = ordersForCiclo.reduce((sum, order) => {
        const dias = Math.floor((Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return sum + dias;
      }, 0);
      cicloMedio = tempoTotal / ordersForCiclo.length;
    }

    // 4. CLIENTES VIP (top 5 por valor gasto)
    const clientesVIP = await prisma.user.findMany({
      where: { orders: { some: { paymentStatus: "paid" } } },
      select: {
        id: true,
        name: true,
        email: true,
        orders: { where: { paymentStatus: "paid" }, select: { total: true } },
      },
      orderBy: { orders: { _count: "desc" } },
      take: 5,
    });

    const clientesVIPFormatted = clientesVIP.map(c => ({
      id: c.id,
      name: c.name || "Sem nome",
      email: c.email,
      totalGasto: c.orders.reduce((sum, o) => sum + o.total, 0),
      pedidos: c.orders.length,
    }));

    // 5. CLIENTES INATIVOS (última compra > 60 dias)
    const sessentaDiasAtras = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const clientesInativos = await prisma.user.findMany({
      where: {
        orders: {
          some: { createdAt: { lte: sessentaDiasAtras }, paymentStatus: "paid" },
          none: { createdAt: { gt: sessentaDiasAtras } },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        orders: {
          where: { paymentStatus: "paid" },
          select: { createdAt: true, total: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      take: 10,
    });

    const clientesInativosFormatted = clientesInativos.map(c => ({
      id: c.id,
      name: c.name || "Sem nome",
      email: c.email,
      ultimaCompra: c.orders[0]?.createdAt || null,
      diasSemComprar: c.orders[0]
        ? Math.floor((now.getTime() - c.orders[0].createdAt.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    }));

    // 6. MARGENS POR CATEGORIA
    const margensPorCategoria = await prisma.product.groupBy({
      by: ["categoryId"],
      where: { active: true },
      _sum: { costPrice: true },
      _count: true,
    });

    const categoriasInfo = await prisma.category.findMany();
    const categoryMap = Object.fromEntries(categoriasInfo.map(c => [c.id, c.name]));

    const margensDetalhadas = await Promise.all(
      margensPorCategoria.map(async (cat) => {
        const faturamento = await prisma.orderItem.aggregate({
          _sum: { price: true },
          where: { product: { categoryId: cat.categoryId } },
        });
        const custo = cat._sum.costPrice || 0;
        const fat = faturamento._sum.price || 0;
        const lucro = fat - custo;
        const margem = fat > 0 ? ((lucro / fat) * 100) : 0;

        return {
          categoria: categoryMap[cat.categoryId] || cat.categoryId,
          faturamento: fat,
          custo,
          lucro,
          margem: margem.toFixed(1),
          produtos: cat._count,
        };
      })
    );

    return NextResponse.json({
      ticketMedio: ticketMedio.toFixed(2),
      previsaoCaixa: {
        caixa: caixa.toFixed(2),
        despesasPorDia: despesasDia.toFixed(2),
        diasRestantes: diasRestantes === 999 ? "∞" : diasRestantes,
      },
      cicloMedio: cicloMedio.toFixed(0),
      clientesVIP: clientesVIPFormatted,
      clientesInativos: clientesInativosFormatted,
      margensPorCategoria: margensDetalhadas.sort((a, b) => parseFloat(b.margem) - parseFloat(a.margem)),
    });
  } catch (err) {
    console.error("Erro ao calcular métricas:", err);
    return NextResponse.json({ error: "Erro ao calcular métricas" }, { status: 500 });
  }
}
