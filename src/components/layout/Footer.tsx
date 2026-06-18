import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#EDE4CC", borderTop: "1px solid rgba(140,100,20,0.15)", color: "#7a6030" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "2rem" }}>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <div style={{ width: 44, height: 44, position: "relative", flexShrink: 0, borderRadius: "50%", overflow: "hidden", mixBlendMode: "multiply" }}>
                <Image src="/logo.png" alt="Access Fit" fill style={{ objectFit: "cover" }} />
              </div>
              <span style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "0.12em", background: "linear-gradient(135deg, #c9920a, #e0b030, #a07010)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ACCESS FIT
              </span>
            </div>
            <p style={{ fontSize: "0.7rem", fontStyle: "italic", color: "#9a7a3a", marginBottom: "0.6rem" }}>
              Desbloqueie sua energia infinita.
            </p>
            <p style={{ fontSize: "0.8rem", lineHeight: 1.65, color: "#8a7040" }}>
              Moda fitness feminina que desperta a forÃ§a que existe em vocÃª.
            </p>
          </div>

          <div>
            <h3 style={{ color: "#b8891a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>ColeÃ§Ã£o</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {["Leggings", "Tops", "Conjuntos", "Shorts", "CalÃ§as"].map(item => (
                <li key={item}>
                  <Link href={`/produtos?categoria=${item.toLowerCase()}`} style={{ color: "#7a6030", fontSize: "0.85rem", textDecoration: "none" }}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 style={{ color: "#b8891a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>InformaÃ§Ãµes</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { label: "Sobre nÃ³s", href: "/sobre" },
                { label: "PolÃ­tica de troca", href: "/trocas" },
                { label: "Entrega e frete", href: "/entrega" },
                { label: "Privacidade", href: "/privacidade" },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} style={{ color: "#7a6030", fontSize: "0.85rem", textDecoration: "none" }}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 style={{ color: "#b8891a", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>Contato</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { icon: <Mail size={13} />, text: "contato@accessfit.com.br" },
                { icon: <Phone size={13} />, text: "(11) 99999-9999" },
                { icon: <MapPin size={13} />, text: "SÃ£o Paulo, SP" },
              ].map(item => (
                <li key={item.text} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#7a6030", fontSize: "0.85rem" }}>
                  <span style={{ color: "#b8891a", flexShrink: 0 }}>{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(140,100,20,0.12)", marginTop: "2.5rem", paddingTop: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#9a8060" }}>Â© 2024 Access Fit. Todos os direitos reservados.</p>
          <p style={{ fontSize: "0.7rem", color: "#b8891a", fontStyle: "italic" }}>âœ¦ Desbloqueie sua energia infinita âœ¦</p>
        </div>
      </div>
    </footer>
  );
}

