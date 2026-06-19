export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const customers = await prisma.user.findMany({
    where: { role: "customer" },
    select: { id: true, name: true, email: true, phone: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { name, email, phone } = await req.json();
  if (!name || !email) return NextResponse.json({ error: "Nome e e-mail obrigatórios" }, { status: 400 });

  const user = await prisma.user.create({
    data: { name, email, phone: phone || null, role: "customer" },
  });
  return NextResponse.json(user, { status: 201 });
}
