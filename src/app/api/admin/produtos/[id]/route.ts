import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { conjuntoItems, ...data } = await req.json();

    const product = await prisma.product.update({ where: { id }, data });

    if (data.isConjunto) {
      await prisma.conjuntoItem.deleteMany({ where: { conjuntoId: id } });
      if (conjuntoItems && conjuntoItems.length > 0) {
        await prisma.conjuntoItem.createMany({
          data: conjuntoItems.map((item: any) => ({
            conjuntoId: id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            stock: item.stock || 0,
          })),
        });
      }
    } else {
      await prisma.conjuntoItem.deleteMany({ where: { conjuntoId: id } });
    }

    return NextResponse.json(product);
  } catch (err: any) {
    console.error("Erro ao atualizar produto:", err);
    return NextResponse.json({ error: err.message || "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ success: true });
}
