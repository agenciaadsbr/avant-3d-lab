"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { useState, useEffect } from "react";
import Image from "next/image";

const navLinks = [
  { href: "/produtos", label: "Coleção" },
  { href: "/produtos?categoria=leggings", label: "Leggings" },
  { href: "/produtos?categoria=tops", label: "Tops" },
  { href: "/produtos?categoria=conjuntos", label: "Conjuntos" },
  { href: "/produtos?categoria=shorts", label: "Shorts" },
  { href: "/sobre", label: "Sobre Nós" },
];

export default function Header() {
  const { data: session } = useSession();
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        backgroundColor: "rgba(250,246,238,0.97)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(140,100,20,0.15)",
        boxShadow: "0 1px 12px rgba(140,100,20,0.06)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.25rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
            <div style={{ width: 48, height: 48, position: "relative", flexShrink: 0, borderRadius: "50%", overflow: "hidden", mixBlendMode: "multiply" }}>
              <Image src="/logo.png" alt="Access Fit Logo" fill style={{ objectFit: "cover" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "0.12em", background: "linear-gradient(135deg, #c9920a, #e0b030, #a07010)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ACCESS FIT
              </span>
              <span style={{ fontSize: "0.55rem", color: "#9a7a3a", letterSpacing: "0.08em", fontWeight: 500 }}>
                Desbloqueie sua energia infinita
              </span>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav style={{ display: "flex", gap: "1.75rem", alignItems: "center" }} className="hide-mobile">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                style={{ color: "#7a6030", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none", letterSpacing: "0.02em" }}
                onMouseOver={e => (e.currentTarget.style.color = "#b8891a")}
                onMouseOut={e => (e.currentTarget.style.color = "#7a6030")}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>

            {/* User dropdown */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setUserOpen(!userOpen)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "10px", color: "#7a6030", display: "flex", alignItems: "center", borderRadius: "0.5rem" }}>
                <User size={20} />
              </button>
              {userOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setUserOpen(false)} />
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 200, backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.15)", borderRadius: "0.875rem", overflow: "hidden", zIndex: 50, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                    {session ? (
                      <>
                        <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(140,100,20,0.1)", backgroundColor: "#FAF6EE" }}>
                          <p style={{ color: "#9a8060", fontSize: "0.7rem" }}>Olá,</p>
                          <p style={{ color: "#b8891a", fontSize: "0.9rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {session.user?.name}
                          </p>
                        </div>
                        {[
                          { label: "Minha Conta", href: "/conta" },
                          { label: "Meus Pedidos", href: "/conta/pedidos" },
                          ...((session.user as any)?.role === "admin" ? [{ label: "⚙ Painel Admin", href: "/admin" }] : []),
                        ].map(item => (
                          <Link key={item.href} href={item.href} onClick={() => setUserOpen(false)}
                            style={{ display: "block", padding: "0.65rem 1rem", color: "#3a2a10", fontSize: "0.875rem", textDecoration: "none" }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#FAF6EE"; (e.currentTarget as HTMLElement).style.color = "#b8891a"; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; (e.currentTarget as HTMLElement).style.color = "#3a2a10"; }}>
                            {item.label}
                          </Link>
                        ))}
                        <button onClick={() => { signOut(); setUserOpen(false); }}
                          style={{ width: "100%", textAlign: "left", padding: "0.65rem 1rem", background: "none", border: "none", borderTop: "1px solid rgba(140,100,20,0.1)", color: "#c04040", fontSize: "0.875rem", cursor: "pointer" }}>
                          Sair
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setUserOpen(false)}
                          style={{ display: "block", padding: "0.875rem 1rem", color: "#b8891a", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
                          Entrar
                        </Link>
                        <Link href="/cadastro" onClick={() => setUserOpen(false)}
                          style={{ display: "block", padding: "0.875rem 1rem", color: "#7a6030", fontSize: "0.875rem", textDecoration: "none", borderTop: "1px solid rgba(140,100,20,0.1)" }}>
                          Criar conta
                        </Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Cart */}
            <button onClick={openCart}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "10px", color: "#7a6030", position: "relative", display: "flex", alignItems: "center", borderRadius: "0.5rem" }}>
              <ShoppingBag size={20} />
              {mounted && count() > 0 && (
                <span style={{ position: "absolute", top: 4, right: 4, backgroundColor: "#b8891a", color: "#fff", fontSize: "0.6rem", fontWeight: 900, borderRadius: "999px", minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                  {count()}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "10px", color: "#7a6030", display: "none", alignItems: "center", borderRadius: "0.5rem" }}
              className="show-mobile">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div style={{ backgroundColor: "#F5EFE2", borderTop: "1px solid rgba(140,100,20,0.1)", padding: "0.5rem 1rem 1rem" }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                style={{ display: "block", padding: "0.75rem 0.5rem", color: "#5a4020", fontSize: "0.95rem", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid rgba(140,100,20,0.06)" }}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 768px) { .hide-mobile { display: none !important; } .show-mobile { display: flex !important; } }
        @media (min-width: 769px) { .show-mobile { display: none !important; } }
      `}</style>
    </>
  );
}
