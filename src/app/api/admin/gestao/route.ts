export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Listar usuários admin
export async function GET() {
  const session = await auth();
  const user = session?.user as any;
  if (!session || user?.role !== "admin" || user?.adminRole === "vendedor")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: { id: true, name: true, email: true, adminRole: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ admins });
}

// Adicionar ou atualizar usuário admin
export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as any;
  if (!session || user?.role !== "admin" || user?.adminRole === "vendedor")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { email, adminRole } = await req.json();
  if (!email || !adminRole) return NextResponse.json({ error: "email e adminRole obrigatórios" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    // Cria usuário novo com acesso admin
    const novo = await prisma.user.create({
      data: { email, role: "admin", adminRole, name: email.split("@")[0] },
    });
    return NextResponse.json({ ok: true, user: novo });
  }

  // Atualiza usuário existente
  const atualizado = await prisma.user.update({
    where: { email },
    data: { role: "admin", adminRole },
    select: { id: true, name: true, email: true, adminRole: true },
  });

  return NextResponse.json({ ok: true, user: atualizado });
}

// Remover acesso admin
export async function DELETE(req: Request) {
  const session = await auth();
  const user = session?.user as any;
  if (!session || user?.role !== "admin" || user?.adminRole === "vendedor")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  // Não pode remover a si mesmo
  if (id === user.id) return NextResponse.json({ error: "Não pode remover seu próprio acesso" }, { status: 400 });

  await prisma.user.update({
    where: { id },
    data: { role: "customer", adminRole: null },
  });

  return NextResponse.json({ ok: true });
}
