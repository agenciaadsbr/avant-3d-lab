export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const refs = await prisma.referral.findMany({
    include: {
      referrer: { select: { name: true, phone: true } },
      referred: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(refs);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { referrerId, referredId } = await req.json();
  const ref = await prisma.referral.create({ data: { referrerId, referredId, status: "confirmed" } });
  return NextResponse.json(ref, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id, rewardGiven } = await req.json();
  return NextResponse.json(await prisma.referral.update({ where: { id }, data: { rewardGiven } }));
}
