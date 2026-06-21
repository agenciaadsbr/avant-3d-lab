export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const { costPrice } = await req.json();

  const item = await prisma.orderItem.update({
    where: { id },
    data: { costPrice: costPrice !== null && costPrice !== "" ? parseFloat(costPrice) : null },
  });
  return NextResponse.json(item);
}
