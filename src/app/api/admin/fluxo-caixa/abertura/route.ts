export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MARKER = "__saldo_abertura__";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const entry = await prisma.cashInjection.findFirst({
    where: { description: { startsWith: MARKER } },
    orderBy: { createdAt: "desc" },
  });

  if (!entry) return NextResponse.json({ abertura: null });

  return NextResponse.json({
    abertura: {
      amount: entry.amount,
      date: entry.date.toISOString().split("T")[0],
    },
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { amount, date } = await req.json();
  if (!amount || !date)
    return NextResponse.json({ error: "amount e date são obrigatórios" }, { status: 400 });

  // Remove entrada anterior se existir
  await prisma.cashInjection.deleteMany({ where: { description: { startsWith: MARKER } } });

  const entry = await prisma.cashInjection.create({
    data: {
      amount: parseFloat(amount),
      date: new Date(date + "T00:00:00"),
      description: MARKER,
    },
  });

  return NextResponse.json({ ok: true, id: entry.id });
}
