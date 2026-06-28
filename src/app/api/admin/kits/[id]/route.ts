import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const kit = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        kitItems: { include: { product: true } },
      },
    });

    if (!kit) {
      return NextResponse.json({ error: "Kit não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ kit });
  } catch (err) {
    console.error("Erro ao buscar kit:", err);
    return NextResponse.json({ error: "Erro ao buscar kit" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { productId, quantity } = await req.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "productId e quantity são obrigatórios" },
        { status: 400 }
      );
    }

    await prisma.kitItem.create({
      data: { kitId: id, productId, quantity },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erro ao adicionar item ao kit:", err);
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Este produto já está neste kit" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao adicionar item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { productId } = await req.json();

    await prisma.kitItem.delete({
      where: { kitId_productId: { kitId: id, productId } },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao remover item do kit:", err);
    return NextResponse.json(
      { error: "Erro ao remover item" },
      { status: 500 }
    );
  }
}
