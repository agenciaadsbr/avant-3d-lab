export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const meses: { [key: string]: { receitas: number; despesas: number } } = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mesKey = d.toISOString().slice(0, 7);

      const inicio = new Date(d.getFullYear(), d.getMonth(), 1);
      const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const [orders, despesas, cadernoAgg] = await Promise.all([
        // Vendas normais (não caderno) pagas no mês
        prisma.order.findMany({
          where: {
            status: { not: "cancelled" },
            paymentStatus: { in: ["paid", "partial"] },
            paymentMethod: { not: "caderno" },
            createdAt: { gte: inicio, lte: fim },
          },
          select: { total: true, amountPaid: true, paymentStatus: true },
        }),
        // Despesas do mês
        prisma.expense.aggregate({
          _sum: { amount: true },
          where: { date: { gte: inicio, lte: fim } },
        }),
        // Pagamentos de caderno recebidos no mês
        prisma.cashInjection.aggregate({
          _sum: { amount: true },
          where: {
            description: { startsWith: "Caderno —" },
            date: { gte: inicio, lte: fim },
          },
        }),
      ]);

      const totalVendas = orders.reduce((s, o) =>
        s + (o.paymentStatus === "paid" ? o.total : o.amountPaid), 0);

      meses[mesKey] = {
        receitas: totalVendas + (cadernoAgg._sum.amount || 0),
        despesas: despesas._sum.amount || 0,
      };
    }

    return NextResponse.json({ meses });
  } catch (err) {
    console.error("Erro ao calcular dados mensais:", err);
    return NextResponse.json({ error: "Erro ao calcular" }, { status: 500 });
  }
}
