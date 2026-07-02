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

    // Buscar usuário com birthDate
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, birthDate: true, birthdayCouponYear: true },
    });

    if (!user || !user.birthDate) {
      return NextResponse.json(
        { error: "Data de nascimento não configurada" },
        { status: 400 }
      );
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const clientBirthday = new Date(user.birthDate);
    const clientBirthdayThisYear = new Date(
      currentYear,
      clientBirthday.getMonth(),
      clientBirthday.getDate()
    );

    // Verificar se é aniversário este mês
    const isAniversarioEteMes =
      today.getMonth() === clientBirthdayThisYear.getMonth();

    // Verificar se já recebeu cupom este ano
    const jaRecebeuEsteAno = user.birthdayCouponYear === currentYear;

    if (!isAniversarioEteMes) {
      return NextResponse.json(
        { error: "Não é seu mês de aniversário" },
        { status: 400 }
      );
    }

    if (jaRecebeuEsteAno) {
      return NextResponse.json(
        { error: "Você já recebeu o cupom de aniversário este ano" },
        { status: 400 }
      );
    }

    // Gerar código do cupom
    const codigoCupom = `BDAY${user.id.substring(0, 8).toUpperCase()}${currentYear}`;
    const desconto = 15; // 15% de desconto

    // Calcular último dia do mês de aniversário
    const proximoMes = new Date(currentYear, clientBirthdayThisYear.getMonth() + 1, 0);
    const ultimoDiaDoMes = new Date(currentYear, clientBirthdayThisYear.getMonth() + 1, 0, 23, 59, 59);

    // Criar cupom
    const cupom = await prisma.coupon.create({
      data: {
        code: codigoCupom,
        discount: desconto,
        type: "percent",
        maxUses: 1,
        expiresAt: ultimoDiaDoMes, // Expira último dia do mês de aniversário
        active: true,
      },
    });

    // Atualizar usuário com ano do cupom
    await prisma.user.update({
      where: { id: user.id },
      data: { birthdayCouponYear: currentYear },
    });

    // Enviar notificação se usuário estiver inscrito
    try {
      const notificationToken = await prisma.notificationToken.findUnique({
        where: { userId: user.id },
      });

      if (notificationToken?.token) {
        console.log(`📱 Notificação de cupom de aniversário será enviada para: ${user.id}`);
        // Firebase Admin SDK será integrado aqui
      }
    } catch (notifError) {
      console.error("Erro ao enviar notificação:", notifError);
    }

    return NextResponse.json({
      cupom: {
        codigo: cupom.code,
        desconto: cupom.discount,
        tipo: "Cupom de Aniversário",
        msg: `🎂 Parabéns! Você ganhou ${desconto}% de desconto! Use o código: ${cupom.code}`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao gerar cupom" },
      { status: 500 }
    );
  }
}

// GET - verificar se tem cupom disponível
export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { disponivel: false, msg: "Não autenticado" },
        { status: 200 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { birthDate: true, birthdayCouponYear: true },
    });

    if (!user || !user.birthDate) {
      return NextResponse.json(
        { disponivel: false, msg: "Data de nascimento não configurada" },
        { status: 200 }
      );
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const clientBirthday = new Date(user.birthDate);
    const isAniversarioEsteMes =
      today.getMonth() === clientBirthday.getMonth();

    const jaRecebeuEsteAno = user.birthdayCouponYear === currentYear;

    if (isAniversarioEsteMes && !jaRecebeuEsteAno) {
      return NextResponse.json({
        disponivel: true,
        msg: "Você tem um cupom de aniversário disponível! 🎂",
      });
    }

    return NextResponse.json({
      disponivel: false,
      msg: "Nenhum cupom disponível no momento",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { disponivel: false, msg: "Erro ao verificar cupom" },
      { status: 200 }
    );
  }
}
