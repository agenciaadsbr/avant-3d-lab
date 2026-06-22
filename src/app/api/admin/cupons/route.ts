export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const cupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  // Buscar estatísticas de uso por cupom
  const stats = await prisma.order.groupBy({
    by: ["couponCode"],
    where: { couponCode: { not: null }, status: { not: "cancelled" } },
    _count: { id: true },
    _sum: { total: true },
  });

  const statsMap = Object.fromEntries(
    stats.filter(s => s.couponCode).map(s => [s.couponCode!, { count: s._count.id, total: s._sum.total || 0 }])
  );

  const result = cupons.map(c => ({
    ...c,
    usageCount: statsMap[c.code]?.count || 0,
    usageTotal: statsMap[c.code]?.total || 0,
  }));

  return NextResponse.json(result);
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
