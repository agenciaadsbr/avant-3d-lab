import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [newArrivals, featuredProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: { featured: true, active: true },
      include: { category: true },
      take: 4,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const displayProducts = featuredProducts.length >= 4 ? featuredProducts : newArrivals.slice(0, 8);

  const categoryIcons: Record<string, string> = {
    "Conjuntos": "👗", "Leggings": "🩱", "Tops": "👙",
    "Macaquinhos": "🤸", "Macacões": "🦋", "Camisetas": "👕",
    "Shorts": "🩳", "Jaquetas": "🧥", "Casacos": "🧣",
  };

  return (
    <HomeClient
      newArrivals={newArrivals}
      featuredProducts={featuredProducts}
      categories={categories}
      displayProducts={displayProducts}
      categoryIcons={categoryIcons}
    />
  );
}
