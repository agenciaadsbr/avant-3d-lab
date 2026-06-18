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
