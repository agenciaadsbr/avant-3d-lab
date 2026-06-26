export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");

  if (!clientId)
    return NextResponse.json({ error: "clientId obrigatório" }, { status: 400 });

  const pedidos = await prisma.order.findMany({
    where: {
      userId: clientId,
      paymentMethod: "caderno",
      paymentStatus: { not: "paid" },
      status: { not: "cancelled" },
    },
    select: { id: true, total: true, dueDate: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ pedidos });
}
