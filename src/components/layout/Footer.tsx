export default function Footer() {
  return (
    <footer style={{
      backgroundColor: "#050505", borderTop: "1px solid rgba(139,92,246,0.08)",
      padding: "2.5rem 1.25rem 1.5rem", fontSize: "0.85rem",
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "2rem" }}>
        <div>
          <h4 style={{ fontWeight: 800, marginBottom: "0.5rem" }} className="neon-text">AVANT 3D LAB</h4>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Miniaturas 3D Exclusivas</p>
        </div>
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: "0.5rem", color: "rgba(255,255,255,0.6)" }}>Contato</h4>
          <a href="https://wa.me/5551993196828" target="_blank" rel="noopener noreferrer"
            style={{ color: "#25D366", textDecoration: "none", display: "block", marginBottom: "0.25rem" }}>WhatsApp</a>
        </div>
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: "0.5rem", color: "rgba(255,255,255,0.6)" }}>Links</h4>
          <a href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", display: "block", marginBottom: "0.25rem" }}>Produtos</a>
          <a href="/sobre" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", display: "block" }}>Sobre</a>
        </div>
      </div>
      <div style={{ textAlign: "center", paddingTop: "2rem", marginTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>
        © 2026 AVANT 3D LAB. Todos os direitos reservados.
      </div>
    </footer>
  );
}
