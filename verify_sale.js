const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    // Buscar Bermuda Bicolor
    const bermuda = await prisma.product.findFirst({
      where: { name: { contains: "Bermuda Bicolor", mode: "insensitive" } },
      select: { id: true, name: true, onSale: true, saleDiscount: true, active: true },
    });

    console.log("Bermuda encontrada:", bermuda);

    if (bermuda) {
      console.log(`\nDetalhes:`);
      console.log(`- Nome: ${bermuda.name}`);
      console.log(`- onSale: ${bermuda.onSale}`);
      console.log(`- saleDiscount: ${bermuda.saleDiscount}`);
      console.log(`- active: ${bermuda.active}`);
    }

    // Contar todos com onSale = true
    const saleCount = await prisma.product.count({ where: { onSale: true } });
    console.log(`\nTotal com onSale=true: ${saleCount}`);
  } catch (err) {
    console.error("Erro:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
