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

  const { code, discount, maxUses, expiresAt } = await req.json();
  if (!code || !discount) return NextResponse.json({ error: "Código e desconto obrigatórios" }, { status: 400 });

  const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (existing) return NextResponse.json({ error: "Cupom já existe" }, { status: 400 });

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      discount: parseFloat(discount),
      maxUses: maxUses ? parseInt(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });
  return NextResponse.json(coupon);
}
