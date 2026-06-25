"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Cliente = {
  id: string; name: string | null; email: string; phone: string | null;
  createdAt: string; totalPedidos: number; totalGasto: number;
  totalPago: number; saldoAberto: number; ultimaCompra: string | null;
};

const inp = {
  padding: "0.5rem 0.75rem", border: "1px solid rgba(140,100,20,0.25)",
  borderRadius: "0.5rem", fontSize: "0.875rem", backgroundColor: "#FAF6EE",
  outline: "none", width: "100%", boxSizing: "border-box" as const,
};

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ClientesClient({ clientes }: { clientes: Cliente[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"nome" | "gasto" | "pedidos" | "saldo">("nome");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [mergingId, setMergingId] = useState<string | null>(null);
  const [mergeSearch, setMergeSearch] = useState("");
  const [merging, setMerging] = useState(false);

  const filtered = useMemo(() => {
    let list = clientes;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        (c.name || "").toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone || "").includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sort === "gasto") return b.totalGasto - a.totalGasto;
      if (sort === "pedidos") return b.totalPedidos - a.totalPedidos;
      if (sort === "saldo") return b.saldoAberto - a.saldoAberto;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [clientes, search, sort]);

  // KPIs
  const totalClientes = clientes.length;
  const totalGastoGeral = clientes.reduce((s, c) => s + c.totalGasto, 0);
  const totalSaldoGeral = clientes.reduce((s, c) => s + c.saldoAberto, 0);
  const clientesAtivos = clientes.filter(c => c.ultimaCompra && new Date(c.ultimaCompra) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;

  const handleCreate = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    setSaving(true);
    await fetch("/api/admin/clientes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim() || null,
        birthDate: newBirthDate || null,
      }),
    });
    setSaving(false);
    setShowNew(false);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewBirthDate("");
    router.refresh();
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    await fetch(`/api/admin/clientes/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        email: editEmail,
        phone: editPhone,
        birthDate: editBirthDate || null,
      }),
    });
    setSaving(false);
    setEditingId(null);
    router.refresh();
  };

  const handleDelete = async (id: string, name: string | null) => {
    if (!confirm(`Excluir "${name || "cliente"}"?`)) return;
    const res = await fetch(`/api/admin/clientes/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else { const d = await res.json(); alert(d.error || "Erro ao excluir."); }
  };

  const handleMerge = async (keepId: string, removeId: string) => {
    setMerging(true);
    const res = await fetch("/api/admin/clientes/merge", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keepId, removeId }),
    });
    setMerging(false);
    if (res.ok) { setMergingId(null); setMergeSearch(""); router.refresh(); }
    else { const d = await res.json(); alert(d.error || "Erro ao unificar."); }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.25rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#1a1510" }}>👥 Clientes</h1>
          <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.2rem" }}>{totalClientes} cadastros</p>
        </div>
        <button onClick={() => setShowNew(v => !v)}
          style={{ backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.75rem", padding: "0.6rem 1.25rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
          + Novo Cliente
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "0.875rem", marginBottom: "1.5rem" }}>
        {[
          { emoji: "👥", label: "Total", value: totalClientes },
          { emoji: "🔥", label: "Ativos (30 dias)", value: clientesAtivos },
          { emoji: "💰", label: "Total faturado", value: fmt(totalGastoGeral) },
          { emoji: "📒", label: "Saldo em aberto", value: fmt(totalSaldoGeral), warn: totalSaldoGeral > 0 },
        ].map(k => (
          <div key={k.label} style={{ backgroundColor: "#fff", border: `1px solid ${(k as any).warn ? "rgba(184,137,26,0.3)" : "rgba(140,100,20,0.1)"}`, borderRadius: "0.875rem", padding: "0.875rem 1rem" }}>
            <div style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>{k.emoji}</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 900, color: (k as any).warn ? "#856404" : "#1a1510" }}>{k.value}</div>
            <div style={{ fontSize: "0.7rem", color: "#9a8060", marginTop: "0.15rem" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Novo cliente */}
      {showNew && (
        <div style={{ backgroundColor: "#fff", border: "1px solid rgba(184,137,26,0.25)", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.25rem" }}>
          <p style={{ fontWeight: 800, color: "#1a1510", marginBottom: "0.875rem" }}>Novo Cliente</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.875rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>Nome completo *</label>
              <input style={inp} placeholder="Nome completo" value={newName} onChange={e => setNewName(e.target.value)} autoFocus required />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>E-mail *</label>
              <input style={inp} type="email" placeholder="email@exemplo.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>WhatsApp / Celular</label>
              <input style={inp} type="tel" placeholder="(47) 9 9999-9999" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>Data de nascimento</label>
              <input style={inp} type="date" value={newBirthDate} onChange={e => setNewBirthDate(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={handleCreate} disabled={saving || !newName.trim()}
              style={{ backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.625rem", padding: "0.5rem 1.25rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
              {saving ? "Salvando..." : "Cadastrar"}
            </button>
            <button onClick={() => { setShowNew(false); setNewName(""); setNewEmail(""); setNewPhone(""); setNewBirthDate(""); }}
              style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.2)", color: "#9a8060", borderRadius: "0.625rem", padding: "0.5rem 0.875rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Busca e ordenação */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "0.875rem 1.25rem", marginBottom: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder="🔍 Buscar cliente..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inp, flex: 1, minWidth: 180 }} />
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#9a8060", alignSelf: "center" }}>Ordenar:</span>
          {[
            { key: "nome", label: "Nome" },
            { key: "gasto", label: "Maior gasto" },
            { key: "pedidos", label: "Mais pedidos" },
            { key: "saldo", label: "Saldo aberto" },
          ].map(s => (
            <button key={s.key} onClick={() => setSort(s.key as any)}
              style={{ padding: "0.3rem 0.75rem", borderRadius: "999px", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, backgroundColor: sort === s.key ? "#b8891a" : "#FAF6EE", color: sort === s.key ? "#fff" : "#7a6030" }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#FAF6EE" }}>
                {["Cliente", "Contato", "Pedidos", "Total gasto", "Saldo", "Última compra", ""].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0.875rem 1rem", color: "#9a8060", fontWeight: 700, fontSize: "0.75rem", borderBottom: "1px solid rgba(140,100,20,0.1)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const isEditing = editingId === c.id;
                return (
                  <React.Fragment key={c.id}>
                    <tr style={{ borderBottom: "1px solid rgba(140,100,20,0.06)", backgroundColor: isEditing ? "#fffbf0" : undefined }}>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {isEditing ? (
                          <input style={inp} value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
                        ) : (
                          <div>
                            <Link href={`/admin/clientes/${c.id}`} style={{ fontWeight: 700, color: "#1a1510", textDecoration: "none", fontSize: "0.875rem" }}
                              onMouseOver={e => (e.currentTarget.style.color = "#b8891a")}
                              onMouseOut={e => (e.currentTarget.style.color = "#1a1510")}>
                              {c.name || "—"}
                            </Link>
                            <div style={{ fontSize: "0.68rem", color: "#b8a080", marginTop: "0.1rem" }}>
                              desde {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {isEditing ? (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            <input style={inp} type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="E-mail" />
                            <input style={inp} type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Telefone" />
                            <input style={inp} type="date" value={editBirthDate} onChange={e => setEditBirthDate(e.target.value)} placeholder="Data de nascimento" />
                          </div>
                        ) : (
                          <div style={{ fontSize: "0.8rem", color: "#5a4a2a" }}>
                            <div>{c.phone || <span style={{ color: "#ccc" }}>—</span>}</div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "#5a4a2a", fontWeight: 600 }}>{c.totalPedidos}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#1a8a2a", fontWeight: 700 }}>{fmt(c.totalGasto)}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {c.saldoAberto > 0
                          ? <span style={{ backgroundColor: "#fff8e1", color: "#856404", fontWeight: 700, fontSize: "0.8rem", padding: "0.2rem 0.5rem", borderRadius: 999 }}>{fmt(c.saldoAberto)}</span>
                          : <span style={{ color: "#b8a080", fontSize: "0.8rem" }}>—</span>
                        }
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "#9a8060", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {c.ultimaCompra ? new Date(c.ultimaCompra).toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {isEditing ? (
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <button onClick={() => handleSave(c.id)} disabled={saving}
                              style={{ backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.4rem", padding: "0.35rem 0.75rem", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>
                              {saving ? "..." : "Salvar"}
                            </button>
                            <button onClick={() => setEditingId(null)}
                              style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.2)", color: "#9a8060", borderRadius: "0.4rem", padding: "0.35rem 0.5rem", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>✕</button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                            <Link href={`/admin/clientes/${c.id}`}
                              style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(184,137,26,0.3)", color: "#b8891a", fontSize: "0.72rem", fontWeight: 700, padding: "0.3rem 0.625rem", borderRadius: "0.4rem", textDecoration: "none", whiteSpace: "nowrap" }}>
                              Ver perfil
                            </Link>
                            <button onClick={() => { setEditingId(c.id); setEditName(c.name || ""); setEditEmail(c.email); setEditPhone(c.phone || ""); setEditBirthDate(c.birthDate ? new Date(c.birthDate).toISOString().slice(0, 10) : ""); }}
                              style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.2)", color: "#7a6030", fontSize: "0.72rem", fontWeight: 700, padding: "0.3rem 0.5rem", borderRadius: "0.4rem", cursor: "pointer" }}>
                              ✏️
                            </button>
                            <button onClick={() => { setMergingId(mergingId === c.id ? null : c.id); setMergeSearch(""); }}
                              style={{ backgroundColor: "#f0e8ff", border: "1px solid rgba(106,48,184,0.2)", color: "#6a30b8", fontSize: "0.72rem", fontWeight: 700, padding: "0.3rem 0.5rem", borderRadius: "0.4rem", cursor: "pointer" }}>
                              🔗
                            </button>
                            {c.totalPedidos === 0 && (
                              <button onClick={() => handleDelete(c.id, c.name)}
                                style={{ backgroundColor: "#fee8e8", border: "1px solid rgba(192,64,64,0.2)", color: "#c04040", fontSize: "0.72rem", fontWeight: 700, padding: "0.3rem 0.5rem", borderRadius: "0.4rem", cursor: "pointer" }}>
                                🗑️
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                    {mergingId === c.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: "0.5rem 1rem 1rem", backgroundColor: "#f8f0ff" }}>
                          <div style={{ padding: "0.875rem", backgroundColor: "#fff", borderRadius: "0.75rem", border: "1px solid rgba(106,48,184,0.2)" }}>
                            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#5a1090", marginBottom: "0.5rem" }}>
                              🔗 Unificar com qual cliente? Pedidos serão movidos para <strong>{c.name}</strong>.
                            </p>
                            <input style={inp} placeholder="Buscar duplicata..." value={mergeSearch} onChange={e => setMergeSearch(e.target.value)} autoFocus />
                            {mergeSearch.length >= 2 && (
                              <div style={{ marginTop: "0.5rem", border: "1px solid rgba(106,48,184,0.15)", borderRadius: "0.5rem", overflow: "hidden" }}>
                                {clientes.filter(x => x.id !== c.id && (x.name || "").toLowerCase().includes(mergeSearch.toLowerCase())).slice(0, 5).map(x => (
                                  <button key={x.id} disabled={merging}
                                    onClick={() => { if (confirm(`Mover pedidos de "${x.name}" para "${c.name}"?`)) handleMerge(c.id, x.id); }}
                                    style={{ display: "flex", justifyContent: "space-between", width: "100%", textAlign: "left", padding: "0.5rem 0.75rem", background: "#fff", border: "none", borderBottom: "1px solid rgba(106,48,184,0.08)", cursor: "pointer", fontSize: "0.8rem" }}>
                                    <span style={{ fontWeight: 700 }}>{x.name}</span>
                                    <span style={{ color: "#9a8060" }}>{x.totalPedidos} pedidos</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            <button onClick={() => setMergingId(null)} style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#9a8060", background: "none", border: "none", cursor: "pointer" }}>Cancelar</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#b8a080" }}>Nenhum cliente encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
