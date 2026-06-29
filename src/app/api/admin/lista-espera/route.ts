export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const lista = await prisma.waitlist.findMany({
    include: { product: { select: { name: true, sku: true, stock: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(lista);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await req.json();
  return NextResponse.json(await prisma.waitlist.update({ where: { id }, data: { notified: true } }));
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await req.json();
  await prisma.waitlist.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
