import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Vendas por componente
    const componentSales = await prisma.orderItem.groupBy({
      by: ["componentName", "productId"],
      where: { componentName: { not: null } },
      _sum: { quantity: true, price: true },
      _count: { id: true },
    });

    // Enriquecer com nome do produto
    const enrichedSales = await Promise.all(
      componentSales.map(async (sale) => {
        const product = await prisma.product.findUnique({
          where: { id: sale.productId },
          select: { name: true },
        });
        return {
          componentName: sale.componentName,
          productName: product?.name,
          quantity: sale._sum.quantity || 0,
          revenue: sale._sum.price || 0,
          orders: sale._count,
        };
      })
    );

    // Ordenar por revenue
    enrichedSales.sort((a, b) => (b.revenue || 0) - (a.revenue || 0));

    return NextResponse.json({
      componentSales: enrichedSales,
      totalRevenue: enrichedSales.reduce((sum, s) => sum + (s.revenue || 0), 0),
      totalQuantity: enrichedSales.reduce((sum, s) => sum + (s.quantity || 0), 0),
    });
  } catch (err) {
    console.error("Erro ao gerar relatório de componentes:", err);
    return NextResponse.json(
      { error: "Erro ao gerar relatório" },
      { status: 500 }
    );
  }
}
