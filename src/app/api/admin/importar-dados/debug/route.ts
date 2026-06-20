export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { active: true, NOT: { slug: "venda-manual" } },
    select: { name: true, price: true, stock: true, sku: true },
    orderBy: { name: "asc" },
  });

  const total = products.reduce((s, p) => s + p.price * p.stock, 0);
  const units = products.reduce((s, p) => s + p.stock, 0);

  return NextResponse.json({
    count: products.length,
    units,
    totalVenda: Math.round(total * 100) / 100,
    products: products.map(p => ({
      name: p.name,
      sku: p.sku,
      price: p.price,
      stock: p.stock,
      subtotal: p.price * p.stock,
    })),
  });
}
