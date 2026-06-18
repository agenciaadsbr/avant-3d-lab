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
  const supplierId = searchParams.get("supplierId");
  const category = searchParams.get("category");

  const where: any = {};
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) { const d = new Date(to); d.setHours(23,59,59,999); where.date.lte = d; }
  }
  if (supplierId) where.supplierId = supplierId;
  if (category) where.category = category;

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
    include: { supplier: { select: { id: true, name: true } } },
  });

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  return NextResponse.json({ expenses, total });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { date, description, amount, category, paymentMethod, supplierId, notes } = body;

  if (!description?.trim()) return NextResponse.json({ error: "Descrição obrigatória" }, { status: 400 });
  if (!amount || isNaN(amount) || amount <= 0) return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  if (!date) return NextResponse.json({ error: "Data obrigatória" }, { status: 400 });

  const expense = await prisma.expense.create({
    data: {
      date: new Date(date),
      description: description.trim(),
      amount: parseFloat(amount),
      category: category || "outros",
      paymentMethod: paymentMethod || "pix",
      supplierId: supplierId || null,
      notes: notes || null,
    },
    include: { supplier: { select: { id: true, name: true } } },
  });
  return NextResponse.json(expense, { status: 201 });
}
