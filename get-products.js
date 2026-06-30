const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true, name: true },
    take: 3,
  });

  products.forEach(p => console.log(`${p.name}: http://localhost:3000/produtos/${p.slug}`));

  await prisma.$disconnect();
}

main();
