export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const produtos = await prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { costPrice: null },
        { costPrice: 0 }
      ]
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      costPrice: true,
      stock: true,
    },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({
    total: produtos.length,
    produtos
  });
}
