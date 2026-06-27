const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const termos = ["bermuda", "top", "short", "legging"];

    for (const termo of termos) {
      const results = await prisma.product.findMany({
        where: {
          active: true,
          name: { contains: termo, mode: "insensitive" },
        },
        select: { name: true, price: true },
        take: 2,
      });
      console.log(`\n"${termo}": ${results.length} resultado(s)`);
      results.forEach(p => console.log(`  - ${p.name}`));
    }
  } catch (err) {
    console.error("Erro:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
