export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Código obrigatório" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.active)
    return NextResponse.json({ error: "Cupom inválido ou inativo" }, { status: 404 });

  if (coupon.expiresAt && new Date() > coupon.expiresAt)
    return NextResponse.json({ error: "Cupom expirado" }, { status: 400 });

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses)
    return NextResponse.json({ error: "Cupom esgotado" }, { status: 400 });

  return NextResponse.json({ code: coupon.code, discount: coupon.discount, type: coupon.type });
}
