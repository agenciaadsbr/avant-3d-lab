import Link from "next/link";
import Image from "next/image";

const products = [
  { slug: "diorama-kfc", name: "Diorama KFC", price: "R$ 59,90", image: "/img/kfc.jpg" },
  { slug: "f1-garage", name: "F1 Garage 2026", price: "R$ 29,90", image: "/img/f1-garage.jpg" },
  { slug: "f1-calendario", name: "F1 Calendário 2026", price: "R$ 29,90", image: "/img/f1-calendar.jpg" },
  { slug: "turbocharger", name: "Turbocharger", price: "R$ 29,90", image: "/img/turbo.jpg" },
  { slug: "turbocharger-led", name: "Turbocharger LED", price: "R$ 29,90", image: "/img/turbo-led.jpg" },
];

const whatsapp = "5551993196828";

function getWhatsAppUrl(name: string, price: string) {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá AVANT 3D LAB! Tenho interesse: *${name}* Quantidade: 1 Valor: ${price}`)}`;
}

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section style={{
        minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "2rem 1rem",
        background: "radial-gradient(ellipse at center, rgba(139,92,246,0.06) 0%, transparent 70%)",
      }}>
        <div style={{ width: 100, height: 100, borderRadius: "1rem", overflow: "hidden", marginBottom: "1.5rem", border: "1px solid rgba(139,92,246,0.3)", animation: "glow 2s ease-in-out infinite" }}>
          <Image src="/img/logo.jpg" alt="AVANT 3D LAB" width={100} height={100} style={{ objectFit: "cover" }} />
        </div>
        <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          <span className="neon-text">AVANT 3D LAB</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "clamp(1.1rem, 3vw, 1.5rem)", fontWeight: 300, marginTop: "0.5rem", letterSpacing: "0.04em" }}>
          Miniaturas 3D Exclusivas
        </p>
        <p style={{ color: "rgba(255,255,255,0.45)", maxWidth: 500, marginTop: "1rem", lineHeight: 1.6 }}>
          Peças colecionáveis impressas com tecnologia de ponta. Qualidade cinematográfica para seu hobby ou decoração.
        </p>
        <a href="#produtos" style={{
          display: "inline-block", marginTop: "2rem", padding: "0.85rem 2.5rem",
          backgroundColor: "#8B5CF6", color: "#fff", fontWeight: 700, fontSize: "1.05rem",
          borderRadius: "999px", textDecoration: "none",
          boxShadow: "0 0 25px rgba(139,92,246,0.3)", transition: "all 0.3s",
        }}>
          Ver Produtos
        </a>
      </section>

      {/* PRODUCTS */}
      <section id="produtos" style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.25rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 800, marginBottom: "0.5rem" }}>
          Nossa Coleção
        </h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", marginBottom: "2.5rem", fontSize: "1rem" }}>
          Miniaturas exclusivas impressas em 3D com acabamento premium
        </p>
        <div className="products-grid" style={{ display: "grid", gap: "1.25rem" }}>
          {products.map((p) => (
            <div key={p.slug} className="glow-card" style={{
              borderRadius: "1rem", overflow: "hidden",
              backgroundColor: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(139,92,246,0.1)", transition: "all 0.3s",
            }}>
              <div style={{ position: "relative", aspectRatio: "3/4", backgroundColor: "#111", overflow: "hidden" }}>
                <Image src={p.image} alt={p.name} fill style={{ objectFit: "cover" }} />
              </div>
              <div style={{ padding: "0.875rem" }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", lineHeight: 1.3, marginBottom: "0.3rem" }}>
                  {p.name}
                </p>
                <p style={{ fontSize: "1.15rem", fontWeight: 900, color: "#F97316", marginBottom: "0.75rem" }}>
                  {p.price}
                </p>
                <a href={getWhatsAppUrl(p.name, p.price)} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                    width: "100%", padding: "0.65rem", backgroundColor: "#25D366",
                    color: "#fff", fontWeight: 700, fontSize: "0.82rem", border: "none",
                    borderRadius: "0.6rem", cursor: "pointer", textDecoration: "none",
                    transition: "all 0.2s",
                  }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                  </svg>
                  Comprar via WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ backgroundColor: "#0A0A0A", padding: "3rem 1.25rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 800, marginBottom: "2rem" }}>Como Funciona</h2>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem" }}>
          {[
            { icon: "🔍", title: "Escolha sua Miniatura", desc: "Navegue pela coleção e encontre a peça perfeita." },
            { icon: "💬", title: "Fale Conosco no WhatsApp", desc: "Clique em comprar e envie uma mensagem direta." },
            { icon: "📦", title: "Receba em Casa", desc: "Combinamos o pagamento e enviamos com cuidado." },
          ].map((s, i) => (
            <div key={i} style={{ flex: "1 1 200px", maxWidth: 240, padding: "1.5rem", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "1rem", border: "1px solid rgba(139,92,246,0.1)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{s.icon}</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.4rem" }}>{s.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.25rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 800, marginBottom: "1rem" }}>Sobre a AVANT 3D LAB</h2>
        <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.8, maxWidth: 600, margin: "0 auto 1.5rem" }}>
          A AVANT 3D LAB nasceu da paixão por tecnologia e design. Transformamos ideias em peças físicas com impressão 3D de alta precisão. Cada miniatura é produzida com materiais de qualidade e acabamento cuidado.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
          {["5+ Produtos Exclusivos", "Impressão de Precisão", "Envio para Todo Brasil"].map((s, i) => (
            <span key={i} style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", padding: "0.35rem 1rem", backgroundColor: "rgba(139,92,246,0.08)", borderRadius: "999px", border: "1px solid rgba(139,92,246,0.15)" }}>◆ {s}</span>
          ))}
        </div>
      </section>
    </>
  );
}
