import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const kits = await prisma.product.findMany({
      where: { isKit: true, active: true },
      include: {
        category: true,
        kitItems: { include: { product: true } },
      },
    });

    return NextResponse.json({ kits });
  } catch (err) {
    console.error("Erro ao buscar kits:", err);
    return NextResponse.json({ error: "Erro ao buscar kits" }, { status: 500 });
  }
}
