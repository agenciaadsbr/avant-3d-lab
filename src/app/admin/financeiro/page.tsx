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

function fmt(n: number) { return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function today() { return new Date().toISOString().split("T")[0]; }
function firstOfMonth() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`; }
function lastOfMonth() { const d = new Date(); const last = new Date(d.getFullYear(), d.getMonth()+1, 0); return last.toISOString().split("T")[0]; }

type Supplier = { id: string; name: string };
type Expense = { id: string; date: string; description: string; amount: number; category: string; paymentMethod: string; notes?: string; dueDate?: string | null; installments?: number; installmentNumber?: number; supplier?: { id: string; name: string } | null };
type Aporte = { id: string; amount: number; date: string; description?: string | null };

function nextMonthRange() {
  const d = new Date();
  const y = d.getMonth() === 11 ? d.getFullYear()+1 : d.getFullYear();
  const m = (d.getMonth()+1) % 12;
  const last = new Date(y, m+1, 0);
  return { from: `${y}-${String(m+1).padStart(2,"0")}-01`, to: `${y}-${String(m+1).padStart(2,"0")}-${String(last.getDate()).padStart(2,"0")}` };
}

export default function FinanceiroPage() {
  const [tab, setTab] = useState<"caixa"|"lancamentos"|"cartao">("caixa");

  // ── CAIXA ──
  const [caixaFrom, setCaixaFrom] = useState(firstOfMonth());
  const [caixaTo, setCaixaTo] = useState(lastOfMonth());
  const [caixaReceitas, setCaixaReceitas] = useState(0);
  const [caixaDespesas, setCaixaDespesas] = useState(0);
  const [caixaAportes, setCaixaAportes] = useState<Aporte[]>([]);
  const [caixaAportesTotal, setCaixaAportesTotal] = useState(0);
  const [caixaSaldoTotal, setCaixaSaldoTotal] = useState(0);
  const [caixaData, setCaixaData] = useState<any>(null);
  const [loadingCaixa, setLoadingCaixa] = useState(true);
  const [corte, setCorte] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("caixa_corte") || "2026-06-01";
    return "2026-06-01";
  });
  const [editandoCorte, setEditandoCorte] = useState(false);
  const [showAporteForm, setShowAporteForm] = useState<"aporte"|"retirada"|null>(null);
  const [aporteForm, setAporteForm] = useState({ amount: "", date: today(), description: "" });
  const [savingAporte, setSavingAporte] = useState(false);

  const loadCaixa = useCallback(async () => {
    setLoadingCaixa(true);
    const [recRes, despRes, aporteRes, totalRes] = await Promise.all([
      fetch(`/api/admin/caixa?from=${caixaFrom}&to=${caixaTo}`),
      fetch(`/api/admin/despesas?from=${caixaFrom}&to=${caixaTo}`),
      fetch(`/api/admin/aportes?from=${caixaFrom}&to=${caixaTo}`),
      fetch(`/api/admin/caixa/saldo?from=${corte}`),
    ]);
    if (recRes.ok) { const d = await recRes.json(); setCaixaReceitas(d.total || 0); }
    if (despRes.ok) { const d = await despRes.json(); setCaixaDespesas(d.total || 0); }
    if (aporteRes.ok) { const d = await aporteRes.json(); setCaixaAportes(d.aportes); setCaixaAportesTotal(d.total); }
    if (totalRes.ok) { const d = await totalRes.json(); setCaixaSaldoTotal(d.caixa); setCaixaData(d); }
    setLoadingCaixa(false);
  }, [caixaFrom, caixaTo, corte]);

  useEffect(() => { loadCaixa(); }, [loadCaixa]);

  const saveAporte = async () => {
    if (!aporteForm.amount || !aporteForm.date) return;
    setSavingAporte(true);
    const isRetirada = showAporteForm === "retirada";
    const amount = isRetirada ? -Math.abs(parseFloat(aporteForm.amount)) : Math.abs(parseFloat(aporteForm.amount));
    await fetch("/api/admin/aportes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...aporteForm, amount }) });
    setSavingAporte(false);
    setShowAporteForm(null);
    setAporteForm({ amount: "", date: today(), description: "" });
    loadCaixa();
  };

  const deleteAporte = async (id: string) => {
    if (!confirm("Excluir aporte?")) return;
    await fetch("/api/admin/aportes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    loadCaixa();
  };

  // ── LANÇAMENTOS ──
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ date: today(), description: "", amount: "", category: "outros", paymentMethod: "pix", supplierId: "", notes: "", installments: "1", dueDate: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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
    if (res.ok) { const data = await res.json(); setExpenses(data.expenses); setTotal(data.total); }
    setLoading(false);
  }, [from, to, filterSupplier, filterCategory]);

  // ── CARTÃO ──
  const nowDate = new Date();
  const nextM = new Date(nowDate.getFullYear(), nowDate.getMonth()+1, 1);
  const [cardMonth, setCardMonth] = useState(`${nextM.getFullYear()}-${String(nextM.getMonth()+1).padStart(2,"0")}`);
  const cardFrom = `${cardMonth}-01`;
  const cardTo = (() => { const [y, m] = cardMonth.split("-").map(Number); return `${y}-${String(m).padStart(2,"0")}-${new Date(y, m, 0).getDate()}`; })();
  const [cardExpenses, setCardExpenses] = useState<Expense[]>([]);
  const [cardTotal, setCardTotal] = useState(0);

  const loadCardExpenses = useCallback(async () => {
    const params = new URLSearchParams({ cartao: "1", from: cardFrom, to: cardTo });
    const res = await fetch(`/api/admin/despesas?${params}`);
    if (res.ok) {
      const data = await res.json();
      setCardExpenses(data.expenses);
      const t = data.expenses.reduce((s: number, e: Expense) => s + e.amount / (e.installments || 1), 0);
      setCardTotal(t);
    }
  }, [cardFrom, cardTo]);

  useEffect(() => { if (tab === "lancamentos") { loadExpenses(); if (suppliers.length === 0) fetch("/api/admin/fornecedores").then(r => r.json()).then(setSuppliers); } }, [tab, loadExpenses]);
  useEffect(() => { if (tab === "cartao") loadCardExpenses(); }, [tab, loadCardExpenses]);

  const openNew = () => { setEditId(null); setForm({ date: today(), description: "", amount: "", category: "outros", paymentMethod: "pix", supplierId: "", notes: "", installments: "1", dueDate: "" }); setError(""); setShowForm(true); };
  const openEdit = (e: Expense) => { setEditId(e.id); setForm({ date: e.date.split("T")[0], description: e.description, amount: String(e.amount), category: e.category, paymentMethod: e.paymentMethod, supplierId: e.supplier?.id || "", notes: e.notes || "", installments: String(e.installments || 1), dueDate: e.dueDate ? e.dueDate.substring(0,7) : "" }); setError(""); setShowForm(true); };

  const handleSave = async () => {
    if (!form.description.trim()) { setError("Informe a descrição."); return; }
    const amt = parseFloat(form.amount.replace(",", "."));
    if (!amt || amt <= 0) { setError("Informe um valor válido."); return; }
    const isCard = form.paymentMethod === "cartao_credito";
    const parcelas = parseInt(form.installments) || 1;
    if (isCard && parcelas > 1 && !form.dueDate) { setError("Informe o mês da 1ª parcela."); return; }
    setSaving(true); setError("");
    const url = editId ? `/api/admin/despesas/${editId}` : "/api/admin/despesas";
    const res = await fetch(url, { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, amount: amt, installments: parcelas }) });
    setSaving(false);
    if (res.ok) { setShowForm(false); loadExpenses(); } else { const d = await res.json(); setError(d.error || "Erro ao salvar."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta despesa?")) return;
    await fetch(`/api/admin/despesas/${id}`, { method: "DELETE" });
    loadExpenses();
  };

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) return;
    const res = await fetch("/api/admin/fornecedores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newSupplierName.trim() }) });
    if (res.ok) { const s = await res.json(); await fetch("/api/admin/fornecedores").then(r => r.json()).then(setSuppliers); setForm(f => ({ ...f, supplierId: s.id })); setNewSupplierName(""); setShowSupplierForm(false); }
  };

  const catLabel = (v: string) => CATEGORIES.find(c => c.value === v)?.label || v;
  const payLabel = (v: string) => PAYMENTS.find(p => p.value === v)?.label || v;

  const byCategory = CATEGORIES.map(c => ({ ...c, total: expenses.filter(e => e.category === c.value).reduce((s, e) => s + e.amount, 0) })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const maxCat = byCategory[0]?.total || 1;

  const inp = (style?: object) => ({ width: "100%", padding: "0.6rem 0.875rem", border: "1px solid rgba(140,100,20,0.25)", borderRadius: "0.625rem", fontSize: "0.875rem", backgroundColor: "#FAF6EE", outline: "none", boxSizing: "border-box" as const, ...style });
  const saldoPeriodo = caixaReceitas + caixaAportesTotal - caixaDespesas;

  const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.25rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ color: "#1a1510", fontSize: "1.75rem", fontWeight: 900 }}>💳 Financeiro</h1>
          <p style={{ color: "#9a8060", fontSize: "0.85rem", marginTop: "0.2rem" }}>Caixa, lançamentos e cartão de crédito</p>
        </div>
        {tab === "lancamentos" && (
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <a href="/admin/fornecedores" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: "#fff", border: "1px solid rgba(184,137,26,0.3)", color: "#b8891a", fontWeight: 700, fontSize: "0.8rem", padding: "0.5rem 1rem", borderRadius: "0.625rem", textDecoration: "none" }}>🏭 Fornecedores</a>
            <button onClick={openNew} style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "0.6rem 1.25rem", borderRadius: "0.75rem", border: "none", cursor: "pointer" }}>+ Nova Despesa</button>
          </div>
        )}
      </div>

      {/* Abas */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", borderBottom: "2px solid rgba(140,100,20,0.1)" }}>
        {[{ key: "caixa", label: "💰 Caixa" }, { key: "lancamentos", label: "📋 Lançamentos" }, { key: "cartao", label: "💳 Cartão de Crédito" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            style={{ padding: "0.6rem 1.25rem", border: "none", borderBottom: `3px solid ${tab === t.key ? "#b8891a" : "transparent"}`, backgroundColor: "transparent", fontWeight: 700, fontSize: "0.875rem", color: tab === t.key ? "#b8891a" : "#9a8060", cursor: "pointer", marginBottom: "-2px" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ ABA CAIXA ══ */}
      {tab === "caixa" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Patrimônio completo */}
          <div style={{ background: "linear-gradient(135deg, #1a1510, #2a2010)", borderRadius: "1.25rem", padding: "1.75rem 2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "0.3rem" }}>PATRIMÔNIO TOTAL DA EMPRESA</p>
                <p style={{ color: (caixaData?.patrimonio || 0) >= 0 ? "#b8891a" : "#c04040", fontSize: "2.5rem", fontWeight: 900, lineHeight: 1 }}>
                  {fmt(caixaData?.patrimonio || 0)}
                </p>
                <div style={{ marginTop: "0.5rem" }}>
                  {editandoCorte ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input type="date" value={corte} onChange={e => setCorte(e.target.value)}
                        style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "0.4rem", color: "#fff", padding: "0.2rem 0.5rem", fontSize: "0.75rem" }} />
                      <button onClick={() => { localStorage.setItem("caixa_corte", corte); setEditandoCorte(false); loadCaixa(); }}
                        style={{ backgroundColor: "#b8891a", border: "none", borderRadius: "0.4rem", color: "#fff", padding: "0.2rem 0.625rem", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>Aplicar</button>
                      <button onClick={() => setEditandoCorte(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", cursor: "pointer" }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditandoCorte(true)}
                      style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", cursor: "pointer", textDecoration: "underline" }}>
                      A partir de {new Date(corte + "T00:00:00").toLocaleDateString("pt-BR")} · alterar
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button onClick={() => setShowAporteForm(showAporteForm === "aporte" ? null : "aporte")}
                  style={{ backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.75rem", padding: "0.6rem 1.25rem", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer" }}>
                  💉 Injetar valor
                </button>
                <button onClick={() => setShowAporteForm(showAporteForm === "retirada" ? null : "retirada")}
                  style={{ backgroundColor: "rgba(192,64,64,0.15)", color: "#ffa0a0", border: "1px solid rgba(192,64,64,0.3)", borderRadius: "0.75rem", padding: "0.6rem 1.25rem", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer" }}>
                  💸 Retirada
                </button>
              </div>
            </div>

            {/* Decomposição do patrimônio */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
              {[
                {
                  emoji: "💵", label: "Caixa disponível",
                  value: caixaData?.caixa || 0,
                  sub: "Receitas + aportes − todas as despesas",
                  color: (caixaData?.caixa || 0) >= 0 ? "#4aff7a" : "#ff6b6b",
                },
                {
                  emoji: "📦", label: "Estoque (ao custo)",
                  value: caixaData?.estoqueValor || 0,
                  sub: "Dinheiro convertido em mercadoria",
                  color: "#ffd166",
                },
                {
                  emoji: "📒", label: "A receber",
                  value: caixaData?.aReceber || 0,
                  sub: "Caderno em aberto",
                  color: "#74b9ff",
                },
              ].map(k => (
                <div key={k.label} style={{ backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "0.875rem", padding: "1rem" }}>
                  <p style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>{k.emoji}</p>
                  <p style={{ fontSize: "1.25rem", fontWeight: 900, color: k.color }}>{fmt(k.value)}</p>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginTop: "0.2rem" }}>{k.label}</p>
                  <p style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.35)", marginTop: "0.1rem" }}>{k.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Formulário de aporte / retirada */}
          {showAporteForm && (
            <div style={{ backgroundColor: "#fff", border: `2px solid ${showAporteForm === "retirada" ? "rgba(192,64,64,0.3)" : "rgba(184,137,26,0.3)"}`, borderRadius: "1rem", padding: "1.25rem" }}>
              <p style={{ fontWeight: 800, color: "#1a1510", marginBottom: "1rem" }}>
                {showAporteForm === "retirada" ? "💸 Retirada de capital" : "💉 Injeção de capital"}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "0.75rem", marginBottom: "0.875rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9a8060", display: "block", marginBottom: "0.3rem" }}>Valor (R$) *</label>
                  <input type="number" style={inp()} placeholder="0,00" value={aporteForm.amount} onChange={e => setAporteForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9a8060", display: "block", marginBottom: "0.3rem" }}>Data *</label>
                  <input type="date" style={inp()} value={aporteForm.date} onChange={e => setAporteForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9a8060", display: "block", marginBottom: "0.3rem" }}>Descrição</label>
                  <input style={inp()} placeholder="Ex: Aporte para compra de estoque" value={aporteForm.description} onChange={e => setAporteForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={saveAporte} disabled={savingAporte}
                  style={{ backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.625rem", padding: "0.6rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
                  {savingAporte ? "Salvando..." : "Confirmar aporte"}
                </button>
                <button onClick={() => setShowAporteForm(null)}
                  style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.2)", color: "#9a8060", borderRadius: "0.625rem", padding: "0.6rem 1rem", fontWeight: 700, cursor: "pointer" }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Filtro de período */}
          <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9a8060", display: "block", marginBottom: "0.3rem" }}>DE</label>
              <input type="date" value={caixaFrom} onChange={e => setCaixaFrom(e.target.value)} style={inp({ width: 160 })} />
            </div>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9a8060", display: "block", marginBottom: "0.3rem" }}>ATÉ</label>
              <input type="date" value={caixaTo} onChange={e => setCaixaTo(e.target.value)} style={inp({ width: 160 })} />
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {[
                { label: "Este mês", fn: () => { setCaixaFrom(firstOfMonth()); setCaixaTo(lastOfMonth()); } },
                { label: "Hoje", fn: () => { setCaixaFrom(today()); setCaixaTo(today()); } },
                { label: "7 dias", fn: () => { const d = new Date(); d.setDate(d.getDate()-6); setCaixaFrom(d.toISOString().split("T")[0]); setCaixaTo(today()); } },
              ].map(b => (
                <button key={b.label} onClick={b.fn} style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.2)", color: "#7a6030", fontWeight: 700, fontSize: "0.78rem", padding: "0.5rem 0.875rem", borderRadius: "0.5rem", cursor: "pointer" }}>{b.label}</button>
              ))}
            </div>
          </div>

          {/* KPIs do período */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
            {[
              { emoji: "📥", label: "Receitas recebidas", value: fmt(caixaReceitas), color: "#1a8a2a", bg: "#e8f8e8" },
              { emoji: "💉", label: "Aportes de capital", value: fmt(caixaAportesTotal), color: "#1a6a9a", bg: "#e8f4fd" },
              { emoji: "📤", label: "Despesas", value: fmt(caixaDespesas), color: "#c04040", bg: "#fee8e8" },
              { emoji: "⚖️", label: "Saldo do período", value: fmt(saldoPeriodo), color: saldoPeriodo >= 0 ? "#1a8a2a" : "#c04040", bg: saldoPeriodo >= 0 ? "#e8f8e8" : "#fee8e8" },
            ].map(k => (
              <div key={k.label} style={{ backgroundColor: k.bg, borderRadius: "1rem", padding: "1rem 1.25rem" }}>
                <div style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>{k.emoji}</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 900, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: "0.72rem", color: "#9a8060", marginTop: "0.15rem", fontWeight: 700 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Histórico de aportes */}
          {caixaAportes.length > 0 && (
            <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
              <div style={{ backgroundColor: "#FAF6EE", padding: "0.875rem 1.25rem" }}>
                <h3 style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a1510" }}>💰 Movimentações de capital no período</h3>
              </div>
              {caixaAportes.map(a => {
                const isRetirada = a.amount < 0;
                return (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1.25rem", borderBottom: "1px solid rgba(140,100,20,0.05)" }}>
                    <div>
                      <p style={{ fontWeight: 600, color: "#1a1510", fontSize: "0.875rem" }}>
                        {isRetirada ? "💸 " : "💉 "}
                        {a.description || (isRetirada ? "Retirada de capital" : "Aporte de capital")}
                      </p>
                      <p style={{ fontSize: "0.72rem", color: "#9a8060" }}>{new Date(a.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontWeight: 700, color: isRetirada ? "#c04040" : "#1a6a9a" }}>
                        {isRetirada ? "-" : "+"}{fmt(Math.abs(a.amount))}
                      </span>
                      <button onClick={() => deleteAporte(a.id)} style={{ backgroundColor: "#fee8e8", border: "none", borderRadius: "0.4rem", padding: "0.3rem 0.5rem", color: "#c04040", cursor: "pointer", fontSize: "0.75rem" }}>🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ ABA LANÇAMENTOS ══ */}
      {tab === "lancamentos" && (
        <div>
          {/* Filtros */}
          <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div><label style={{ fontSize: "0.7rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>DE</label><input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inp({ width: 160 })} /></div>
            <div><label style={{ fontSize: "0.7rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>ATÉ</label><input type="date" value={to} onChange={e => setTo(e.target.value)} style={inp({ width: 160 })} /></div>
            <div><label style={{ fontSize: "0.7rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>FORNECEDOR</label><select value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)} style={inp({ width: 180 })}><option value="">Todos</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label style={{ fontSize: "0.7rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>CATEGORIA</label><select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={inp({ width: 200 })}><option value="">Todas</option>{CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
            <button onClick={loadExpenses} style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, fontSize: "0.8rem", padding: "0.6rem 1.25rem", borderRadius: "0.625rem", border: "none", cursor: "pointer", height: 37 }}>Filtrar</button>
            <button onClick={() => { setFrom(firstOfMonth()); setTo(today()); setFilterSupplier(""); setFilterCategory(""); }} style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.2)", color: "#9a8060", fontWeight: 700, fontSize: "0.8rem", padding: "0.6rem 1rem", borderRadius: "0.625rem", cursor: "pointer", height: 37 }}>Limpar</button>
          </div>

          {/* KPI + gráfico categorias */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ backgroundColor: "#b8891a", borderRadius: "1rem", padding: "1.5rem 2rem", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 200 }}>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>TOTAL NO PERÍODO</div>
              <div style={{ color: "#fff", fontSize: "2rem", fontWeight: 900, lineHeight: 1 }}>{fmt(total)}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem", marginTop: "0.4rem" }}>{expenses.length} lançamentos</div>
            </div>
            {byCategory.length > 0 ? (
              <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.25rem" }}>
                <h3 style={{ color: "#1a1510", fontWeight: 800, fontSize: "0.875rem", marginBottom: "1rem" }}>Por categoria</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {byCategory.map(c => (
                    <div key={c.value}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "#5a4a2a" }}>{c.label}</span>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1a1510" }}>{fmt(c.total)}</span>
                      </div>
                      <div style={{ height: 8, backgroundColor: "#f0e8d0", borderRadius: 999 }}>
                        <div style={{ height: "100%", width: `${Math.round((c.total/maxCat)*100)}%`, backgroundColor: "#b8891a", borderRadius: 999 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "#b8a080", fontSize: "0.875rem" }}>Nenhuma despesa no período.</p>
              </div>
            )}
          </div>

          {/* Tabela */}
          <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: "1px solid rgba(140,100,20,0.08)", backgroundColor: "#FAF6EE" }}>
              <h2 style={{ color: "#1a1510", fontWeight: 800, fontSize: "1rem" }}>Lançamentos</h2>
              <span style={{ fontSize: "0.75rem", color: "#9a8060" }}>{expenses.length} registros</span>
            </div>
            {loading ? <div style={{ textAlign: "center", padding: "3rem", color: "#b8a080" }}>Carregando...</div>
            : expenses.length === 0 ? <div style={{ textAlign: "center", padding: "3rem" }}><p style={{ color: "#b8a080", marginBottom: "1rem" }}>Nenhuma despesa encontrada.</p><button onClick={openNew} style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, padding: "0.6rem 1.25rem", borderRadius: "0.75rem", border: "none", cursor: "pointer" }}>+ Lançar primeira despesa</button></div>
            : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                  <thead><tr style={{ backgroundColor: "#FDFAF4" }}>{["Data","Descrição","Categoria","Fornecedor","Pagamento","Valor",""].map(h => <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#9a8060", fontWeight: 700, fontSize: "0.75rem", borderBottom: "1px solid rgba(140,100,20,0.08)", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {expenses.map(e => (
                      <tr key={e.id} style={{ borderBottom: "1px solid rgba(140,100,20,0.05)" }}>
                        <td style={{ padding: "0.75rem 1rem", color: "#9a8060", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{new Date(e.date).toLocaleDateString("pt-BR")}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#1a1510", fontWeight: 600 }}>{e.description}{e.notes && <div style={{ color: "#9a8060", fontSize: "0.7rem", fontWeight: 400 }}>{e.notes}</div>}</td>
                        <td style={{ padding: "0.75rem 1rem" }}><span style={{ fontSize: "0.7rem", backgroundColor: "#f0e8d0", color: "#7a5a10", padding: "0.2rem 0.5rem", borderRadius: 999, whiteSpace: "nowrap" }}>{catLabel(e.category)}</span></td>
                        <td style={{ padding: "0.75rem 1rem", color: "#5a4a2a", fontSize: "0.8rem" }}>{e.supplier?.name || "—"}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#5a4a2a", fontSize: "0.8rem" }}>{payLabel(e.paymentMethod)}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#c04040", fontWeight: 700, whiteSpace: "nowrap" }}>-{fmt(e.amount)}</td>
                        <td style={{ padding: "0.75rem 1rem" }}><div style={{ display: "flex", gap: "0.4rem" }}><button onClick={() => openEdit(e)} style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.2)", color: "#b8891a", fontWeight: 700, fontSize: "0.7rem", padding: "0.3rem 0.625rem", borderRadius: "0.5rem", cursor: "pointer" }}>Editar</button><button onClick={() => handleDelete(e.id)} style={{ backgroundColor: "#fee8e8", border: "1px solid rgba(192,64,64,0.2)", color: "#c04040", fontWeight: 700, fontSize: "0.7rem", padding: "0.3rem 0.625rem", borderRadius: "0.5rem", cursor: "pointer" }}>Excluir</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr style={{ backgroundColor: "#FAF6EE" }}><td colSpan={5} style={{ padding: "0.875rem 1rem", fontWeight: 700, color: "#1a1510" }}>Total</td><td style={{ padding: "0.875rem 1rem", fontWeight: 900, color: "#c04040", fontSize: "1rem" }}>-{fmt(total)}</td><td /></tr></tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ ABA CARTÃO ══ */}
      {tab === "cartao" && (
        <div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "1.5rem", backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1rem 1.25rem" }}>
            <div><label style={{ fontSize: "0.7rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>MÊS DA FATURA</label><input type="month" value={cardMonth} onChange={e => setCardMonth(e.target.value)} style={inp({ width: 180 })} /></div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[{ label: "Mês atual", fn: () => setCardMonth(`${nowDate.getFullYear()}-${String(nowDate.getMonth()+1).padStart(2,"0")}`) }, { label: "Próximo mês", fn: () => setCardMonth(`${nextM.getFullYear()}-${String(nextM.getMonth()+1).padStart(2,"0")}`) }].map(b => (
                <button key={b.label} onClick={b.fn} style={{ backgroundColor: "#f0e8ff", border: "1px solid rgba(106,48,184,0.2)", color: "#6a30b8", fontWeight: 700, fontSize: "0.78rem", padding: "0.5rem 0.875rem", borderRadius: "0.625rem", cursor: "pointer" }}>{b.label}</button>
              ))}
            </div>
          </div>
          <div style={{ backgroundColor: "#6a30b8", borderRadius: "1rem", padding: "1.25rem 1.75rem", marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", fontWeight: 700 }}>TOTAL DA FATURA — {MESES[parseInt(cardMonth.split("-")[1])-1]}/{cardMonth.split("-")[0]}</p><p style={{ color: "#fff", fontSize: "1.75rem", fontWeight: 900 }}>{fmt(cardTotal)}</p></div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>{cardExpenses.length} lançamentos</p>
          </div>
          <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead><tr style={{ backgroundColor: "#f0e8ff" }}>{["Compra","Vencimento","Descrição","Parcela","Valor"].map(h => <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#6a30b8", fontWeight: 700, fontSize: "0.75rem", borderBottom: "1px solid rgba(106,48,184,0.1)" }}>{h}</th>)}</tr></thead>
              <tbody>
                {cardExpenses.length === 0 ? <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#b8a080" }}>Nenhuma despesa no cartão neste período.</td></tr>
                : cardExpenses.map(e => {
                  const isOverdue = e.dueDate && new Date(e.dueDate) < new Date();
                  const parcelas = e.installments && e.installments > 1 ? e.installments : 1;
                  return (
                    <tr key={e.id} style={{ borderBottom: "1px solid rgba(106,48,184,0.06)", backgroundColor: isOverdue ? "#fff0f0" : "transparent" }}>
                      <td style={{ padding: "0.75rem 1rem", color: "#9a8060", fontSize: "0.8rem" }}>{new Date(e.date).toLocaleDateString("pt-BR")}</td>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: isOverdue ? "#c04040" : "#6a30b8", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{e.dueDate ? new Date(e.dueDate).toLocaleDateString("pt-BR") : "—"}{isOverdue && " ⚠️"}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#1a1510", fontWeight: 600 }}>{e.description}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#6a30b8", fontSize: "0.78rem" }}>{parcelas > 1 ? `${e.installmentNumber || 1}/${parcelas}` : "À vista"}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#c04040", fontWeight: 700 }}>-{fmt(e.amount / parcelas)}</td>
                    </tr>
                  );
                })}
              </tbody>
              {cardExpenses.length > 0 && <tfoot><tr style={{ backgroundColor: "#f0e8ff" }}><td colSpan={4} style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#6a30b8" }}>Total</td><td style={{ padding: "0.75rem 1rem", fontWeight: 900, color: "#6a30b8" }}>-{fmt(cardTotal)}</td></tr></tfoot>}
            </table>
          </div>
        </div>
      )}

      {/* Modal despesa */}
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
                <div><label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>Data *</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp()} /></div>
                <div><label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>Valor (R$) *</label><input type="text" placeholder="0,00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={inp()} /></div>
              </div>
              <div><label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>Descrição *</label><input type="text" placeholder="Ex: Compra de leggings" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={inp()} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div><label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>Categoria</label><select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp()}>{CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                <div><label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>Pagamento</label><select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value, installments: "1", dueDate: "" }))} style={inp()}>{PAYMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
              </div>
              {form.paymentMethod === "cartao_credito" && (
                <div style={{ backgroundColor: "#f0e8ff", border: "1px solid rgba(106,48,184,0.2)", borderRadius: "0.75rem", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6a30b8" }}>💳 Parcelamento</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div><label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>Parcelas</label><select value={form.installments} onChange={e => setForm(f => ({ ...f, installments: e.target.value }))} style={inp()}>{[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n}x {n > 1 && form.amount ? `de ${fmt(parseFloat(form.amount.replace(",","."))/n)}` : ""}</option>)}</select></div>
                    <div><label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>Mês da {parseInt(form.installments) > 1 ? "1ª " : ""}fatura</label><input type="month" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={inp()} /></div>
                  </div>
                </div>
              )}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a" }}>Fornecedor</label>
                  <button type="button" onClick={() => setShowSupplierForm(s => !s)} style={{ background: "none", border: "none", color: "#b8891a", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>+ Novo</button>
                </div>
                {showSupplierForm && <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}><input type="text" placeholder="Nome do fornecedor" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} style={{ ...inp(), flex: 1 }} /><button onClick={handleAddSupplier} style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, padding: "0 0.875rem", borderRadius: "0.625rem", border: "none", cursor: "pointer", whiteSpace: "nowrap", fontSize: "0.8rem" }}>Salvar</button></div>}
                <select value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))} style={inp()}><option value="">Sem fornecedor</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
              </div>
              <div><label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>Observações</label><textarea rows={2} placeholder="Anotação opcional..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inp(), resize: "vertical" as const }} /></div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.2)", color: "#5a4a2a", fontWeight: 700, padding: "0.75rem", borderRadius: "0.75rem", cursor: "pointer" }}>Cancelar</button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 2, backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, padding: "0.75rem", borderRadius: "0.75rem", border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "Salvando..." : editId ? "Salvar Alterações" : "Lançar Despesa"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
