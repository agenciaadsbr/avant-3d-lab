export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json(await prisma.goal.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }] }));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { month, year, target } = await req.json();
  const goal = await prisma.goal.upsert({
    where: { month_year: { month: parseInt(month), year: parseInt(year) } },
    update: { target: parseFloat(target) },
    create: { month: parseInt(month), year: parseInt(year), target: parseFloat(target) },
  });
  return NextResponse.json(goal);
}
