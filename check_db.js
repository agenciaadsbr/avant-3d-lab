const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const total = await prisma.product.count();
    const active = await prisma.product.count({ where: { active: true } });

    console.log(`Total de produtos: ${total}`);
    console.log(`Produtos ativos: ${active}`);

    if (active > 0) {
      const samples = await prisma.product.findMany({
        where: { active: true },
        select: { name: true, price: true, active: true },
        take: 3,
      });
      console.log("\nExemplos:");
      samples.forEach(p => console.log(`- ${p.name} (R$ ${p.price})`));
    }
  } catch (err) {
    console.error("Erro:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
