export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, phone, birthDate, password } = await req.json();

  if (!name || !email || !phone || !birthDate || !password) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  }

  const [existingEmail, existingPhone] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    phone ? prisma.user.findFirst({ where: { phone: phone.replace(/\D/g, "") } }) : null,
  ]);

  if (existingEmail) {
    return NextResponse.json({ error: "Este e-mail já possui cadastro. Faça login para acessar sua conta.", alreadyExists: true }, { status: 409 });
  }

  if (existingPhone) {
    return NextResponse.json({
      error: "Este número de telefone já está vinculado a uma conta. Entre em contato com a loja para acessar seus pedidos.",
      phoneExists: true,
    }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone.replace(/\D/g, ""),
      birthDate: new Date(birthDate),
      password: hashed,
    },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}

