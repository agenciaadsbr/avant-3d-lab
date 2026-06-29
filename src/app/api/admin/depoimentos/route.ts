export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json(await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await req.json();
  const d = await prisma.testimonial.create({ data: { clientName: body.clientName, text: body.text, rating: parseInt(body.rating) || 5, product: body.product || null, photo: body.photo || null } });
  return NextResponse.json(d, { status: 201 });
}
