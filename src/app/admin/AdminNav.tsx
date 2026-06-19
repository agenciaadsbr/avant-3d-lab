"use client";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin",           label: "Início",     emoji: "🏠" },
  { href: "/admin/pedidos",   label: "Pedidos",    emoji: "📦" },
  { href: "/admin/produtos",  label: "Produtos",   emoji: "👗" },
  { href: "/admin/caderno",   label: "Caderno",    emoji: "📒" },
  { href: "/admin/clientes",  label: "Clientes",   emoji: "👥" },
  { href: "/admin/financeiro",label: "Financeiro", emoji: "💳" },
];

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* Top bar — desktop */}
      <nav style={{
        backgroundColor: "#1a1510",
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0 1.5rem",
        height: 52,
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 8px rgba(0,0,0,0.18)",
      }}
        className="admin-topnav"
      >
        {/* Logo */}
        <a href="/admin" style={{ color: "#b8891a", fontWeight: 900, fontSize: "1rem", textDecoration: "none", marginRight: "1.5rem", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
          Access Fit
        </a>

        {links.map(l => (
          <a key={l.href} href={l.href} style={{
            display: "flex", alignItems: "center", gap: "0.35rem",
            padding: "0.4rem 0.75rem", borderRadius: "0.5rem",
            textDecoration: "none", fontSize: "0.82rem", fontWeight: 600,
            color: isActive(l.href) ? "#fff" : "rgba(255,255,255,0.55)",
            backgroundColor: isActive(l.href) ? "rgba(184,137,26,0.25)" : "transparent",
            transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: "0.95rem" }}>{l.emoji}</span>
            {l.label}
          </a>
        ))}
      </nav>

      {/* Bottom bar — mobile */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: "#1a1510",
        display: "flex",
        borderTop: "1px solid rgba(184,137,26,0.2)",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.2)",
      }}
        className="admin-bottomnav"
      >
        {links.map(l => (
          <a key={l.href} href={l.href} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "0.5rem 0.25rem",
            textDecoration: "none", gap: "0.15rem",
            color: isActive(l.href) ? "#b8891a" : "rgba(255,255,255,0.45)",
          }}>
            <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>{l.emoji}</span>
            <span style={{ fontSize: "0.58rem", fontWeight: 700, whiteSpace: "nowrap" }}>{l.label}</span>
          </a>
        ))}
      </nav>

      <style>{`
        .admin-topnav { display: flex !important; }
        .admin-bottomnav { display: none !important; }
        @media (max-width: 640px) {
          .admin-topnav { display: none !important; }
          .admin-bottomnav { display: flex !important; }
        }
      `}</style>
    </>
  );
}
