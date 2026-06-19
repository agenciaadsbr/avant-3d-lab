export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const products = await prisma.product.findMany({
    where: {
      active: true,
      stock: { gt: 0 },
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    select: { id: true, name: true, price: true, stock: true, sizes: true, images: true },
    orderBy: { name: "asc" },
    take: 10,
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });
  }

  const data = await req.json();

  const product = await prisma.product.create({ data });
  return NextResponse.json(product, { status: 201 });
}

