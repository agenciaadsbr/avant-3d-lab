export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Pega todos os produtos sem custo
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { costPrice: null },
        { costPrice: 0 },
      ],
    },
    select: { id: true, price: true },
  });

  // Atualiza cada produto com 50% do preço de venda
  let updated = 0;
  for (const product of products) {
    const costPrice = product.price * 0.5;
    await prisma.product.update({
      where: { id: product.id },
      data: { costPrice },
    });
    updated++;
  }

  return NextResponse.json({
    success: true,
    message: `${updated} produtos atualizados com custo de 50% do preço de venda`,
    updated,
  });
}
