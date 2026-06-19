export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const installment = await prisma.installment.update({
    where: { id },
    data: {
      status,
      paidAt: status === "paid" ? new Date() : null,
    },
  });

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
