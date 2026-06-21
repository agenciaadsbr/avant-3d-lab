export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Busca todas despesas com paymentMethod "cartao" (da importação antiga)
  const expenses = await prisma.expense.findMany({
    where: { paymentMethod: "cartao" },
  });

  let updated = 0;

  for (const e of expenses) {
    const notes = e.notes || "";
    let dueDate: Date | null = null;

    // Detecta o mês da fatura pelas observações
    if (notes.includes("JUL") || notes.includes("jul")) {
      dueDate = new Date("2026-07-10");
    } else if (notes.includes("AGO") || notes.includes("ago")) {
      dueDate = new Date("2026-08-10");
    } else if (notes.includes("SET") || notes.includes("set")) {
      dueDate = new Date("2026-09-10");
    } else {
      // Sem nota de fatura: usa mês seguinte à data da compra
      const d = new Date(e.date);
      d.setMonth(d.getMonth() + 1);
      d.setDate(10);
      dueDate = d;
    }

    await prisma.expense.update({
      where: { id: e.id },
      data: { paymentMethod: "cartao_credito", dueDate, installments: 1, installmentNumber: 1 },
    });
    updated++;
  }

  return NextResponse.json({ ok: true, updated });
}
