export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { name, slug } = await req.json();
  if (!name || !slug)
    return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing)
    return NextResponse.json({ error: "Já existe uma categoria com esse nome." }, { status: 409 });

  const category = await prisma.category.create({ data: { name, slug } });
  return NextResponse.json(category, { status: 201 });
}
