const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔍 Buscando produtos com tamanho Único...\n");

    // Buscar todos os produtos
    const produtos = await prisma.product.findMany({
      where: { active: true },
      select: { id: true, name: true, sizes: true, sizeRange: true },
    });

    // Filtrar apenas os que têm "Único" como tamanho
    const produtosUnicos = produtos.filter(p => {
      const sizes = JSON.parse(p.sizes || "[]");
      return sizes.includes("Único") && !p.sizeRange;
    });

    console.log(`📦 Encontrados ${produtosUnicos.length} produtos com tamanho Único\n`);

    if (produtosUnicos.length === 0) {
      console.log("✅ Todos os produtos já estão atualizados!");
      await prisma.$disconnect();
      return;
    }

    // Atualizar todos para PM
    const resultado = await prisma.product.updateMany({
      where: {
        id: { in: produtosUnicos.map(p => p.id) },
      },
      data: { sizeRange: "PM" },
    });

    console.log(`✅ ${resultado.count} produtos atualizados para PM (P/M - 38 ao 42)!\n`);

    // Listar alguns dos atualizados
    console.log("📋 Amostra de produtos atualizados:");
    produtosUnicos.slice(0, 10).forEach(p => {
      console.log(`  ✓ ${p.name}`);
    });

    if (produtosUnicos.length > 10) {
      console.log(`  ... e mais ${produtosUnicos.length - 10}`);
    }

  } catch (error) {
    console.error("❌ Erro:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
