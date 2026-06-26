export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const url = new URL(req.url);
  const month = url.searchParams.get("month");

  if (!month)
    return NextResponse.json({ error: "month obrigatório (YYYY-MM)" }, { status: 400 });

  const [year, monthNum] = month.split("-").map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);

  const pedidos = await prisma.order.findMany({
    where: {
      paymentMethod: "caderno",
      status: { not: "cancelled" },
      dueDate: { gte: startDate, lte: endDate },
    },
    select: {
      id: true,
      total: true,
      amountPaid: true,
      dueDate: true,
      user: { select: { name: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const pedidosFormatted = pedidos.map(p => ({
    id: p.id,
    clientName: p.user.name || "—",
    total: p.total,
    amountPaid: p.amountPaid,
    dueDate: p.dueDate ? new Date(p.dueDate).toLocaleDateString("pt-BR") : "—",
  }));

  return NextResponse.json({ pedidos: pedidosFormatted });
}
