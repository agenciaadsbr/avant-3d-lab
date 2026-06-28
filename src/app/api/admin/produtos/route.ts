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
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { kitItems, ...data } = await req.json();

    const product = await prisma.product.create({ data });

    if (data.isKit && kitItems && kitItems.length > 0) {
      await prisma.kitItem.createMany({
        data: kitItems.map((item: any) => ({ kitId: product.id, productId: item.productId, quantity: item.quantity })),
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error("Erro ao criar produto:", err);
    return NextResponse.json({ error: err.message || "Erro ao criar produto" }, { status: 500 });
  }
}

