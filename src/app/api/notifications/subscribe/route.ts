import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token obrigatório" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Salvar ou atualizar token de notificação
    await prisma.notificationToken.upsert({
      where: { userId: user.id },
      update: { token },
      create: { userId: user.id, token },
    });

    return NextResponse.json({ success: true, message: "Notificações ativadas ✅" });
  } catch (error) {
    console.error("Erro ao inscrever:", error);
    return NextResponse.json(
      { error: "Erro ao salvar token" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { subscribed: false },
        { status: 200 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { notificationToken: { select: { id: true } } },
    });

    return NextResponse.json({
      subscribed: !!user?.notificationToken,
    });
  } catch (error) {
    console.error("Erro ao verificar inscrição:", error);
    return NextResponse.json(
      { subscribed: false },
      { status: 200 }
    );
  }
}
