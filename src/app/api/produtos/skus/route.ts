export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];
  if (!ids.length) return NextResponse.json({});

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, sku: true },
  });

  const result: Record<string, string> = {};
  products.forEach(p => { if (p.sku) result[p.id] = p.sku; });
  return NextResponse.json(result);
}
