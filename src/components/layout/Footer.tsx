import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#1a1510", borderTop: "1px solid rgba(184,137,26,0.15)", color: "#9a8060" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "2.5rem" }}>

          {/* Marca */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
              <div style={{ width: 44, height: 44, position: "relative", flexShrink: 0, borderRadius: "50%", overflow: "hidden" }}>
                <Image src="/logo.png" alt="Access Fit" fill style={{ objectFit: "cover" }} />
              </div>
              <span style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "0.12em", background: "linear-gradient(135deg, #c9920a, #e0b030, #a07010)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ACCESS FIT
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", lineHeight: 1.7, color: "#7a6a4a", marginBottom: "0.75rem" }}>
              Moda fitness feminina que desperta a força que existe em você.
            </p>
            <p style={{ fontSize: "0.75rem", color: "#5a4a30", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span>📍</span> Porto Alegre, RS
            </p>
            <p style={{ fontSize: "0.75rem", color: "#5a4a30", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span>🚚</span> Enviamos para todo o Brasil
            </p>
          </div>

          {/* Coleção */}
          <div>
            <h3 style={{ color: "#b8891a", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>Coleção</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                { label: "Ver tudo", slug: "" },
                { label: "Leggings", slug: "leggings" },
                { label: "Tops", slug: "tops" },
                { label: "Conjuntos", slug: "conjuntos" },
                { label: "Shorts", slug: "shorts" },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.slug ? `/produtos?categoria=${item.slug}` : "/produtos"}
                    style={{ color: "#7a6a4a", fontSize: "0.85rem", textDecoration: "none" }}
                    onMouseOver={e => (e.currentTarget.style.color = "#b8891a")}
                    onMouseOut={e => (e.currentTarget.style.color = "#7a6a4a")}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informações */}
          <div>
            <h3 style={{ color: "#b8891a", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>Informações</h3>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                { label: "Sobre Nós", href: "/sobre" },
                { label: "Home Try-On", href: "/sobre#home-try-on" },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href}
                    style={{ color: "#7a6a4a", fontSize: "0.85rem", textDecoration: "none" }}
                    onMouseOver={e => (e.currentTarget.style.color = "#b8891a")}
                    onMouseOut={e => (e.currentTarget.style.color = "#7a6a4a")}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 style={{ color: "#b8891a", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>Contato</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>

              {/* WhatsApp */}
              <a href="https://wa.me/5551986596705" target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none", color: "#7a6a4a" }}>
                <div style={{ width: 32, height: 32, backgroundColor: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <div>
                  <p style={{ fontSize: "0.85rem", color: "#9a8060", fontWeight: 600 }}>(51) 98659-6705</p>
                  <p style={{ fontSize: "0.7rem", color: "#5a4a30" }}>Fale conosco</p>
                </div>
              </a>

              {/* Email */}
              <a href="mailto:accessfitpoa@gmail.com"
                style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none", color: "#7a6a4a" }}>
                <div style={{ width: 32, height: 32, backgroundColor: "#b8891a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                </div>
                <div>
                  <p style={{ fontSize: "0.85rem", color: "#9a8060", fontWeight: 600 }}>accessfitpoa@gmail.com</p>
                  <p style={{ fontSize: "0.7rem", color: "#5a4a30" }}>Envie um e-mail</p>
                </div>
              </a>

              {/* Instagram */}
              <a href="https://instagram.com/accessfit_poa" target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none", color: "#7a6a4a" }}>
                <div style={{ width: 32, height: 32, background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </div>
                <div>
                  <p style={{ fontSize: "0.85rem", color: "#9a8060", fontWeight: 600 }}>@accessfit_poa</p>
                  <p style={{ fontSize: "0.7rem", color: "#5a4a30" }}>Siga no Instagram</p>
                </div>
              </a>

            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid rgba(184,137,26,0.1)", marginTop: "2.5rem", paddingTop: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#5a4a30" }}>© 2025 Access Fit · Porto Alegre, RS · Enviamos para todo o Brasil</p>
          <p style={{ fontSize: "0.7rem", color: "#b8891a", fontStyle: "italic" }}>✦ Desbloqueie sua energia infinita ✦</p>
        </div>
      </div>
    </footer>
  );
}
