import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/products/ProductCard";
import Link from "next/link";

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; busca?: string }>;
}) {
  const params = await searchParams;
  const { categoria, busca } = params;

  const categories = await prisma.category.findMany();

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(categoria ? { category: { slug: categoria } } : {}),
      ...(busca ? { name: { contains: busca } } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const currentCategory = categories.find((c) => c.slug === categoria);

  return (
    <div className="bg-onyx-950 min-h-screen">
      {/* Page header */}
      <div className="border-b border-gold-800/20 bg-onyx-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-white">
            {currentCategory ? (
              <><span className="text-gold-gradient">{currentCategory.name}</span></>
            ) : busca ? (
              <>Busca: <span className="text-gold-gradient">"{busca}"</span></>
            ) : (
              <>Nossa <span className="text-gold-gradient">Coleção</span></>
            )}
          </h1>
          <p className="text-onyx-400 mt-1 text-sm">{products.length} peças encontradas</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-52 shrink-0">
            <div className="sticky top-24">
              <h3 className="font-bold text-gold-500 mb-4 text-xs tracking-widest uppercase">Categorias</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/produtos"
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !categoria
                        ? "bg-gold-500 text-onyx-950"
                        : "text-onyx-400 hover:bg-gold-900/20 hover:text-gold-400"
                    }`}
                  >
                    Todos
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/produtos?categoria=${cat.slug}`}
                      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        categoria === cat.slug
                          ? "bg-gold-500 text-onyx-950"
                          : "text-onyx-400 hover:bg-gold-900/20 hover:text-gold-400"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex-1">
            {/* Mobile categories */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 md:hidden">
              <Link
                href="/produtos"
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !categoria ? "bg-gold-500 text-onyx-950" : "bg-onyx-800 text-onyx-300 border border-gold-800/20"
                }`}
              >
                Todos
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/produtos?categoria=${cat.slug}`}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    categoria === cat.slug ? "bg-gold-500 text-onyx-950" : "bg-onyx-800 text-onyx-300 border border-gold-800/20"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 text-onyx-500">
                <p className="text-lg font-medium">Nenhum produto encontrado</p>
                <Link href="/produtos" className="mt-4 inline-block text-gold-500 font-semibold hover:text-gold-400">
                  Ver todos os produtos
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
