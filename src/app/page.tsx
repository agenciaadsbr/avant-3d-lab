import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/products/ProductCard";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

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
    <div style={{ backgroundColor: "#FAF6EE" }}>

      {/* HERO */}
      <section style={{ background: "linear-gradient(160deg, #1a1510 0%, #2d2010 60%, #1a1510 100%)", padding: "4rem 1.5rem 4rem", position: "relative", overflow: "hidden", minHeight: "85vh", display: "flex", alignItems: "center" }}>
        {/* Glow */}
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(184,137,26,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center", position: "relative" }}>

          {/* Texto */}
          <div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", border: "1px solid rgba(184,137,26,0.35)", color: "#b8891a", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.4rem 1rem", borderRadius: "999px", marginBottom: "1.75rem", backgroundColor: "rgba(184,137,26,0.08)" }}>
              ✦ Nova Coleção 2026
            </span>
            <h1 style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)", fontWeight: 900, lineHeight: 1.05, color: "#FAF6EE", marginBottom: "1.5rem" }}>
              Desbloqueie{" "}
              <span className="gold-shimmer">sua energia</span>
              <br />infinita.
            </h1>
            <p style={{ color: "rgba(250,246,238,0.65)", fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)", lineHeight: 1.8, marginBottom: "2.5rem", maxWidth: 440 }}>
              Cada peça criada para despertar a força que existe em você. Vista-se com intenção, mova-se com poder.
            </p>
            <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
              <Link href="/produtos" style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 900, padding: "0.95rem 2.25rem", borderRadius: "0.875rem", textDecoration: "none", fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 20px rgba(184,137,26,0.4)" }}>
                Ver Coleção <ArrowRight size={16} />
              </Link>
              <a href="https://wa.me/5551986596705?text=Olá! Quero conhecer os produtos da Access Fit" target="_blank" rel="noopener noreferrer"
                style={{ border: "1.5px solid rgba(255,255,255,0.2)", color: "rgba(250,246,238,0.85)", fontWeight: 700, padding: "0.95rem 2rem", borderRadius: "0.875rem", textDecoration: "none", fontSize: "0.95rem", backgroundColor: "rgba(255,255,255,0.06)", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                📲 Falar no WhatsApp
              </a>
            </div>

          </div>

          {/* Grid de preview de produtos */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }} className="hide-mobile">
            {newArrivals.slice(0, 4).map((p, i) => {
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
                    <p style={{ color: "#b8891a", fontSize: "0.75rem", fontWeight: 900 }}>R$ {p.price.toFixed(2).replace(".", ",")}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ backgroundColor: "#b8891a", padding: "0.6rem 0", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: "3rem", animation: "ticker 20s linear infinite", whiteSpace: "nowrap", width: "max-content" }}>
          {Array(6).fill(null).map((_, i) => (
            <span key={i} style={{ color: "#fff", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", flexShrink: 0 }}>
              ✦ &nbsp; Desbloqueie sua energia infinita &nbsp; ✦ &nbsp; Força. Estilo. Movimento. &nbsp; ✦ &nbsp; Desbloqueie sua energia infinita &nbsp; ✦ &nbsp; Vista-se com intenção, mova-se com poder.
            </span>
          ))}
        </div>
        <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* CATEGORIAS */}
      {categories.length > 0 && (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "3.5rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#b8891a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Explorar</p>
              <h2 style={{ fontSize: "clamp(1.3rem, 3vw, 1.75rem)", fontWeight: 900, color: "#1a1510" }}>Nossas Categorias</h2>
            </div>
            <Link href="/produtos" style={{ color: "#b8891a", fontSize: "0.85rem", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              Ver tudo <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.875rem" }}>
            {categories.map(cat => (
              <Link key={cat.id} href={`/produtos?categoria=${cat.slug}`} className="cat-card"
                style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.12)", borderRadius: "1rem", padding: "1.5rem 1rem", textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.6rem", minHeight: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "transform 0.2s, box-shadow 0.2s" }}>
                <span style={{ fontSize: "1.75rem" }}>{categoryIcons[cat.name] || "✨"}</span>
                <span style={{ color: "#1a1510", fontWeight: 700, fontSize: "0.85rem", textAlign: "center" }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PRODUTOS EM DESTAQUE */}
      <section style={{ backgroundColor: "#fff", borderTop: "1px solid rgba(140,100,20,0.08)", borderBottom: "1px solid rgba(140,100,20,0.08)", padding: "3.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#b8891a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Coleção</p>
              <h2 style={{ fontSize: "clamp(1.3rem, 3vw, 1.75rem)", fontWeight: 900, color: "#1a1510" }}>
                {featuredProducts.length >= 4 ? "Peças em Destaque" : "Novidades"}
              </h2>
            </div>
            <Link href="/produtos" style={{ color: "#b8891a", fontSize: "0.85rem", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }} className="products-grid">
            {displayProducts.map(p => <ProductCard key={p.id} product={p as any} />)}
          </div>
        </div>
      </section>

      {/* BANNER CHAMADA */}
      <section style={{ background: "linear-gradient(135deg, #1a1510 0%, #2d2010 100%)", padding: "4rem 1.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(184,137,26,0.1) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 600, margin: "0 auto", position: "relative" }}>
          <div style={{ width: 70, height: 70, position: "relative", margin: "0 auto 1.5rem", borderRadius: "50%", overflow: "hidden" }}>
            <Image src="/logo.png" alt="Access Fit" fill style={{ objectFit: "cover" }} />
          </div>
          <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 900, color: "#FAF6EE", lineHeight: 1.2, marginBottom: "1rem" }}>
            Vista-se para <span className="gold-shimmer">transformar</span>
          </h2>
          <p style={{ color: "rgba(250,246,238,0.6)", fontSize: "0.95rem", lineHeight: 1.75, marginBottom: "2rem" }}>
            A roupa certa é o ritual que prepara seu corpo e mente para o movimento.
          </p>
          <Link href="/produtos" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#b8891a", color: "#fff", fontWeight: 900, padding: "0.95rem 2.5rem", borderRadius: "0.875rem", textDecoration: "none", fontSize: "0.95rem", boxShadow: "0 4px 20px rgba(184,137,26,0.4)" }}>
            Explorar Coleção <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {[
            { icon: "🚚", title: "Entrega Rápida", desc: "Enviamos para todo o Brasil" },
            { icon: "🔄", title: "Troca Fácil", desc: "Troca em até 7 dias corridos" },
            { icon: "💳", title: "Pagamento Seguro", desc: "Pix, cartão e caderno" },
            { icon: "📲", title: "Atendimento", desc: "Direto pelo WhatsApp" },
          ].map(item => (
            <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", backgroundColor: "#fff", padding: "1.25rem", borderRadius: "0.875rem", border: "1px solid rgba(140,100,20,0.1)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>{item.icon}</div>
              <div>
                <h3 style={{ color: "#1a1510", fontWeight: 800, fontSize: "0.9rem" }}>{item.title}</h3>
                <p style={{ color: "#9a8060", fontSize: "0.78rem", marginTop: "0.2rem", lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHATSAPP FLUTUANTE */}
      <a href="https://wa.me/5551986596705?text=Olá! Quero conhecer os produtos da Access Fit" target="_blank" rel="noopener noreferrer"
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, width: 56, height: 56, backgroundColor: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(37,211,102,0.45)", textDecoration: "none", fontSize: "1.5rem" }}>
        📲
      </a>

    </div>
  );
}
