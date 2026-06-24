export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { ids, action, value } = await req.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0)
    return NextResponse.json({ error: "IDs inválidos" }, { status: 400 });

  try {
    if (action === "price" && typeof value === "number") {
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { price: value },
      });
    } else if (action === "active" && typeof value === "boolean") {
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { active: value },
      });
    } else {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    return NextResponse.json({ success: true, updated: ids.length });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
