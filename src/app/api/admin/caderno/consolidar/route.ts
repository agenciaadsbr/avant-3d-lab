export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { clientId, parcelas } = await req.json();

  if (!clientId || !parcelas)
    return NextResponse.json({ error: "clientId e parcelas obrigatórios" }, { status: 400 });

  const numParcelas = parseInt(parcelas) || 1;

  const pedidos = await prisma.order.findMany({
    where: {
      userId: clientId,
      paymentMethod: "caderno",
      paymentStatus: { not: "paid" },
      status: { not: "cancelled" },
    },
    select: { id: true, total: true, amountPaid: true },
  });

  if (pedidos.length === 0)
    return NextResponse.json({ error: "Nenhum pedido encontrado" }, { status: 404 });

  // Calcula o total de SALDO PENDENTE (não o total integral)
  const totalDevido = pedidos.reduce((s, p) => s + (p.total - p.amountPaid), 0);
  const valorParcela = totalDevido / numParcelas;

  for (let i = 0; i < pedidos.length; i++) {
    const parcelaIndex = i % numParcelas;
    const d = new Date();
    d.setMonth(d.getMonth() + parcelaIndex + 1);

    await prisma.order.update({
      where: { id: pedidos[i].id },
      data: {
        dueDate: d,
        installmentCount: numParcelas,
      },
    });
  }

  return NextResponse.json({ ok: true, consolidados: pedidos.length, totalDevido });
}
