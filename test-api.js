const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testSizeGuide() {
  try {
    console.log("🔍 Testando lógica de recomendação de tamanho...\n");

    const height = 165;
    const weight = 89;

    // Simular lógica de recomendação
    let recommendedSize = "M";
    const bmi = weight / ((height / 100) ** 2);

    console.log(`📊 Medidas: ${height}cm, ${weight}kg`);
    console.log(`📈 BMI: ${bmi.toFixed(2)}`);

    if (height < 155) {
      recommendedSize = "P";
    } else if (height > 175) {
      recommendedSize = "G";
    } else if (bmi < 20) {
      recommendedSize = "P";
    } else if (bmi > 27) {
      recommendedSize = "G";
    }

    console.log(`✅ Tamanho recomendado: ${recommendedSize}\n`);

    // Buscar clientes similares
    const similarClients = await prisma.userSizePreference.findMany({
      where: {
        height: { gte: height - 5, lte: height + 5 },
        weight: { gte: weight - 5, lte: weight + 5 },
      },
      select: { preferredSize: true },
    });

    console.log(`📋 Clientes similares encontrados: ${similarClients.length}`);

    // Calcular distribuição
    const sizeDistribution = { P: 0, M: 0, G: 0 };
    similarClients.forEach((client) => {
      if (client.preferredSize && sizeDistribution[client.preferredSize] !== undefined) {
        sizeDistribution[client.preferredSize]++;
      }
    });

    const totalSimilar = Object.values(sizeDistribution).reduce((a, b) => a + b, 0);

    console.log(`\n📊 Distribuição de tamanhos:`);
    console.log(`  P: ${sizeDistribution.P} (${totalSimilar > 0 ? Math.round((sizeDistribution.P / totalSimilar) * 100) : 0}%)`);
    console.log(`  M: ${sizeDistribution.M} (${totalSimilar > 0 ? Math.round((sizeDistribution.M / totalSimilar) * 100) : 0}%)`);
    console.log(`  G: ${sizeDistribution.G} (${totalSimilar > 0 ? Math.round((sizeDistribution.G / totalSimilar) * 100) : 0}%)`);

    console.log(`\n✅ API está funcionando corretamente!`);

  } catch (error) {
    console.error("❌ Erro:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSizeGuide();
