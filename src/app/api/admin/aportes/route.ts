export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const where: any = {};
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) { const d = new Date(to); d.setHours(23,59,59,999); where.date.lte = d; }
  }
  const aportes = await prisma.cashInjection.findMany({ where, orderBy: { date: "desc" } });
  const total = aportes.reduce((s, a) => s + a.amount, 0);
  return NextResponse.json({ aportes, total });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { amount, date, description } = await req.json();
  const aporte = await prisma.cashInjection.create({
    data: { amount: parseFloat(amount), date: new Date(date), description: description || null },
  });
  return NextResponse.json(aporte, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await req.json();
  await prisma.cashInjection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
