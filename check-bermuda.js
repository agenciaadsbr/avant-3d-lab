const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const bermuda = await prisma.product.findUnique({
    where: { slug: "bermuda-bicolor-marrom-unico" },
    select: { name: true, slug: true, sizeRange: true, sizes: true },
  });

  console.log("🔍 Bermuda Bicolor:");
  console.log(JSON.stringify(bermuda, null, 2));

  await prisma.$disconnect();
}

main();
