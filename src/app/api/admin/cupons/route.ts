export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const cupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(cupons);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await req.json();
  if (!body.code?.trim()) return NextResponse.json({ error: "Código obrigatório" }, { status: 400 });
  const coupon = await prisma.coupon.create({
    data: {
      code: body.code.trim().toUpperCase(),
      discount: parseFloat(body.discount),
      type: body.type || "percent",
      maxUses: body.maxUses ? parseInt(body.maxUses) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      active: true,
    },
  });
  return NextResponse.json(coupon, { status: 201 });
}
