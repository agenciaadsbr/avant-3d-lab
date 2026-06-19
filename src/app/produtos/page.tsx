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

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(categoria ? { category: { slug: categoria } } : {}),
      ...(busca ? { name: { contains: busca, mode: "insensitive" } } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const currentCategory = categories.find((c) => c.slug === categoria);

  return (
    <div style={{ backgroundColor: "#FAF6EE", minHeight: "100vh" }}>

      {/* Hero da coleção */}
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid rgba(140,100,20,0.12)", padding: "2rem 1.25rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p style={{ fontSize: "0.75rem", color: "#b8891a", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "0.3rem" }}>
            ACCESS FIT
          </p>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900, color: "#1a1510", lineHeight: 1.1, marginBottom: "0.4rem" }}>
            {currentCategory ? currentCategory.name : busca ? `"${busca}"` : "Nossa Coleção"}
          </h1>
          <p style={{ color: "#9a8060", fontSize: "0.875rem" }}>
            {products.length} peça{products.length !== 1 ? "s" : ""} encontrada{products.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1.25rem" }}>

        {/* Categorias mobile — scroll horizontal */}
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "1rem", marginBottom: "0.5rem" }}
          className="hide-desktop">
          <Link href="/produtos"
            style={{ flexShrink: 0, padding: "0.45rem 1.1rem", borderRadius: "999px", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none", backgroundColor: !categoria ? "#b8891a" : "#fff", color: !categoria ? "#fff" : "#7a6030", border: !categoria ? "none" : "1px solid rgba(140,100,20,0.2)" }}>
            Todos
          </Link>
          {categories.map(cat => (
            <Link key={cat.id} href={`/produtos?categoria=${cat.slug}`}
              style={{ flexShrink: 0, padding: "0.45rem 1.1rem", borderRadius: "999px", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none", backgroundColor: categoria === cat.slug ? "#b8891a" : "#fff", color: categoria === cat.slug ? "#fff" : "#7a6030", border: categoria === cat.slug ? "none" : "1px solid rgba(140,100,20,0.2)" }}>
              {cat.name}
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>

          {/* Sidebar desktop */}
          <aside style={{ width: 200, flexShrink: 0, position: "sticky", top: 80 }}
            className="hide-mobile">
            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#b8891a", letterSpacing: "0.1em", marginBottom: "0.875rem" }}>CATEGORIAS</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              <Link href="/produtos"
                style={{ padding: "0.5rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", backgroundColor: !categoria ? "rgba(184,137,26,0.1)" : "transparent", color: !categoria ? "#b8891a" : "#7a6030", borderLeft: !categoria ? "3px solid #b8891a" : "3px solid transparent" }}>
                Todos
              </Link>
              {categories.map(cat => (
                <Link key={cat.id} href={`/produtos?categoria=${cat.slug}`}
                  style={{ padding: "0.5rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", backgroundColor: categoria === cat.slug ? "rgba(184,137,26,0.1)" : "transparent", color: categoria === cat.slug ? "#b8891a" : "#7a6030", borderLeft: categoria === cat.slug ? "3px solid #b8891a" : "3px solid transparent" }}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </aside>

          {/* Grid de produtos */}
          <div style={{ flex: 1 }}>
            {products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
                <p style={{ color: "#9a8060", fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Nenhum produto encontrado</p>
                <Link href="/produtos" style={{ color: "#b8891a", fontWeight: 700, textDecoration: "none" }}>Ver toda a coleção →</Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1.25rem" }}>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .hide-desktop { display: flex !important; } .hide-mobile { display: none !important; } }
        @media (min-width: 769px) { .hide-desktop { display: none !important; } .hide-mobile { display: flex !important; } }
      `}</style>
    </div>
  );
}
