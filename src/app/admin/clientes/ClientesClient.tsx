"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type Cliente = {
  id: string; name: string | null; email: string; phone: string | null;
  createdAt: string; _count: { orders: number };
};

const inp = {
  padding: "0.5rem 0.75rem", border: "1px solid rgba(140,100,20,0.25)",
  borderRadius: "0.5rem", fontSize: "0.875rem", backgroundColor: "#FAF6EE",
  outline: "none", width: "100%", boxSizing: "border-box" as const,
};

export default function ClientesClient({ clientes }: { clientes: Cliente[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const filtered = useMemo(() => {
    if (!search) return clientes;
    const q = search.toLowerCase();
    return clientes.filter(c =>
      (c.name || "").toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone || "").includes(q)
    );
  }, [clientes, search]);

  const startEdit = (c: Cliente) => {
    setEditingId(c.id);
    setEditName(c.name || "");
    setEditPhone(c.phone || "");
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const email = `${newName.toLowerCase().replace(/\s+/g, ".")}.${Date.now()}@cliente.accessfit.com.br`;
    await fetch("/api/admin/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), phone: newPhone.trim() || null, email }),
    });
    setSaving(false);
    setShowNew(false);
    setNewName("");
    setNewPhone("");
    router.refresh();
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    await fetch(`/api/admin/clientes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, phone: editPhone }),
    });
    setSaving(false);
    setEditingId(null);
    router.refresh();
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <a href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</a>
          <h1 style={{ color: "#1a1510", fontSize: "1.75rem", fontWeight: 900, marginTop: "0.2rem" }}>👥 Clientes</h1>
          <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.2rem" }}>{clientes.length} cadastros</p>
        </div>
        <button onClick={() => setShowNew(v => !v)}
          style={{ backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.75rem", padding: "0.6rem 1.25rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
          + Novo Cliente
        </button>
      </div>

      {/* Formulário novo cliente */}
      {showNew && (
        <div style={{ backgroundColor: "#fff", border: "1px solid rgba(184,137,26,0.25)", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.25rem" }}>
          <p style={{ fontWeight: 800, color: "#1a1510", marginBottom: "0.875rem" }}>Novo Cliente</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.875rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>Nome *</label>
              <input style={inp} placeholder="Nome completo" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>Telefone</label>
              <input style={inp} placeholder="(47) 9..." value={newPhone} onChange={e => setNewPhone(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={handleCreate} disabled={saving || !newName.trim()}
              style={{ backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.625rem", padding: "0.5rem 1.25rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
              {saving ? "Salvando..." : "Cadastrar"}
            </button>
            <button onClick={() => { setShowNew(false); setNewName(""); setNewPhone(""); }}
              style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.2)", color: "#9a8060", borderRadius: "0.625rem", padding: "0.5rem 0.875rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Busca */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "0.875rem 1.25rem", marginBottom: "1.25rem" }}>
        <input
          type="text" placeholder="🔍 Buscar por nome, e-mail ou telefone..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inp, backgroundColor: "#FAF6EE" }}
        />
      </div>

      {/* Tabela */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#FAF6EE" }}>
                {["Nome", "E-mail", "Telefone", "Pedidos", "Cadastro", ""].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0.875rem 1rem", color: "#9a8060", fontWeight: 700, fontSize: "0.75rem", borderBottom: "1px solid rgba(140,100,20,0.1)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const isEditing = editingId === c.id;
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid rgba(140,100,20,0.06)", backgroundColor: isEditing ? "#fffbf0" : undefined }}>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {isEditing ? (
                        <input style={inp} value={editName} onChange={e => setEditName(e.target.value)} autoFocus placeholder="Nome completo" />
                      ) : (
                        <span style={{ fontWeight: 600, color: "#1a1510" }}>{c.name || <span style={{ color: "#ccc" }}>—</span>}</span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#5a4a2a", fontSize: "0.8rem" }}>{c.email}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {isEditing ? (
                        <input style={inp} value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="(47) 9..." />
                      ) : (
                        <span style={{ color: "#5a4a2a", fontSize: "0.8rem" }}>{c.phone || "—"}</span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#5a4a2a" }}>{c._count.orders}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#9a8060", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button onClick={() => handleSave(c.id)} disabled={saving}
                            style={{ backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.4rem", padding: "0.35rem 0.75rem", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                            {saving ? "..." : "Salvar"}
                          </button>
                          <button onClick={() => setEditingId(null)}
                            style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.2)", color: "#9a8060", borderRadius: "0.4rem", padding: "0.35rem 0.75rem", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(c)}
                          style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(184,137,26,0.3)", color: "#b8891a", fontSize: "0.75rem", fontWeight: 700, padding: "0.35rem 0.75rem", borderRadius: "0.5rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                          ✏️ Editar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#b8a080" }}>
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
