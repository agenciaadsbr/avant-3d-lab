export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { productId, name, phone } = await req.json();
  if (!productId || !name || !phone) return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  const w = await prisma.waitlist.create({ data: { productId, name, phone } });
  return NextResponse.json(w, { status: 201 });
}
