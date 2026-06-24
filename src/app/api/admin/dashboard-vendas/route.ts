export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Últimos 12 meses
  const now = new Date();
  const months: { date: string; label: string; revenue: number; count: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    const dateStr = date.toISOString().slice(0, 7);

    const orders = await prisma.order.findMany({
      where: {
        status: { not: "cancelled" },
        createdAt: { gte: date, lt: nextMonth },
      },
      select: { total: true },
    });

    const revenue = orders.reduce((s, o) => s + o.total, 0);
    months.push({ date: dateStr, label, revenue, count: orders.length });
  }

  // Categorias mais vendidas
  const items = await prisma.orderItem.findMany({
    include: { product: { include: { category: true } } },
    where: { order: { status: { not: "cancelled" } } },
  });

  const byCat: Record<string, { name: string; quantity: number; revenue: number }> = {};
  items.forEach(item => {
    const catId = item.product.categoryId;
    const catName = item.product.category.name;
    if (!byCat[catId]) byCat[catId] = { name: catName, quantity: 0, revenue: 0 };
    byCat[catId].quantity += item.quantity;
    byCat[catId].revenue += item.price * item.quantity;
  });

  const byCategory = Object.values(byCat).sort((a, b) => b.revenue - a.revenue);

  // Produtos mais vendidos
  const byProduct: Record<string, { name: string; quantity: number; revenue: number }> = {};
  items.forEach(item => {
    const prodId = item.productId;
    if (!byProduct[prodId]) byProduct[prodId] = { name: item.product.name, quantity: 0, revenue: 0 };
    byProduct[prodId].quantity += item.quantity;
    byProduct[prodId].revenue += item.price * item.quantity;
  });

  const byProductList = Object.values(byProduct).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  return NextResponse.json({
    months,
    byCategory,
    byProduct: byProductList,
  });
}
