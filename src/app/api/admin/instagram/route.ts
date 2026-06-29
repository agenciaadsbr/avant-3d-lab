export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json(await prisma.instagramMetric.findMany({ orderBy: { date: "desc" }, take: 12 }));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await req.json();
  const m = await prisma.instagramMetric.create({
    data: { date: new Date(body.date), followers: parseInt(body.followers), posts: parseInt(body.posts) || 0, reach: parseInt(body.reach) || 0, saves: parseInt(body.saves) || 0, likes: parseInt(body.likes) || 0, notes: body.notes || null },
  });
  return NextResponse.json(m, { status: 201 });
}
