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
  const before = await prisma.installment.findUnique({ where: { id }, select: { status: true } });
  const data: Record<string, unknown> = {};
  if (body.status !== undefined) { data.status = body.status; data.paidAt = body.status === "paid" ? new Date() : null; }
  if (body.dueDate !== undefined) data.dueDate = new Date(body.dueDate);
  if (body.amount !== undefined) data.amount = body.amount;

  const installment = await prisma.installment.update({ where: { id }, data });

  // Registra ou reverte o pagamento no razão conforme a mudança de status da parcela
  if (body.status !== undefined && body.status !== before?.status) {
    if (body.status === "paid") {
      const order = await prisma.order.findUnique({ where: { id: installment.orderId }, select: { paymentMethod: true } });
      await prisma.payment.create({
        data: { orderId: installment.orderId, installmentId: installment.id, amount: installment.amount, paymentMethod: order?.paymentMethod || "pix" },
      });
    } else if (before?.status === "paid") {
      const lastPayment = await prisma.payment.findFirst({ where: { installmentId: installment.id }, orderBy: { createdAt: "desc" } });
      if (lastPayment) await prisma.payment.delete({ where: { id: lastPayment.id } });
    }
  }

  // Recalculate order paymentStatus based on installments
  const allInstallments = await prisma.installment.findMany({
    where: { orderId: installment.orderId },
  });
  const allPaid = allInstallments.every(i => i.status === "paid");
  const anyPaid = allInstallments.some(i => i.status === "paid");
  const amountPaid = allInstallments.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  await prisma.order.update({
    where: { id: installment.orderId },
    data: {
      paymentStatus: allPaid ? "paid" : anyPaid ? "partial" : "pending",
      amountPaid,
    },
  });

  return NextResponse.json(installment);
}
