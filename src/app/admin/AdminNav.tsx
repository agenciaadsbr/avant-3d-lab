"use client";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin",            label: "Início",      emoji: "🏠" },
  { href: "/admin/pedidos",    label: "Pedidos",     emoji: "📦" },
  { href: "/admin/produtos",   label: "Produtos",    emoji: "👗" },
  { href: "/admin/caderno",    label: "Caderno",     emoji: "📒" },
  { href: "/admin/clientes",   label: "Clientes",    emoji: "👥" },
  { href: "/admin/financeiro", label: "Financeiro",  emoji: "💳" },
];

// Estrelinhas decorativas inspiradas no logo
const Stars = () => (
  <svg width="220" height="64" viewBox="0 0 220 64" fill="none" style={{ position: "absolute", right: 0, top: 0, opacity: 0.18, pointerEvents: "none" }}>
    {/* Estrelas 4 pontas */}
    <path d="M180 16 L181.5 20 L186 21.5 L181.5 23 L180 27 L178.5 23 L174 21.5 L178.5 20 Z" fill="#b8891a"/>
    <path d="M205 8 L206 11 L209 12 L206 13 L205 16 L204 13 L201 12 L204 11 Z" fill="#b8891a"/>
    <path d="M196 40 L197 43 L200 44 L197 45 L196 48 L195 45 L192 44 L195 43 Z" fill="#b8891a"/>
    <path d="M160 50 L160.8 52.5 L163 53.5 L160.8 54.5 L160 57 L159.2 54.5 L157 53.5 L159.2 52.5 Z" fill="#b8891a"/>
    {/* Pontos menores */}
    <circle cx="170" cy="32" r="1.5" fill="#b8891a"/>
    <circle cx="210" cy="30" r="1.2" fill="#b8891a"/>
    <circle cx="145" cy="20" r="1" fill="#b8891a"/>
    <circle cx="188" cy="55" r="1.2" fill="#b8891a"/>
    <circle cx="215" cy="50" r="1" fill="#b8891a"/>
    {/* Curva orbital sutil */}
    <path d="M140 60 Q175 10 220 20" stroke="#b8891a" strokeWidth="0.8" fill="none" opacity="0.6"/>
  </svg>
);

export default function AdminNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* ── DESKTOP: header elegante ── */}
      <header className="admin-header" style={{
        backgroundColor: "#FFFDF7",
        borderBottom: "1px solid rgba(184,137,26,0.2)",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 2px 12px rgba(184,137,26,0.08)",
        overflow: "hidden",
      }}>
        <Stars />
        {/* Logo + nome */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.75rem 1.75rem 0.5rem", borderBottom: "1px solid rgba(184,137,26,0.1)" }}>
          <img src="/logo.png" alt="Access Fit" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", boxShadow: "0 2px 8px rgba(184,137,26,0.25)" }} />
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#1a1510", letterSpacing: "-0.02em", lineHeight: 1 }}>Access Fit</div>
            <div style={{ fontSize: "0.65rem", color: "#b8891a", fontWeight: 600, letterSpacing: "0.08em", marginTop: "0.1rem" }}>PAINEL ADMINISTRATIVO</div>
          </div>
        </div>
        {/* Links */}
        <nav style={{ display: "flex", gap: "0.125rem", padding: "0.375rem 1.5rem", overflowX: "auto" }}>
          {links.map(l => (
            <a key={l.href} href={l.href} style={{
              display: "flex", alignItems: "center", gap: "0.35rem",
              padding: "0.4rem 0.875rem", borderRadius: "0.5rem",
              textDecoration: "none", fontSize: "0.82rem", fontWeight: 700,
              color: isActive(l.href) ? "#b8891a" : "#6a5a3a",
              backgroundColor: isActive(l.href) ? "rgba(184,137,26,0.1)" : "transparent",
              borderBottom: isActive(l.href) ? "2px solid #b8891a" : "2px solid transparent",
              whiteSpace: "nowrap", transition: "all 0.15s",
            }}>
              <span style={{ fontSize: "0.9rem" }}>{l.emoji}</span>
              {l.label}
            </a>
          ))}
        </nav>
      </header>

      {/* ── MOBILE: bottom bar elegante ── */}
      <nav className="admin-bottomnav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: "#FFFDF7",
        borderTop: "1px solid rgba(184,137,26,0.2)",
        display: "flex",
        boxShadow: "0 -2px 12px rgba(184,137,26,0.1)",
      }}>
        {links.map(l => (
          <a key={l.href} href={l.href} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "0.5rem 0.25rem",
            textDecoration: "none", gap: "0.15rem",
            color: isActive(l.href) ? "#b8891a" : "#9a8060",
            borderTop: isActive(l.href) ? "2px solid #b8891a" : "2px solid transparent",
            backgroundColor: isActive(l.href) ? "rgba(184,137,26,0.05)" : "transparent",
          }}>
            <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{l.emoji}</span>
            <span style={{ fontSize: "0.58rem", fontWeight: 700, whiteSpace: "nowrap" }}>{l.label}</span>
          </a>
        ))}
      </nav>

      <style>{`
        .admin-header { display: block !important; }
        .admin-bottomnav { display: none !important; }
        @media (max-width: 640px) {
          .admin-header { display: none !important; }
          .admin-bottomnav { display: flex !important; }
        }
      `}</style>
    </>
  );
}
