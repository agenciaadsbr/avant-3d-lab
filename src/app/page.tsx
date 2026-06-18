import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/products/ProductCard";
import { ArrowRight, Truck, RefreshCw, Shield } from "lucide-react";
import Image from "next/image";

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { featured: true, active: true },
    include: { category: true },
    take: 4,
  });
  const categories = await prisma.category.findMany({ take: 5 });

  return (
    <div style={{ backgroundColor: "#FAF6EE" }}>

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(135deg, #FAF6EE 0%, #F0E8D0 50%, #FAF6EE 100%)", padding: "5rem 1.5rem 4rem", position: "relative", overflow: "hidden" }}>
        {/* Decorative circle */}
        <div style={{ position: "absolute", right: "-5%", top: "50%", transform: "translateY(-50%)", width: "min(480px, 50vw)", height: "min(480px, 50vw)", borderRadius: "50%", background: "radial-gradient(circle, rgba(180,130,20,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "2rem" }}>
          <div style={{ maxWidth: 580 }}>
            <span style={{ display: "inline-block", border: "1px solid rgba(140,100,20,0.3)", color: "#b8891a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.4rem 1rem", borderRadius: "999px", marginBottom: "1.5rem", backgroundColor: "rgba(180,130,20,0.06)" }}>
              ✦ Nova Coleção
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)", fontWeight: 900, lineHeight: 1.1, color: "#1a1510", marginBottom: "1.25rem" }}>
              Desbloqueie{" "}
              <span className="gold-shimmer">sua energia</span>
              <br />infinita.
            </h1>
            <p style={{ color: "#7a6030", fontSize: "clamp(0.95rem, 2vw, 1.1rem)", lineHeight: 1.75, marginBottom: "2.5rem", maxWidth: 460 }}>
              Cada peça criada para despertar a força que existe em você. Vista-se com intenção, mova-se com poder.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href="/produtos" style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 900, padding: "0.875rem 2rem", borderRadius: "0.75rem", textDecoration: "none", fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 16px rgba(140,100,20,0.25)" }}>
                Ver Coleção <ArrowRight size={16} />
              </Link>
              <Link href="/produtos?categoria=conjuntos" style={{ border: "1.5px solid rgba(140,100,20,0.35)", color: "#8a6510", fontWeight: 700, padding: "0.875rem 2rem", borderRadius: "0.75rem", textDecoration: "none", fontSize: "0.95rem", backgroundColor: "transparent" }}>
                Conjuntos
              </Link>
            </div>
          </div>

          {/* Logo hero */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} className="hide-mobile">
            <div style={{ width: 320, height: 320, position: "relative", borderRadius: "50%", overflow: "hidden", mixBlendMode: "multiply", flexShrink: 0 }}>
              <Image src="/logo.png" alt="Access Fit" fill style={{ objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ backgroundColor: "#EDE4CC", borderTop: "1px solid rgba(140,100,20,0.12)", borderBottom: "1px solid rgba(140,100,20,0.12)", padding: "0.65rem 0" }}>
        <p style={{ color: "#9a7a3a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center" }}>
          ✦ &nbsp; Desbloqueie sua energia infinita &nbsp; ✦ &nbsp; Força. Estilo. Movimento. &nbsp; ✦ &nbsp; Vista-se e transforme-se
        </p>
      </div>

      {/* ── CATEGORIES ── */}
      {categories.length > 0 && (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "3.5rem 1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#1a1510", marginBottom: "1.5rem" }}>
            Explorar por <span className="gold-text">categoria</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.75rem" }}>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/produtos?categoria=${cat.slug}`}
                style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.14)", borderRadius: "0.875rem", padding: "1.25rem 0.75rem", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 80, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <span style={{ color: "#3a2a10", fontWeight: 700, fontSize: "0.875rem", textAlign: "center" }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FEATURED ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem 3.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#1a1510" }}>
              Peças em <span className="gold-text">destaque</span>
            </h2>
            <p style={{ color: "#9a8060", fontSize: "0.8rem", marginTop: "0.2rem" }}>Selecionadas para ampliar sua energia</p>
          </div>
          <Link href="/produtos" style={{ color: "#b8891a", fontSize: "0.85rem", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px dashed rgba(140,100,20,0.2)" }}>
            <p style={{ color: "#9a8060", fontSize: "1rem", marginBottom: "0.5rem" }}>Nenhum produto cadastrado ainda.</p>
            <Link href="/admin/produtos/novo" style={{ color: "#b8891a", fontSize: "0.875rem", fontWeight: 700, textDecoration: "none" }}>
              Adicionar primeiro produto →
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── QUOTE ── */}
      <section style={{ backgroundColor: "#F0E8D0", borderTop: "1px solid rgba(140,100,20,0.1)", borderBottom: "1px solid rgba(140,100,20,0.1)", padding: "4rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <div style={{ width: 64, height: 64, position: "relative", margin: "0 auto 1.25rem", borderRadius: "50%", overflow: "hidden", mixBlendMode: "multiply", opacity: 0.6 }}>
            <Image src="/logo.png" alt="" fill style={{ objectFit: "cover" }} />
          </div>
          <blockquote style={{ color: "#3a2a10", fontSize: "clamp(1.1rem, 3vw, 1.4rem)", fontWeight: 700, lineHeight: 1.55 }}>
            "A roupa certa é o <span className="gold-text">ritual</span> que prepara seu corpo e mente para o movimento."
          </blockquote>
          <p style={{ color: "#9a7a3a", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, marginTop: "1.25rem" }}>
            Access Fit — Desbloqueie sua energia infinita
          </p>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {[
            { icon: <Truck size={20} />, title: "Frete Grátis", desc: "Nas compras acima de R$ 299" },
            { icon: <RefreshCw size={20} />, title: "Troca Fácil", desc: "30 dias para trocar ou devolver" },
            { icon: <Shield size={20} />, title: "Compra Segura", desc: "Pagamento 100% protegido" },
          ].map((item) => (
            <div key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", backgroundColor: "#fff", padding: "1.25rem", borderRadius: "0.875rem", border: "1px solid rgba(140,100,20,0.1)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "0.6rem", backgroundColor: "rgba(180,130,20,0.1)", color: "#b8891a", borderRadius: "0.625rem", flexShrink: 0 }}>{item.icon}</div>
              <div>
                <h3 style={{ color: "#1a1510", fontWeight: 700, fontSize: "0.95rem" }}>{item.title}</h3>
                <p style={{ color: "#9a8060", fontSize: "0.8rem", marginTop: "0.2rem" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={{ backgroundColor: "#EDE4CC", borderTop: "1px solid rgba(140,100,20,0.12)", padding: "3.5rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>
          <h2 style={{ color: "#1a1510", fontSize: "1.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>Seja a primeira a saber</h2>
          <p style={{ color: "#7a6030", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Novas peças e energias novas. Cadastre-se e receba em primeira mão.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            <input type="email" placeholder="seu@email.com"
              style={{ flex: 1, minWidth: 200, padding: "0.75rem 1rem", borderRadius: "0.75rem", fontSize: "0.9rem", border: "1px solid rgba(140,100,20,0.2)" }} />
            <button style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 900, padding: "0.75rem 1.5rem", borderRadius: "0.75rem", border: "none", cursor: "pointer", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
              Assinar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
