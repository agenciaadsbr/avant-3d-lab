export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: any = {};
  if (status) where.status = status;

  const returns = await prisma.return.findMany({
    where,
    include: {
      order: {
        include: {
          user: true,
          items: { include: { product: true } },
        },
      },
    },
    orderBy: { requestedAt: "desc" },
  });

  return NextResponse.json({ returns });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { orderId, reason, amount } = await req.json();

  if (!orderId || !amount) {
    return NextResponse.json({ error: "Faltam campos" }, { status: 400 });
  }

  const devolution = await prisma.return.create({
    data: {
      orderId,
      reason,
      amount,
    },
    include: { order: true },
  });

  return NextResponse.json({ devolution });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id, status } = await req.json();

  const statusMap: { [key: string]: string } = {
    aprovar: "aprovado",
    receber: "recebido",
    reembolsar: "reembolsado",
  };

  const devolution = await prisma.return.update({
    where: { id },
    data: {
      status: statusMap[status] || status,
      ...(status === "aprovar" && { approvedAt: new Date() }),
      ...(status === "receber" && { returnedAt: new Date() }),
      ...(status === "reembolsar" && { reimbursedAt: new Date() }),
    },
  });

  return NextResponse.json({ devolution });
}
