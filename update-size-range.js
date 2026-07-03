const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Atualizar Bermuda Bicolor para PM (P/M)
  await prisma.product.updateMany({
    where: { name: { contains: "Bermuda" } },
    data: { sizeRange: "PM" },
  });

  console.log("✅ Bermudas atualizadas para PM (P/M - 38 ao 42)");

  // Atualizar shorts para GGG (G/GG)
  await prisma.product.updateMany({
    where: { name: { contains: "Short" } },
    data: { sizeRange: "GGG" },
  });

  console.log("✅ Shorts atualizados para GGG (G/GG - 42 ao 48)");

  // Listar alguns produtos
  const produtos = await prisma.product.findMany({
    where: { active: true },
    select: { name: true, sizeRange: true },
    take: 5,
  });

  console.log("\n📋 Amostra de produtos:");
  produtos.forEach(p => console.log(`  ${p.name} → ${p.sizeRange || "não definido"}`));

  await prisma.$disconnect();
}

main();
