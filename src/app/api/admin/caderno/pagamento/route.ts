export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { clientId, valor, metodo } = await req.json();

  if (!clientId || !valor || valor <= 0)
    return NextResponse.json({ error: "clientId e valor obrigatórios" }, { status: 400 });

  // Busca pedidos em aberto do mais antigo para o mais novo (FIFO)
  const pedidos = await prisma.order.findMany({
    where: {
      userId: clientId,
      paymentMethod: "caderno",
      paymentStatus: { not: "paid" },
      status: { not: "cancelled" },
    },
    select: { id: true, total: true, amountPaid: true },
    orderBy: { createdAt: "asc" },
  });

  if (pedidos.length === 0)
    return NextResponse.json({ error: "Nenhum pedido em aberto" }, { status: 404 });

  let restante = valor;
  const atualizados: string[] = [];

  for (const p of pedidos) {
    if (restante <= 0) break;
    const saldo = p.total - p.amountPaid;
    if (saldo <= 0) continue;

    const pagar = Math.min(restante, saldo);
    const novoAmountPaid = p.amountPaid + pagar;
    const quitado = novoAmountPaid >= p.total - 0.01;

    await prisma.order.update({
      where: { id: p.id },
      data: {
        amountPaid: novoAmountPaid,
        paymentStatus: quitado ? "paid" : "partial",
      },
    });

    restante -= pagar;
    atualizados.push(p.id);
  }

  const valorAplicado = valor - Math.max(0, restante);
  const totalRestante = pedidos.reduce((s, p) => s + (p.total - p.amountPaid), 0) - valor;

  return NextResponse.json({
    ok: true,
    atualizados: atualizados.length,
    valorAplicado,
    saldoRestante: Math.max(0, totalRestante),
  });
}
