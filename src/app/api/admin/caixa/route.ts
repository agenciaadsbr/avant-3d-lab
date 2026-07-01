export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Receitas recebidas no período
export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const startDate = from ? new Date(from + "T00:00:00") : new Date("2020-01-01");
  const endDate = to ? new Date(to + "T23:59:59") : new Date();

  // Vendas normais (não caderno) pagas no período — usa total quando paid, amountPaid quando partial
  const orders = await prisma.order.findMany({
    where: {
      status: { not: "cancelled" },
      paymentStatus: { in: ["paid", "partial"] },
      paymentMethod: { not: "caderno" },
      createdAt: { gte: startDate, lte: endDate },
    },
    select: { total: true, amountPaid: true, paymentStatus: true },
  });

  const totalVendas = orders.reduce((s, o) =>
    s + (o.paymentStatus === "paid" ? o.total : o.amountPaid), 0);

  // Pagamentos recebidos do caderno no período (registrados como CashInjection)
  const cadernoResult = await prisma.cashInjection.aggregate({
    _sum: { amount: true },
    where: {
      description: { startsWith: "Caderno —" },
      date: { gte: startDate, lte: endDate },
    },
  });

  const totalCaderno = cadernoResult._sum.amount || 0;

  return NextResponse.json({ total: totalVendas + totalCaderno });
}
