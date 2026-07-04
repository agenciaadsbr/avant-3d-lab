export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const url = new URL(req.url);
  const fila = url.searchParams.get("fila"); // "3d" | "24h" | "7d" | "30d"
  const now = new Date();

  if (fila === "3d") {
    const limite = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const orders = await prisma.order.findMany({
      where: { status: "delivered", deliveredAt: { lte: limite, not: null }, followUpSentAt: null },
      include: { user: { select: { id: true, name: true, phone: true } }, items: { select: { quantity: true, size: true, componentName: true, product: { select: { name: true } } } } },
      orderBy: { deliveredAt: "asc" }, take: 50,
    });
    return NextResponse.json({ orders });
  }

  if (fila === "24h") {
    const limite = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const orders = await prisma.order.findMany({
      where: { paymentStatus: "paid", status: { not: "cancelled" }, createdAt: { lte: limite }, thanks24hSentAt: null },
      include: { user: { select: { id: true, name: true, phone: true } }, items: { select: { quantity: true, size: true, componentName: true, product: { select: { name: true } } } } },
      orderBy: { createdAt: "asc" }, take: 50,
    });
    return NextResponse.json({ orders });
  }

  if (fila === "7d") {
    const limite = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const orders = await prisma.order.findMany({
      where: { status: "delivered", deliveredAt: { lte: limite, not: null }, feedback7dSentAt: null },
      include: { user: { select: { id: true, name: true, phone: true } }, items: { select: { quantity: true, size: true, componentName: true, product: { select: { name: true } } } } },
      orderBy: { deliveredAt: "asc" }, take: 50,
    });
    return NextResponse.json({ orders });
  }

  if (fila === "30d") {
    const limite = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const orders = await prisma.order.findMany({
      where: { status: "delivered", deliveredAt: { lte: limite, not: null }, reengage30dSentAt: null },
      include: { user: { select: { id: true, name: true, phone: true } }, items: { select: { quantity: true, size: true, componentName: true, product: { select: { name: true } } } } },
      orderBy: { deliveredAt: "asc" }, take: 50,
    });
    return NextResponse.json({ orders });
  }

  return NextResponse.json({ error: "fila inválida" }, { status: 400 });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id, fila } = await req.json();
  const campo =
    fila === "3d"  ? "followUpSentAt" :
    fila === "24h" ? "thanks24hSentAt" :
    fila === "7d"  ? "feedback7dSentAt" :
                     "reengage30dSentAt";

  await prisma.order.update({ where: { id }, data: { [campo]: new Date() } });
  return NextResponse.json({ ok: true });
}
