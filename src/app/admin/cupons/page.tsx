"use client";
import { useState, useEffect } from "react";

type Coupon = {
  id: string; code: string; discount: number; type: string;
  maxUses: number | null; usedCount: number; active: boolean;
  expiresAt: string | null; createdAt: string;
};

const inp = {
  padding: "0.6rem 0.875rem", border: "1px solid rgba(140,100,20,0.25)",
  borderRadius: "0.625rem", fontSize: "0.875rem", backgroundColor: "#FAF6EE",
  outline: "none", width: "100%", boxSizing: "border-box" as const,
};
const label = { fontSize: "0.75rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" } as const;

export default function CuponsPage() {
  const [cupons, setCupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", discount: "", maxUses: "", expiresAt: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/cupons");
    if (res.ok) setCupons(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setError("");
    if (!form.code || !form.discount) { setError("Código e desconto são obrigatórios."); return; }
    setSaving(true);
    const res = await fetch("/api/admin/cupons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { setForm({ code: "", discount: "", maxUses: "", expiresAt: "" }); setShowForm(false); load(); }
    else { const d = await res.json(); setError(d.error); }
  };

  const toggleActive = async (coupon: Coupon) => {
    await fetch(`/api/admin/cupons/${coupon.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    load();
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Excluir cupom "${code}"?`)) return;
    await fetch(`/api/admin/cupons/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>
      <a href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</a>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0.3rem 0 1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#1a1510" }}>🎟️ Cupons de Desconto</h1>
        <button onClick={() => setShowForm(v => !v)}
          style={{ backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.75rem", padding: "0.6rem 1.25rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
          + Novo Cupom
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div style={{ backgroundColor: "#fff", border: "1px solid rgba(184,137,26,0.25)", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <p style={{ fontWeight: 800, color: "#1a1510", marginBottom: "1rem" }}>Novo Cupom</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.875rem", marginBottom: "1rem" }}>
            <div>
              <label style={label}>Código *</label>
              <input style={inp} placeholder="PROMO10" value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
            </div>
            <div>
              <label style={label}>Desconto (%) *</label>
              <input style={inp} type="number" min="1" max="100" placeholder="10" value={form.discount}
                onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} />
            </div>
            <div>
              <label style={label}>Limite de usos</label>
              <input style={inp} type="number" min="1" placeholder="Ilimitado" value={form.maxUses}
                onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))} />
            </div>
            <div>
              <label style={label}>Validade</label>
              <input style={inp} type="date" value={form.expiresAt}
                onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} />
            </div>
          </div>
          {error && <p style={{ color: "#c04040", fontSize: "0.8rem", marginBottom: "0.75rem" }}>{error}</p>}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleCreate} disabled={saving}
              style={{ backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.625rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Salvando..." : "Criar Cupom"}
            </button>
            <button onClick={() => { setShowForm(false); setError(""); }}
              style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.2)", color: "#9a8060", borderRadius: "0.625rem", padding: "0.6rem 1rem", fontWeight: 700, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
        {loading ? (
          <p style={{ textAlign: "center", padding: "3rem", color: "#9a8060" }}>Carregando...</p>
        ) : cupons.length === 0 ? (
          <p style={{ textAlign: "center", padding: "3rem", color: "#9a8060" }}>Nenhum cupom criado ainda.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#FAF6EE" }}>
                {["Código", "Desconto", "Usos", "Validade", "Status", ""].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0.875rem 1rem", color: "#9a8060", fontWeight: 700, fontSize: "0.75rem", borderBottom: "1px solid rgba(140,100,20,0.1)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cupons.map(c => {
                const expired = c.expiresAt && new Date() > new Date(c.expiresAt);
                const esgotado = c.maxUses && c.usedCount >= c.maxUses;
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid rgba(140,100,20,0.06)" }}>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: "1rem", color: "#1a1510", backgroundColor: "#F0E8D0", padding: "0.2rem 0.6rem", borderRadius: "0.375rem" }}>
                        {c.code}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", fontWeight: 900, color: "#b8891a", fontSize: "1.1rem" }}>
                      {c.discount}%
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#5a4a2a", fontSize: "0.85rem" }}>
                      {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : " / ∞"}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: expired ? "#c04040" : "#5a4a2a", fontSize: "0.8rem" }}>
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("pt-BR") : "Sem validade"}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.625rem", borderRadius: "999px", backgroundColor: c.active && !expired && !esgotado ? "#e8f8e8" : "#fee8e8", color: c.active && !expired && !esgotado ? "#1a8a2a" : "#c04040" }}>
                        {expired ? "Expirado" : esgotado ? "Esgotado" : c.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => toggleActive(c)}
                          style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.3rem 0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(140,100,20,0.2)", backgroundColor: "#FAF6EE", color: "#7a5a20", cursor: "pointer" }}>
                          {c.active ? "Desativar" : "Ativar"}
                        </button>
                        <button onClick={() => handleDelete(c.id, c.code)}
                          style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.3rem 0.75rem", borderRadius: "0.5rem", border: "none", backgroundColor: "#fee8e8", color: "#c04040", cursor: "pointer" }}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
