"use client";
import { useMobileView } from "@/hooks/useMediaQuery";
import ProductCard from "@/components/products/ProductCard";
import Link from "next/link";

interface ProdutosClientProps {
  products: any[];
  categories: any[];
  allSizes: string[];
  categoria?: string;
  tamanho?: string;
  ordem?: string;
  buildUrl: (overrides: Record<string, string | undefined>) => string;
}

export default function ProdutosClient({
  products,
  categories,
  allSizes,
  categoria,
  tamanho,
  ordem,
  buildUrl,
}: ProdutosClientProps) {
  const isMobile = useMobileView();

  // Responsivo: 1 coluna mobile, 2 desktop
  const gridCols = isMobile ? 1 : 2;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "1rem" : "1.5rem", display: "flex", gap: isMobile ? "1rem" : "2rem", alignItems: "flex-start", flexDirection: isMobile ? "column" : "row" }}>
      {/* Sidebar desktop */}
      {!isMobile && (
        <aside style={{ width: 230, flexShrink: 0, position: "sticky", top: 88 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", overflow: "hidden" }}>
            {/* Categorias */}
            <div style={{ padding: "1.25rem", borderBottom: "1px solid rgba(140,100,20,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 800, color: "#1a1510", letterSpacing: "0.08em", textTransform: "uppercase" }}>Coleções</p>
                {categoria && <Link href={buildUrl({ categoria: undefined })} style={{ fontSize: "0.68rem", color: "#b8891a", textDecoration: "none", fontWeight: 700 }}>Limpar</Link>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <Link href={buildUrl({ categoria: undefined })}
                  style={{ padding: "0.45rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.85rem", fontWeight: !categoria ? 700 : 500, textDecoration: "none", backgroundColor: !categoria ? "rgba(184,137,26,0.08)" : "transparent", color: !categoria ? "#b8891a" : "#5a4a2a", borderLeft: !categoria ? "3px solid #b8891a" : "3px solid transparent" }}>
                  Todos
                </Link>
                {categories.map((cat: any) => (
                  <Link key={cat.id} href={buildUrl({ categoria: cat.slug })}
                    style={{ padding: "0.45rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.85rem", fontWeight: categoria === cat.slug ? 700 : 500, textDecoration: "none", backgroundColor: categoria === cat.slug ? "rgba(184,137,26,0.08)" : "transparent", color: categoria === cat.slug ? "#b8891a" : "#5a4a2a", borderLeft: categoria === cat.slug ? "3px solid #b8891a" : "3px solid transparent" }}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Tamanhos */}
            {allSizes.length > 0 && (
              <div style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
                  <p style={{ fontSize: "0.72rem", fontWeight: 800, color: "#1a1510", letterSpacing: "0.08em", textTransform: "uppercase" }}>Tamanho</p>
                  {tamanho && <Link href={buildUrl({ tamanho: undefined })} style={{ fontSize: "0.68rem", color: "#b8891a", textDecoration: "none", fontWeight: 700 }}>Limpar</Link>}
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {allSizes.map(s => (
                    <Link key={s} href={buildUrl({ tamanho: tamanho === s ? undefined : s })}
                      style={{ padding: "0.35rem 0.7rem", borderRadius: "0.5rem", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none", backgroundColor: tamanho === s ? "#1a1510" : "#FAF6EE", color: tamanho === s ? "#FAF6EE" : "#5a4a2a", border: `1px solid ${tamanho === s ? "#1a1510" : "rgba(140,100,20,0.2)"}` }}>
                      {s}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Grid */}
      <div style={{ flex: 1, minWidth: 0, width: isMobile ? "100%" : "auto" }}>
        {/* Tamanhos mobile */}
        {isMobile && allSizes.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "1rem", overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: "0.5rem" }}>
            {allSizes.map(s => (
              <Link key={s} href={buildUrl({ tamanho: tamanho === s ? undefined : s })}
                style={{ flexShrink: 0, padding: "0.35rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 700, textDecoration: "none", backgroundColor: tamanho === s ? "#1a1510" : "#fff", color: tamanho === s ? "#FAF6EE" : "#5a4a2a", border: `1px solid ${tamanho === s ? "#1a1510" : "rgba(140,100,20,0.2)"}`, whiteSpace: "nowrap" }}>
                {s}
              </Link>
            ))}
          </div>
        )}

        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)" }}>
            <p style={{ color: "#9a8060", fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Nenhum produto encontrado</p>
            <Link href="/produtos" style={{ color: "#b8891a", fontWeight: 700, textDecoration: "none" }}>Ver toda a coleção →</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: gridCols === 1 ? "1fr" : "repeat(2, 1fr)", gap: isMobile ? "1rem" : "1.25rem" }}>
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
