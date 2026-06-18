"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from "react";

const CATEGORIES = [
  { value: "estoque", label: "🛍️ Reposição de Estoque" },
  { value: "marketing", label: "📣 Marketing" },
  { value: "embalagem", label: "📦 Embalagem" },
  { value: "frete", label: "🚚 Frete" },
  { value: "cartao", label: "💳 Cartão / Taxa" },
  { value: "outros", label: "📋 Outros" },
];

const PAYMENTS = [
  { value: "pix", label: "Pix" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "boleto", label: "Boleto" },
  { value: "dinheiro", label: "Dinheiro" },
];

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

type Supplier = { id: string; name: string };
type Expense = {
  id: string; date: string; description: string; amount: number;
  category: string; paymentMethod: string; notes?: string;
  supplier?: { id: string; name: string } | null;
};

export default function FinanceiroPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Formulário nova despesa
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: today(), description: "", amount: "",
    category: "outros", paymentMethod: "pix", supplierId: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fornecedor rápido
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (filterSupplier) params.set("supplierId", filterSupplier);
    if (filterCategory) params.set("category", filterCategory);
    const res = await fetch(`/api/admin/despesas?${params}`);
    if (res.ok) {
      const data = await res.json();
      setExpenses(data.expenses);
      setTotal(data.total);
    }
    setLoading(false);
  }, [from, to, filterSupplier, filterCategory]);

  const loadSuppliers = async () => {
    const res = await fetch("/api/admin/fornecedores");
    if (res.ok) setSuppliers(await res.json());
  };

  useEffect(() => { loadExpenses(); }, [loadExpenses]);
  useEffect(() => { loadSuppliers(); }, []);

  const openNew = () => {
    setEditId(null);
    setForm({ date: today(), description: "", amount: "", category: "outros", paymentMethod: "pix", supplierId: "", notes: "" });
    setError("");
    setShowForm(true);
  };

  const openEdit = (e: Expense) => {
    setEditId(e.id);
    setForm({
      date: e.date.split("T")[0], description: e.description,
      amount: String(e.amount), category: e.category,
      paymentMethod: e.paymentMethod, supplierId: e.supplier?.id || "", notes: e.notes || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.description.trim()) { setError("Informe a descrição."); return; }
    const amt = parseFloat(form.amount.replace(",", "."));
    if (!amt || amt <= 0) { setError("Informe um valor válido."); return; }

    setSaving(true); setError("");
    const url = editId ? `/api/admin/despesas/${editId}` : "/api/admin/despesas";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: amt }),
    });
    setSaving(false);
    if (res.ok) { setShowForm(false); loadExpenses(); }
    else { const d = await res.json(); setError(d.error || "Erro ao salvar."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta despesa?")) return;
    await fetch(`/api/admin/despesas/${id}`, { method: "DELETE" });
    loadExpenses();
  };

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) return;
    const res = await fetch("/api/admin/fornecedores", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSupplierName.trim() }),
    });
    if (res.ok) {
      const s = await res.json();
      await loadSuppliers();
      setForm(f => ({ ...f, supplierId: s.id }));
      setNewSupplierName("");
      setShowSupplierForm(false);
    }
  };

  const catLabel = (v: string) => CATEGORIES.find(c => c.value === v)?.label || v;
  const payLabel = (v: string) => PAYMENTS.find(p => p.value === v)?.label || v;

  // Totais por categoria no período
  const byCategory = CATEGORIES.map(c => ({
    ...c,
    total: expenses.filter(e => e.category === c.value).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const maxCat = byCategory[0]?.total || 1;

  const inp = (style?: object) => ({
    width: "100%", padding: "0.6rem 0.875rem",
    border: "1px solid rgba(140,100,20,0.25)", borderRadius: "0.625rem",
    fontSize: "0.875rem", backgroundColor: "#FAF6EE",
    outline: "none", boxSizing: "border-box" as const,
    ...style,
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <a href="/admin" style={{ color: "#b8891a", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none" }}>← Painel</a>
          <h1 style={{ color: "#1a1510", fontSize: "1.75rem", fontWeight: 900, lineHeight: 1, marginTop: "0.3rem" }}>Financeiro</h1>
          <p style={{ color: "#9a8060", fontSize: "0.85rem", marginTop: "0.2rem" }}>Controle de despesas e gastos da loja</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <a href="/admin/fornecedores" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: "#fff", border: "1px solid rgba(184,137,26,0.3)", color: "#b8891a", fontWeight: 700, fontSize: "0.8rem", padding: "0.5rem 1rem", borderRadius: "0.625rem", textDecoration: "none" }}>
            🏭 Fornecedores
          </a>
          <button onClick={openNew} style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "0.6rem 1.25rem", borderRadius: "0.75rem", border: "none", cursor: "pointer" }}>
            + Nova Despesa
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label style={{ fontSize: "0.7rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>DE</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ ...inp(), width: 160 }} />
        </div>
        <div>
          <label style={{ fontSize: "0.7rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>ATÉ</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ ...inp(), width: 160 }} />
        </div>
        <div>
          <label style={{ fontSize: "0.7rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>FORNECEDOR</label>
          <select value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)} style={{ ...inp(), width: 180 }}>
            <option value="">Todos</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: "0.7rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>CATEGORIA</label>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ ...inp(), width: 200 }}>
            <option value="">Todas</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <button onClick={loadExpenses} style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, fontSize: "0.8rem", padding: "0.6rem 1.25rem", borderRadius: "0.625rem", border: "none", cursor: "pointer", height: 37 }}>
          Filtrar
        </button>
        <button onClick={() => { setFrom(firstOfMonth()); setTo(today()); setFilterSupplier(""); setFilterCategory(""); }}
          style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.2)", color: "#9a8060", fontWeight: 700, fontSize: "0.8rem", padding: "0.6rem 1rem", borderRadius: "0.625rem", cursor: "pointer", height: 37 }}>
          Limpar
        </button>
      </div>

      {/* KPI total + gráfico por categoria */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ backgroundColor: "#b8891a", borderRadius: "1rem", padding: "1.5rem 2rem", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 200 }}>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>TOTAL NO PERÍODO</div>
          <div style={{ color: "#fff", fontSize: "2rem", fontWeight: 900, lineHeight: 1 }}>{fmt(total)}</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem", marginTop: "0.4rem" }}>{expenses.length} lançamentos</div>
        </div>

        {byCategory.length > 0 ? (
          <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.25rem" }}>
            <h3 style={{ color: "#1a1510", fontWeight: 800, fontSize: "0.875rem", marginBottom: "1rem" }}>Gastos por Categoria</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {byCategory.map(c => (
                <div key={c.value}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "#5a4a2a" }}>{c.label}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1a1510" }}>{fmt(c.total)}</span>
                  </div>
                  <div style={{ height: 8, backgroundColor: "#f0e8d0", borderRadius: 999 }}>
                    <div style={{ height: "100%", width: `${Math.round((c.total / maxCat) * 100)}%`, backgroundColor: "#b8891a", borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#b8a080", fontSize: "0.875rem" }}>Nenhuma despesa no período selecionado.</p>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: "1px solid rgba(140,100,20,0.08)", backgroundColor: "#FAF6EE" }}>
          <h2 style={{ color: "#1a1510", fontWeight: 800, fontSize: "1rem" }}>Lançamentos</h2>
          <span style={{ fontSize: "0.75rem", color: "#9a8060" }}>{expenses.length} registros</span>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#b8a080" }}>Carregando...</div>
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "#b8a080", marginBottom: "1rem" }}>Nenhuma despesa encontrada.</p>
            <button onClick={openNew} style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, padding: "0.6rem 1.25rem", borderRadius: "0.75rem", border: "none", cursor: "pointer" }}>
              + Lançar primeira despesa
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#FDFAF4" }}>
                  {["Data", "Descrição", "Categoria", "Fornecedor", "Pagamento", "Valor", ""].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#9a8060", fontWeight: 700, fontSize: "0.75rem", borderBottom: "1px solid rgba(140,100,20,0.08)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} style={{ borderBottom: "1px solid rgba(140,100,20,0.05)" }}>
                    <td style={{ padding: "0.75rem 1rem", color: "#9a8060", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {new Date(e.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#1a1510", fontWeight: 600 }}>
                      {e.description}
                      {e.notes && <div style={{ color: "#9a8060", fontSize: "0.7rem", fontWeight: 400 }}>{e.notes}</div>}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{ fontSize: "0.7rem", backgroundColor: "#f0e8d0", color: "#7a5a10", padding: "0.2rem 0.5rem", borderRadius: 999, whiteSpace: "nowrap" }}>
                        {catLabel(e.category)}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#5a4a2a", fontSize: "0.8rem" }}>
                      {e.supplier?.name || "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#5a4a2a", fontSize: "0.8rem" }}>{payLabel(e.paymentMethod)}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#c04040", fontWeight: 700, whiteSpace: "nowrap" }}>
                      -{fmt(e.amount)}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button onClick={() => openEdit(e)} style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.2)", color: "#b8891a", fontWeight: 700, fontSize: "0.7rem", padding: "0.3rem 0.625rem", borderRadius: "0.5rem", cursor: "pointer" }}>
                          Editar
                        </button>
                        <button onClick={() => handleDelete(e.id)} style={{ backgroundColor: "#fee8e8", border: "1px solid rgba(192,64,64,0.2)", color: "#c04040", fontWeight: 700, fontSize: "0.7rem", padding: "0.3rem 0.625rem", borderRadius: "0.5rem", cursor: "pointer" }}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: "#FAF6EE" }}>
                  <td colSpan={5} style={{ padding: "0.875rem 1rem", fontWeight: 700, color: "#1a1510", fontSize: "0.875rem" }}>Total</td>
                  <td style={{ padding: "0.875rem 1rem", fontWeight: 900, color: "#c04040", fontSize: "1rem", whiteSpace: "nowrap" }}>-{fmt(total)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nova/Editar Despesa */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ backgroundColor: "#FAF6EE", borderRadius: "1.25rem", padding: "2rem", width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "#1a1510", fontWeight: 900, fontSize: "1.1rem" }}>{editId ? "Editar Despesa" : "Nova Despesa"}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#9a8060" }}>✕</button>
            </div>

            {error && <div style={{ backgroundColor: "#fee8e8", border: "1px solid rgba(192,64,64,0.3)", borderRadius: "0.625rem", padding: "0.75rem 1rem", marginBottom: "1rem", color: "#c04040", fontSize: "0.8rem" }}>{error}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>Data *</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp()} />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>Valor (R$) *</label>
                  <input type="text" placeholder="0,00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={inp()} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>Descrição *</label>
                <input type="text" placeholder="Ex: Compra de leggings — Liss Fitness" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={inp()} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>Categoria</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp()}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>Pagamento</label>
                  <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} style={inp()}>
                    {PAYMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a" }}>Fornecedor</label>
                  <button type="button" onClick={() => setShowSupplierForm(s => !s)} style={{ background: "none", border: "none", color: "#b8891a", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>
                    + Novo
                  </button>
                </div>
                {showSupplierForm && (
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <input type="text" placeholder="Nome do fornecedor" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} style={{ ...inp(), flex: 1 }} />
                    <button onClick={handleAddSupplier} style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, padding: "0 0.875rem", borderRadius: "0.625rem", border: "none", cursor: "pointer", whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                      Salvar
                    </button>
                  </div>
                )}
                <select value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))} style={inp()}>
                  <option value="">Sem fornecedor</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>Observações</label>
                <textarea rows={2} placeholder="Anotação opcional..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inp(), resize: "vertical" as const }} />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.2)", color: "#5a4a2a", fontWeight: 700, padding: "0.75rem", borderRadius: "0.75rem", cursor: "pointer" }}>
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 2, backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, padding: "0.75rem", borderRadius: "0.75rem", border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Salvando..." : editId ? "Salvar Alterações" : "Lançar Despesa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
