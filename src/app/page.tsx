import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [heroProducts, featuredProducts, newArrivals, saleProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { featuredHero: true, active: true },
      include: { category: true },
      take: 4,
    }),
    prisma.product.findMany({
      where: { featured: true, active: true },
      include: { category: true },
      take: 4,
    }),
    prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { createdAt: { lte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } },
          { onSale: true },
        ],
      },
      include: { category: true },
      orderBy: { createdAt: "asc" },
      take: 8,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const displayHeroProducts = heroProducts.length >= 4 ? heroProducts : newArrivals.slice(0, 4);
  const displayFeaturedProducts = featuredProducts.length >= 4 ? featuredProducts : newArrivals.slice(4, 8);
  const displaySaleProducts = saleProducts.slice(0, 8);

  const categoryIcons: Record<string, string> = {
    "Conjuntos": "👗", "Leggings": "🩱", "Tops": "👙",
    "Macaquinhos": "🤸", "Macacões": "🦋", "Camisetas": "👕",
    "Shorts": "🩳", "Jaquetas": "🧥", "Casacos": "🧣",
  };

  return (
    <HomeClient
      newArrivals={newArrivals}
      heroProducts={displayHeroProducts}
      featuredProducts={displayFeaturedProducts}
      saleProducts={displaySaleProducts}
      categories={categories}
      categoryIcons={categoryIcons}
    />
  );
}
