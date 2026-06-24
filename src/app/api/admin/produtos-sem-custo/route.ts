export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Pega todos os itens de pedidos que não foram cancelados
  const orders = await prisma.order.findMany({
    where: { status: { not: "cancelled" } },
    include: { items: { include: { product: true } } },
  });

  // Agrupa por produto aqueles que não têm cost price
  const productosSemCusto: Record<string, {
    id: string;
    name: string;
    quantity: number;
    count: number;
    priceRange: { min: number; max: number };
  }> = {};

  orders.forEach(order => {
    order.items.forEach(item => {
      const custo = item.costPrice ?? item.product.costPrice;
      if (custo === null || custo === undefined) {
        if (!productosSemCusto[item.productId]) {
          productosSemCusto[item.productId] = {
            id: item.productId,
            name: item.product.name,
            quantity: 0,
            count: 0,
            priceRange: { min: item.price, max: item.price },
          };
        }
        productosSemCusto[item.productId].quantity += item.quantity;
        productosSemCusto[item.productId].count += 1;
        productosSemCusto[item.productId].priceRange.min = Math.min(
          productosSemCusto[item.productId].priceRange.min,
          item.price
        );
        productosSemCusto[item.productId].priceRange.max = Math.max(
          productosSemCusto[item.productId].priceRange.max,
          item.price
        );
      }
    });
  });

  const result = Object.values(productosSemCusto).sort((a, b) => b.quantity - a.quantity);

  return NextResponse.json({
    products: result,
    total: result.reduce((s, p) => s + p.quantity, 0),
    count: result.length,
  });
}
