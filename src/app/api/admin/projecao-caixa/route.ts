export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Pega todos os pedidos com saldo em aberto e dueDate definido
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: { not: "paid" },
      status: { not: "cancelled" },
      dueDate: { not: null },
    },
    select: {
      id: true,
      total: true,
      amountPaid: true,
      dueDate: true,
      paymentMethod: true,
      installments: {
        where: { status: { not: "paid" } },
        select: { amount: true, dueDate: true },
      },
    },
  });

  // Agrupa por mês
  const byMonth: Record<string, { total: number; caderno: number; pix: number; cartao: number; count: number }> = {};

  orders.forEach(order => {
    if (order.installments.length > 0) {
      // Tem parcelas
      order.installments.forEach(inst => {
        const monthKey = inst.dueDate.toISOString().substring(0, 7); // YYYY-MM
        if (!byMonth[monthKey]) byMonth[monthKey] = { total: 0, caderno: 0, pix: 0, cartao: 0, count: 0 };
        byMonth[monthKey].total += inst.amount;
        byMonth[monthKey][order.paymentMethod as keyof typeof byMonth[string]] = (byMonth[monthKey][order.paymentMethod as keyof typeof byMonth[string]] || 0) + inst.amount;
        byMonth[monthKey].count++;
      });
    } else {
      // Sem parcelas, usa dueDate do pedido
      const saldo = order.total - order.amountPaid;
      if (saldo > 0 && order.dueDate) {
        const monthKey = order.dueDate.toISOString().substring(0, 7);
        if (!byMonth[monthKey]) byMonth[monthKey] = { total: 0, caderno: 0, pix: 0, cartao: 0, count: 0 };
        byMonth[monthKey].total += saldo;
        byMonth[monthKey][order.paymentMethod as keyof typeof byMonth[string]] = (byMonth[monthKey][order.paymentMethod as keyof typeof byMonth[string]] || 0) + saldo;
        byMonth[monthKey].count++;
      }
    }
  });

  // Retorna os próximos 12 meses
  const now = new Date();
  const months: Array<{ month: string; label: string; total: number; caderno: number; pix: number; cartao: number; count: number }> = [];

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const data = byMonth[monthKey] || { total: 0, caderno: 0, pix: 0, cartao: 0, count: 0 };

    months.push({
      month: monthKey,
      label: d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
      ...data,
    });
  }

  return NextResponse.json({ months });
}
