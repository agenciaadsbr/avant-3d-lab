export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  return NextResponse.json(await prisma.testimonial.update({ where: { id }, data: { active: body.active } }));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
