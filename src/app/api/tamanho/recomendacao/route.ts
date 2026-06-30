import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

type SizeStats = {
  size: string;
  count: number;
  percentage: number;
};

export async function POST(req: NextRequest) {
  try {
    const { height, weight, bustSize, waistSize } = await req.json();

    if (!height || !weight) {
      return NextResponse.json(
        { error: "Altura e peso são obrigatórios" },
        { status: 400 }
      );
    }

    // Recomendação simples baseada em altura e peso
    let recommendedSize = "M";
    const bmi = weight / ((height / 100) ** 2);

    if (height < 155) {
      recommendedSize = "P";
    } else if (height > 175) {
      recommendedSize = "G";
    } else if (bmi < 20) {
      recommendedSize = "P";
    } else if (bmi > 27) {
      recommendedSize = "G";
    }

    // Buscar estatísticas de clientes com medidas similares
    const similarClients = await prisma.userSizePreference.findMany({
      where: {
        height: {
          gte: height - 5,
          lte: height + 5,
        },
        weight: {
          gte: weight - 5,
          lte: weight + 5,
        },
      },
      select: { preferredSize: true },
    });

    // Calcular distribuição de tamanhos
    const sizeDistribution: Record<string, number> = { P: 0, M: 0, G: 0 };
    similarClients.forEach((client) => {
      if (client.preferredSize && sizeDistribution[client.preferredSize] !== undefined) {
        sizeDistribution[client.preferredSize]++;
      }
    });

    const totalSimilar = Object.values(sizeDistribution).reduce((a, b) => a + b, 0);
    const stats: SizeStats[] = totalSimilar > 0
      ? [
          { size: "P", count: sizeDistribution.P, percentage: Math.round((sizeDistribution.P / totalSimilar) * 100) },
          { size: "M", count: sizeDistribution.M, percentage: Math.round((sizeDistribution.M / totalSimilar) * 100) },
          { size: "G", count: sizeDistribution.G, percentage: Math.round((sizeDistribution.G / totalSimilar) * 100) },
        ]
      : [
          { size: "P", count: 0, percentage: 0 },
          { size: "M", count: 0, percentage: 0 },
          { size: "G", count: 0, percentage: 0 },
        ];

    // Se usuário está logado, salvar as preferências
    const session = await getServerSession();
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        await prisma.userSizePreference.upsert({
          where: { userId: user.id },
          update: {
            height,
            weight,
            bustSize: bustSize || null,
            waistSize: waistSize || null,
            preferredSize: recommendedSize,
          },
          create: {
            userId: user.id,
            height,
            weight,
            bustSize: bustSize || null,
            waistSize: waistSize || null,
            preferredSize: recommendedSize,
          },
        });
      }
    }

    return NextResponse.json({
      recommendedSize,
      stats,
      similarClientsCount: totalSimilar,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao processar recomendação" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { sizePreference: true },
    });

    if (!user?.sizePreference) {
      return NextResponse.json(
        { error: "Sem preferências salvas" },
        { status: 404 }
      );
    }

    return NextResponse.json(user.sizePreference);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar preferências" },
      { status: 500 }
    );
  }
}
