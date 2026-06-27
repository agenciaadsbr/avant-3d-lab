import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ products: [] });
    }

    console.log("Buscando produtos com:", q);

    const products = await prisma.product.findMany({
      where: {
        active: true,
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      include: { category: true },
      take: 10,
    });

    console.log("Encontrados:", products.length);

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        saleDiscount: p.saleDiscount,
        onSale: p.onSale,
        createdAt: p.createdAt,
        stock: p.stock,
        category: p.category,
      })),
    });
  } catch (error) {
    console.error("Erro na busca de produtos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos", details: (error as any).message },
      { status: 500 }
    );
  }
}
