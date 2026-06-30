import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Produtos totais
    const products = await prisma.product.findMany({
      where: { active: true, NOT: { slug: "venda-manual" } },
      include: { _count: { select: { orderItems: true } } },
    });

    const productStats = await Promise.all(
      products.map(async (product) => {
        // Vendas do produto
        const orderItems = await prisma.orderItem.findMany({
          where: { productId: product.id },
          orderBy: { id: "asc" },
          take: 1,
        });

        const totalSold = await prisma.orderItem.aggregate({
          where: { productId: product.id },
          _sum: { quantity: true },
        });

        // Primeira venda
        const firstSale = await prisma.order.findFirst({
          where: { items: { some: { productId: product.id } } },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        });

        const sold = totalSold._sum.quantity || 0;
        const daysActive = firstSale
          ? Math.max(1, Math.floor((Date.now() - firstSale.createdAt.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        return {
          id: product.id,
          name: product.name,
          stock: product.stock,
          sold,
          daysActive,
          velocidade: daysActive > 0 ? (sold / daysActive).toFixed(2) : "0.00",
          rotatividade: sold > 0 ? Math.round((sold / (sold + product.stock)) * 100) : 0,
        };
      })
    );

    // Componentes de Conjuntos
    const componentsStats = await Promise.all(
      (
        await prisma.conjuntoItem.findMany({
          include: { conjunto: true },
        })
      ).map(async (comp) => {
        const totalSold = await prisma.orderItem.aggregate({
          where: { productId: comp.conjuntoId, componentName: comp.name },
          _sum: { quantity: true },
        });

        const firstSale = await prisma.order.findFirst({
          where: { items: { some: { productId: comp.conjuntoId, componentName: comp.name } } },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        });

        const sold = totalSold._sum.quantity || 0;
        const daysActive = firstSale
          ? Math.max(1, Math.floor((Date.now() - firstSale.createdAt.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        return {
          id: comp.id,
          name: `${comp.conjunto.name} - ${comp.name}`,
          stock: comp.stock || 0,
          sold,
          daysActive,
          velocidade: daysActive > 0 ? (sold / daysActive).toFixed(2) : "0.00",
          rotatividade: sold > 0 ? Math.round((sold / (sold + (comp.stock || 0))) * 100) : 0,
        };
      })
    );

    // Ordenar por velocidade
    const allStats = [...productStats, ...componentsStats].sort(
      (a, b) => parseFloat(b.velocidade) - parseFloat(a.velocidade)
    );

    return NextResponse.json({
      products: productStats.sort((a, b) => parseFloat(b.velocidade) - parseFloat(a.velocidade)),
      components: componentsStats.sort((a, b) => parseFloat(b.velocidade) - parseFloat(a.velocidade)),
      all: allStats,
    });
  } catch (err) {
    console.error("Erro ao calcular giro de estoque:", err);
    return NextResponse.json({ error: "Erro ao calcular giro de estoque" }, { status: 500 });
  }
}
