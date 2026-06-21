export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { date, description, amount, category, paymentMethod, supplierId, notes, dueDate, installments } = body;

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      date: new Date(date),
      description, amount: parseFloat(amount),
      category, paymentMethod,
      supplierId: supplierId || null,
      notes: notes || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      installments: parseInt(installments) || 1,
    },
    include: { supplier: { select: { id: true, name: true } } },
  });
  return NextResponse.json(expense);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
