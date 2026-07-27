"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

const navLinks = [
  { href: "/#produtos", label: "Produtos" },
  { href: "/sobre", label: "Sobre" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        backgroundColor: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(139,92,246,0.1)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 1rem" : "0 1.25rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: "0.6rem", overflow: "hidden", border: "1px solid rgba(139,92,246,0.25)", flexShrink: 0 }}>
              <Image src="/img/logo.jpg" alt="AVANT 3D LAB" width={40} height={40} style={{ objectFit: "cover" }} />
            </div>
            <span style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "0.08em" }} className="neon-text">
              AVANT 3D LAB
            </span>
          </Link>

          <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }} className="hide-mobile">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
                {link.label}
              </Link>
            ))}
          </nav>

          <button onClick={() => setMenuOpen(!menuOpen)}
            className="show-mobile"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "10px", color: "rgba(255,255,255,0.7)", display: isMobile ? "flex" : "none", alignItems: "center", borderRadius: "0.5rem" }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <div style={{ backgroundColor: "#0A0A0A", borderTop: "1px solid rgba(139,92,246,0.08)", padding: "0.5rem 1rem 1rem" }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                style={{ display: "block", padding: "0.75rem 0.5rem", color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid rgba(139,92,246,0.06)" }}>
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
