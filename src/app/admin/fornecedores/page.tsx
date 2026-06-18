"use client";
import { useState, useEffect } from "react";

type Supplier = { id: string; name: string; contact?: string; email?: string; phone?: string; notes?: string; _count?: { expenses: number } };

export default function FornecedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", contact: "", email: "", phone: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/fornecedores");
    if (res.ok) setSuppliers(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditId(null);
    setForm({ name: "", contact: "", email: "", phone: "", notes: "" });
    setError(""); setShowForm(true);
  };

  const openEdit = (s: Supplier) => {
    setEditId(s.id);
    setForm({ name: s.name, contact: s.contact || "", email: s.email || "", phone: s.phone || "", notes: s.notes || "" });
    setError(""); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Nome obrigatório."); return; }
    setSaving(true); setError("");
    const url = editId ? `/api/admin/fornecedores/${editId}` : "/api/admin/fornecedores";
    const res = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { setShowForm(false); load(); }
    else { const d = await res.json(); setError(d.error || "Erro ao salvar."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir fornecedor?")) return;
    await fetch(`/api/admin/fornecedores/${id}`, { method: "DELETE" });
    load();
  };

  const inp = (style?: object) => ({
    width: "100%", padding: "0.6rem 0.875rem",
    border: "1px solid rgba(140,100,20,0.25)", borderRadius: "0.625rem",
    fontSize: "0.875rem", backgroundColor: "#FAF6EE",
    outline: "none", boxSizing: "border-box" as const, ...style,
  });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <a href="/admin/financeiro" style={{ color: "#b8891a", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none" }}>← Financeiro</a>
          <h1 style={{ color: "#1a1510", fontSize: "1.75rem", fontWeight: 900, lineHeight: 1, marginTop: "0.3rem" }}>Fornecedores</h1>
        </div>
        <button onClick={openNew} style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "0.6rem 1.25rem", borderRadius: "0.75rem", border: "none", cursor: "pointer" }}>
          + Novo Fornecedor
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#b8a080" }}>Carregando...</div>
      ) : suppliers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "#fff", borderRadius: "1rem", border: "1.5px dashed rgba(140,100,20,0.2)" }}>
          <p style={{ color: "#9a8060", marginBottom: "1rem" }}>Nenhum fornecedor cadastrado ainda.</p>
          <button onClick={openNew} style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, padding: "0.6rem 1.25rem", borderRadius: "0.75rem", border: "none", cursor: "pointer" }}>
            Cadastrar primeiro fornecedor
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {suppliers.map(s => (
            <div key={s.id} style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <h3 style={{ color: "#1a1510", fontWeight: 800, fontSize: "1rem" }}>{s.name}</h3>
                <span style={{ fontSize: "0.65rem", backgroundColor: "#f0e8d0", color: "#7a5a10", padding: "0.2rem 0.5rem", borderRadius: 999 }}>
                  {s._count?.expenses || 0} despesas
                </span>
              </div>
              {s.contact && <p style={{ color: "#5a4a2a", fontSize: "0.8rem", marginBottom: "0.3rem" }}>👤 {s.contact}</p>}
              {s.phone && <p style={{ color: "#5a4a2a", fontSize: "0.8rem", marginBottom: "0.3rem" }}>📞 {s.phone}</p>}
              {s.email && <p style={{ color: "#5a4a2a", fontSize: "0.8rem", marginBottom: "0.3rem" }}>📧 {s.email}</p>}
              {s.notes && <p style={{ color: "#9a8060", fontSize: "0.75rem", marginTop: "0.5rem", fontStyle: "italic" }}>{s.notes}</p>}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", paddingTop: "0.875rem", borderTop: "1px solid rgba(140,100,20,0.08)" }}>
                <button onClick={() => openEdit(s)} style={{ flex: 1, backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.2)", color: "#b8891a", fontWeight: 700, fontSize: "0.75rem", padding: "0.4rem", borderRadius: "0.5rem", cursor: "pointer" }}>
                  Editar
                </button>
                <button onClick={() => handleDelete(s.id)} style={{ flex: 1, backgroundColor: "#fee8e8", border: "1px solid rgba(192,64,64,0.15)", color: "#c04040", fontWeight: 700, fontSize: "0.75rem", padding: "0.4rem", borderRadius: "0.5rem", cursor: "pointer" }}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ backgroundColor: "#FAF6EE", borderRadius: "1.25rem", padding: "2rem", width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "#1a1510", fontWeight: 900, fontSize: "1.1rem" }}>{editId ? "Editar" : "Novo"} Fornecedor</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#9a8060" }}>✕</button>
            </div>
            {error && <div style={{ backgroundColor: "#fee8e8", borderRadius: "0.625rem", padding: "0.75rem", marginBottom: "1rem", color: "#c04040", fontSize: "0.8rem" }}>{error}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.35rem" }}>Nome *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Liss Fitness" style={inp()} />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.35rem" }}>Contato</label>
                <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Nome do responsável" style={inp()} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.35rem" }}>Telefone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" style={inp()} />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.35rem" }}>Email</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@fornecedor.com" style={inp()} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.35rem" }}>Observações</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notas..." style={{ ...inp(), resize: "vertical" as const }} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.2)", color: "#5a4a2a", fontWeight: 700, padding: "0.75rem", borderRadius: "0.75rem", cursor: "pointer" }}>
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 2, backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, padding: "0.75rem", borderRadius: "0.75rem", border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
