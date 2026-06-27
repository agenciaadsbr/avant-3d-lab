"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useMobileView } from "@/hooks/useMediaQuery";
import ProductCard from "@/components/products/ProductCard";

interface HomeClientProps {
  newArrivals: any[];
  heroProducts: any[];
  featuredProducts: any[];
  categories: any[];
  categoryIcons: Record<string, string>;
}

export default function HomeClient({
  newArrivals,
  heroProducts,
  featuredProducts,
  categories,
  categoryIcons,
}: HomeClientProps) {
  const isMobile = useMobileView();

  return (
    <div style={{ backgroundColor: "#FAF6EE" }}>
      {/* HERO */}
      <section style={{ background: "linear-gradient(160deg, #1a1510 0%, #2d2010 60%, #1a1510 100%)", padding: isMobile ? "2rem 1rem" : "4rem 1.5rem 4rem", position: "relative", overflow: "hidden", minHeight: isMobile ? "auto" : "85vh", display: "flex", alignItems: "center" }}>
        {/* Glow */}
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(184,137,26,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "2rem" : "3rem", alignItems: "center", position: "relative" }}>
          {/* Texto */}
          <div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", border: "1px solid rgba(184,137,26,0.35)", color: "#b8891a", fontSize: isMobile ? "0.65rem" : "0.68rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.4rem 1rem", borderRadius: "999px", marginBottom: "1.75rem", backgroundColor: "rgba(184,137,26,0.08)" }}>
              ✦ Nova Coleção 2026
            </span>
            <h1 style={{ fontSize: isMobile ? "2rem" : "clamp(2.5rem, 5.5vw, 4.5rem)", fontWeight: 900, lineHeight: 1.05, color: "#FAF6EE", marginBottom: "1.5rem" }}>
              Desbloqueie{" "}
              <span className="gold-shimmer">sua energia</span>
              <br />infinita.
            </h1>
            <p style={{ color: "rgba(250,246,238,0.65)", fontSize: isMobile ? "0.9rem" : "clamp(0.9rem, 1.8vw, 1.05rem)", lineHeight: 1.8, marginBottom: "2.5rem", maxWidth: 440 }}>
              Cada peça criada para despertar a força que existe em você. Vista-se com intenção, mova-se com poder.
            </p>
            <div style={{ display: "flex", gap: isMobile ? "0.5rem" : "0.875rem", flexDirection: isMobile ? "column" : "row", flexWrap: "wrap" }}>
              <Link href="/produtos" style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 900, padding: isMobile ? "0.75rem 1.5rem" : "0.95rem 2.25rem", borderRadius: "0.875rem", textDecoration: "none", fontSize: isMobile ? "0.85rem" : "0.95rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: "0 4px 20px rgba(184,137,26,0.4)", width: isMobile ? "100%" : "auto" }}>
                Ver Coleção <ArrowRight size={16} />
              </Link>
              <a href="https://wa.me/5551986596705?text=Olá! Quero conhecer os produtos da Access Fit" target="_blank" rel="noopener noreferrer"
                style={{ border: "1.5px solid rgba(255,255,255,0.2)", color: "rgba(250,246,238,0.85)", fontWeight: 700, padding: isMobile ? "0.75rem 1.5rem" : "0.95rem 2rem", borderRadius: "0.875rem", textDecoration: "none", fontSize: isMobile ? "0.85rem" : "0.95rem", backgroundColor: "rgba(255,255,255,0.06)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: isMobile ? "100%" : "auto" }}>
                📲 Falar no WhatsApp
              </a>
            </div>
          </div>

          {/* Grid de preview de produtos - esconde em mobile */}
          {!isMobile && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
              {heroProducts.map((p, i) => {
                const imgs = JSON.parse(p.images || "[]");
                return (
                  <Link key={p.id} href={`/produtos/${p.slug}`} style={{ textDecoration: "none", display: "block", borderRadius: "1rem", overflow: "hidden", aspectRatio: i === 0 ? "1/1.4" : "1/1", backgroundColor: "#2a2010", border: "1px solid rgba(184,137,26,0.15)", position: "relative" }}>
                    {imgs[0] ? (
                      <img src={imgs[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.9 }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(184,137,26,0.3)", fontSize: "0.7rem" }}>Access Fit</div>
                    )}
                    <div style={{ position: "absolute", bottom: 8, left: 8, right: 8, backgroundColor: "rgba(26,21,16,0.85)", borderRadius: "0.5rem", padding: "0.4rem 0.6rem", backdropFilter: "blur(4px)" }}>
                      <p style={{ color: "#FAF6EE", fontSize: "0.65rem", fontWeight: 700, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{p.name}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Categorias */}
      <section style={{ padding: isMobile ? "2rem 1rem" : "5rem 1.5rem", backgroundColor: "#FAF6EE" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: isMobile ? "1.5rem" : "2.2rem", fontWeight: 900, color: "#1a1510", marginBottom: "2.5rem", textAlign: "center" }}>
            Explora por Coleção
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(140px, 1fr))", gap: isMobile ? "0.75rem" : "0.875rem" }}>
            {categories.map(cat => (
              <Link key={cat.id} href={`/produtos?categoria=${cat.slug}`}
                style={{ padding: isMobile ? "0.75rem" : "1rem", backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "0.875rem", textAlign: "center", textDecoration: "none", color: "#1a1510", fontSize: isMobile ? "0.8rem" : "0.85rem", fontWeight: 700, transition: "all 0.2s", cursor: "pointer" }}>
                <span style={{ fontSize: isMobile ? "1.5rem" : "2rem", marginRight: "0.5rem" }}>{categoryIcons[cat.name] || "✨"}</span>
                <br />
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section style={{ padding: isMobile ? "2rem 1rem" : "5rem 1.5rem", backgroundColor: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: isMobile ? "1.5rem" : "2.2rem", fontWeight: 900, color: "#1a1510", marginBottom: "1rem", textAlign: "center" }}>
            ✨ Destaques
          </h2>
          <p style={{ textAlign: "center", color: "#9a8060", marginBottom: "2.5rem", fontSize: isMobile ? "0.85rem" : "1rem" }}>
            As peças mais procuradas da coleção
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? "1rem" : "1.25rem" }}>
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
