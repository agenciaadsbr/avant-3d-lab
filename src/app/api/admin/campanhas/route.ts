export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const campanhas = await prisma.campaign.findMany({ orderBy: { startDate: "desc" } });
  return NextResponse.json(campanhas);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await req.json();
  const campanha = await prisma.campaign.create({
    data: {
      name: body.name, channel: body.channel || "instagram",
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      budget: body.budget ? parseFloat(body.budget) : null,
      result: body.result || null, notes: body.notes || null,
    },
  });
  return NextResponse.json(campanha, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await req.json();
  const campanha = await prisma.campaign.update({
    where: { id: body.id },
    data: {
      name: body.name, channel: body.channel,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      budget: body.budget ? parseFloat(body.budget) : null,
      result: body.result || null, notes: body.notes || null,
      active: body.active,
    },
  });
  return NextResponse.json(campanha);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await req.json();
  await prisma.campaign.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
