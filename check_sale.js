const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const today = new Date();
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

    const oldProducts = await prisma.product.count({
      where: { active: true, createdAt: { lte: sixtyDaysAgo } },
    });

    const onSaleProducts = await prisma.product.count({
      where: { active: true, onSale: true },
    });

    console.log(`Produtos com 60+ dias: ${oldProducts}`);
    console.log(`Produtos em SALE (onSale=true): ${onSaleProducts}`);

    if (onSaleProducts > 0) {
      const samples = await prisma.product.findMany({
        where: { onSale: true },
        select: { name: true, saleDiscount: true },
        take: 3,
      });
      console.log("\nProdutos em SALE:");
      samples.forEach(p => console.log(`- ${p.name} (${p.saleDiscount}% OFF)`));
    }
  } catch (err) {
    console.error("Erro:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
