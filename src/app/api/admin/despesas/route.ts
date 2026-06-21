export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const supplierId = searchParams.get("supplierId");
  const category = searchParams.get("category");
  const cartao = searchParams.get("cartao"); // filtra só cartão por dueDate

  const where: any = {};

  if (cartao) {
    // Aba cartão: filtra por dueDate em vez de date
    where.paymentMethod = "cartao_credito";
    if (from || to) {
      where.dueDate = {};
      if (from) where.dueDate.gte = new Date(from);
      if (to) { const d = new Date(to); d.setHours(23,59,59,999); where.dueDate.lte = d; }
    }
  } else {
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) { const d = new Date(to); d.setHours(23,59,59,999); where.date.lte = d; }
    }
  }

  if (supplierId) where.supplierId = supplierId;
  if (category) where.category = category;

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: cartao ? { dueDate: "asc" } : { date: "desc" },
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
  const { date, description, amount, category, paymentMethod, supplierId, notes, installments, dueDate } = body;

  if (!description?.trim()) return NextResponse.json({ error: "Descrição obrigatória" }, { status: 400 });
  if (!amount || isNaN(amount) || amount <= 0) return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  if (!date) return NextResponse.json({ error: "Data obrigatória" }, { status: 400 });

  const isCard = paymentMethod === "cartao_credito";
  const totalInstallments = isCard && installments > 1 ? parseInt(installments) : 1;
  const installmentAmount = parseFloat((amount / totalInstallments).toFixed(2));
  const groupId = totalInstallments > 1 ? randomUUID() : null;

  if (totalInstallments > 1 && (!dueDate || isCard === false)) {
    return NextResponse.json({ error: "Informe o vencimento da 1ª parcela." }, { status: 400 });
  }

  if (totalInstallments === 1) {
    const expense = await prisma.expense.create({
      data: {
        date: new Date(date), description: description.trim(),
        amount: parseFloat(amount), category: category || "outros",
        paymentMethod: paymentMethod || "pix",
        supplierId: supplierId || null, notes: notes || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        installments: 1, installmentNumber: 1,
      },
      include: { supplier: { select: { id: true, name: true } } },
    });
    return NextResponse.json(expense, { status: 201 });
  }

  // Criar N registros — um por parcela
  const firstDue = new Date(dueDate);
  const created = [];
  for (let i = 0; i < totalInstallments; i++) {
    const due = new Date(firstDue);
    due.setMonth(due.getMonth() + i);
    // Ajuste do último dia do mês
    if (due.getDate() !== firstDue.getDate()) due.setDate(0);

    const isLast = i === totalInstallments - 1;
    const parcAmt = isLast
      ? parseFloat((amount - installmentAmount * (totalInstallments - 1)).toFixed(2))
      : installmentAmount;

    created.push(await prisma.expense.create({
      data: {
        date: new Date(date),
        description: `${description.trim()} (${i + 1}/${totalInstallments})`,
        amount: parcAmt,
        category: category || "outros",
        paymentMethod: "cartao_credito",
        supplierId: supplierId || null,
        notes: notes || null,
        dueDate: due,
        installments: totalInstallments,
        installmentNumber: i + 1,
        groupId,
      },
    }));
  }

  return NextResponse.json(created, { status: 201 });
}
