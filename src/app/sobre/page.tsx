import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Sobre Nós — Access Fit",
  description: "Conheça a Access Fit e o conceito Home Try-On: você experimenta no conforto de onde quiser e compra só se gostar.",
};

const StarDecor = () => (
  <svg width="180" height="180" viewBox="0 0 180 180" fill="none" style={{ position: "absolute", opacity: 0.07, pointerEvents: "none" }}>
    <path d="M90 20 L93 32 L106 35 L93 38 L90 50 L87 38 L74 35 L87 32 Z" fill="#b8891a"/>
    <path d="M140 60 L142 68 L150 70 L142 72 L140 80 L138 72 L130 70 L138 68 Z" fill="#b8891a"/>
    <path d="M50 100 L52 108 L60 110 L52 112 L50 120 L48 112 L40 110 L48 108 Z" fill="#b8891a"/>
    <circle cx="155" cy="120" r="3" fill="#b8891a"/>
    <circle cx="30" cy="60" r="2" fill="#b8891a"/>
    <circle cx="120" cy="150" r="2.5" fill="#b8891a"/>
    <path d="M20 160 Q80 80 160 100" stroke="#b8891a" strokeWidth="1" fill="none"/>
  </svg>
);

export default function SobrePage() {
  return (
    <div style={{ backgroundColor: "#FAF6EE", minHeight: "100vh" }}>

      {/* Hero */}
      <section style={{ position: "relative", overflow: "hidden", backgroundColor: "#1a1510", padding: "5rem 1.5rem" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
          <svg width="100%" height="100%"><defs><pattern id="stars" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M40 10 L41.5 16 L48 17.5 L41.5 19 L40 25 L38.5 19 L32 17.5 L38.5 16 Z" fill="#b8891a"/><circle cx="15" cy="40" r="1.5" fill="#b8891a"/><circle cx="65" cy="60" r="1" fill="#b8891a"/><circle cx="70" cy="20" r="1.2" fill="#b8891a"/></pattern></defs><rect width="100%" height="100%" fill="url(#stars)"/></svg>
        </div>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 0 3px rgba(184,137,26,0.4), 0 0 30px rgba(184,137,26,0.2)" }}>
              <Image src="/logo.png" alt="Access Fit" width={80} height={80} style={{ objectFit: "cover" }} />
            </div>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#b8891a", fontWeight: 700, letterSpacing: "0.2em", marginBottom: "1rem" }}>ACCESS FIT</p>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: "1.25rem" }}>
            Moda fitness que cabe<br />
            <span style={{ background: "linear-gradient(135deg, #c9920a, #e0b030)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              no seu estilo de vida
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
            Nascemos da paixão por moda fitness feminina com propósito — peças que combinam conforto, qualidade e elegância para quem não abre mão de se sentir bem em movimento.
          </p>
        </div>
      </section>

      {/* Home Try-On */}
      <section style={{ padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <StarDecor />
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#b8891a", letterSpacing: "0.15em", marginBottom: "0.75rem" }}>NOSSO DIFERENCIAL</p>
              <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 900, color: "#1a1510", lineHeight: 1.15, marginBottom: "1.25rem" }}>
                Home<br />Try-On
              </h2>
              <p style={{ color: "#5a4a2a", fontSize: "1rem", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                Acreditamos que a melhor forma de escolher uma peça é experimentá-la com calma, no conforto da sua casa ou onde você preferir.
              </p>
              <p style={{ color: "#5a4a2a", fontSize: "1rem", lineHeight: 1.8 }}>
                Por isso criamos o <strong style={{ color: "#1a1510" }}>Home Try-On</strong>: você recebe as peças, experimenta com tranquilidade e paga <strong style={{ color: "#1a1510" }}>somente pelo que ficou</strong>. Sem pressão, sem complicação.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { emoji: "🚀", title: "Receba em mãos", desc: "Entregamos as peças pessoalmente para você experimentar sem sair de casa." },
                { emoji: "👗", title: "Experimente à vontade", desc: "Você tem tempo para provar, combinar e decidir com calma." },
                { emoji: "✅", title: "Pague só o que ficou", desc: "Gostou? Fica. Não curtiu? Devolve. Simples assim." },
              ].map(item => (
                <div key={item.title} style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.25rem 1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start", boxShadow: "0 2px 8px rgba(140,100,20,0.05)" }}>
                  <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{item.emoji}</span>
                  <div>
                    <p style={{ fontWeight: 800, color: "#1a1510", marginBottom: "0.25rem" }}>{item.title}</p>
                    <p style={{ color: "#7a6040", fontSize: "0.875rem", lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section style={{ backgroundColor: "#fff", padding: "4rem 1.5rem", borderTop: "1px solid rgba(140,100,20,0.1)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#b8891a", letterSpacing: "0.15em", marginBottom: "0.75rem" }}>NOSSOS VALORES</p>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 900, color: "#1a1510", marginBottom: "3rem" }}>
            O que nos move
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem" }}>
            {[
              { emoji: "✨", title: "Qualidade", desc: "Selecionamos cada peça com atenção ao caimento, tecido e acabamento." },
              { emoji: "💛", title: "Confiança", desc: "Uma relação próxima com cada cliente, com cuidado e transparência." },
              { emoji: "🌟", title: "Estilo", desc: "Moda fitness que vai da academia ao dia a dia com elegância." },
              { emoji: "🤝", title: "Proximidade", desc: "Atendimento personalizado — porque cada cliente é única." },
            ].map(v => (
              <div key={v.title} style={{ padding: "0.5rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{v.emoji}</div>
                <h3 style={{ fontWeight: 800, color: "#1a1510", fontSize: "1rem", marginBottom: "0.5rem" }}>{v.title}</h3>
                <p style={{ color: "#7a6040", fontSize: "0.875rem", lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 900, color: "#1a1510", marginBottom: "1rem" }}>
            Pronta para experimentar?
          </h2>
          <p style={{ color: "#7a6040", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            Conheça nossa coleção e descubra peças feitas para você se sentir incrível — no treino e além dele.
          </p>
          <Link href="/produtos"
            style={{ display: "inline-block", backgroundColor: "#b8891a", color: "#fff", fontWeight: 800, fontSize: "1rem", padding: "0.875rem 2.5rem", borderRadius: "0.875rem", textDecoration: "none", boxShadow: "0 4px 16px rgba(184,137,26,0.3)" }}>
            Ver coleção
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          section > div > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
