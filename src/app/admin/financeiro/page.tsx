"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from "react";
import ProjecaoCaixa from "../ProjecaoCaixa";

const CATEGORIES = [
  { value: "estoque", label: "🛍️ Reposição de Estoque" },
  { value: "marketing", label: "📣 Marketing" },
  { value: "embalagem", label: "📦 Embalagem" },
  { value: "frete", label: "🚚 Frete" },
  { value: "cartao", label: "💳 Cartão / Taxa" },
  { value: "taxa_operadora", label: "💰 Taxa de Operadora" },
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

function nextMonthRange() {
  const d = new Date();
  const y = d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear();
  const m = (d.getMonth() + 1) % 12;
  const last = new Date(y, m + 1, 0);
  return {
    from: `${y}-${String(m + 1).padStart(2, "0")}-01`,
    to: `${y}-${String(m + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`,
  };
}

type Supplier = { id: string; name: string };
type Expense = {
  id: string; date: string; description: string; amount: number;
  category: string; paymentMethod: string; notes?: string;
  dueDate?: string | null; installments?: number; installmentNumber?: number;
  groupId?: string | null;
  supplier?: { id: string; name: string } | null;
};

export default function FinanceiroPage() {
  const [tab, setTab] = useState<"resumo" | "despesas" | "cartao" | "taxa_operadora">("resumo");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cardExpenses, setCardExpenses] = useState<Expense[]>([]);
  const [operatorFees, setOperatorFees] = useState<Expense[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [cardTotal, setCardTotal] = useState(0);
  const [feeTotal, setFeeTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [invoicePaid, setInvoicePaid] = useState<Record<string, boolean>>({});

  // Filtros despesas
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [filterSupplier, setFilterSupplier] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Filtros cartão — por mês (YYYY-MM)
  const nowDate = new Date();
  const nextM = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 1);
  const [cardMonth, setCardMonth] = useState(`${nextM.getFullYear()}-${String(nextM.getMonth() + 1).padStart(2, "0")}`);

  const cardFrom = `${cardMonth}-01`;
  const cardTo = (() => { const [y, m] = cardMonth.split("-").map(Number); return `${y}-${String(m).padStart(2,"0")}-${new Date(y, m, 0).getDate()}`; })();

  // Formulário nova despesa
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: today(), description: "", amount: "",
    category: "outros", paymentMethod: "pix", supplierId: "", notes: "",
    installments: "1", dueDate: "",
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
    if (res.ok) { const data = await res.json(); setExpenses(data.expenses); setTotal(data.total); }
    setLoading(false);
  }, [from, to, filterSupplier, filterCategory]);

  const loadCardExpenses = useCallback(async () => {
    const params = new URLSearchParams({ cartao: "1", from: cardFrom, to: cardTo });
    const res = await fetch(`/api/admin/despesas?${params}`);
    if (res.ok) {
      const data = await res.json();
      setCardExpenses(data.expenses);
      // Total: e.amount já é o valor correto da parcela, não divide
      const t = data.expenses.reduce((s: number, e: Expense) => s + e.amount, 0);
      setCardTotal(t);
    }
  }, [cardFrom, cardTo]);

  const loadOperatorFees = useCallback(async () => {
    const params = new URLSearchParams({ category: "taxa_operadora", from, to });
    const res = await fetch(`/api/admin/despesas?${params}`);
    if (res.ok) {
      const data = await res.json();
      setOperatorFees(data.expenses);
      setFeeTotal(data.total);
    }
  }, [from, to]);

  const loadSuppliers = async () => {
    const res = await fetch("/api/admin/fornecedores");
    if (res.ok) setSuppliers(await res.json());
  };

  useEffect(() => { loadExpenses(); }, [loadExpenses]);
  useEffect(() => { loadCardExpenses(); }, [loadCardExpenses]);
  useEffect(() => { loadOperatorFees(); }, [loadOperatorFees]);
  useEffect(() => { loadSuppliers(); }, []);

  const openNew = () => {
    setEditId(null);
    const defaultPayment = tab === "cartao" ? "cartao_credito" : "pix";
    setForm({ date: today(), description: "", amount: "", category: "outros", paymentMethod: defaultPayment, supplierId: "", notes: "", installments: "1", dueDate: "" });
    setError("");
    setShowForm(true);
  };

  const openEdit = (e: Expense) => {
    setEditId(e.id);
    // Se é parcelado (tem groupId), mostra o valor total (amount * installments)
    const installments = e.installments || 1;
    const isGrouped = e.groupId && installments > 1;
    const displayAmount = isGrouped ? e.amount * installments : e.amount;
    setForm({
      date: e.date.split("T")[0], description: e.description.replace(/\s*\(\d+\/\d+\)$/, ""), // Remove "(1/3)" do fim
      amount: String(displayAmount), category: e.category,
      paymentMethod: e.paymentMethod, supplierId: e.supplier?.id || "", notes: e.notes || "",
      installments: String(e.installments || 1),
      dueDate: e.dueDate ? e.dueDate.substring(0, 7) : "", // YYYY-MM
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.description.trim()) { setError("Informe a descrição."); return; }
    const amt = parseFloat(form.amount.replace(",", "."));
    if (!amt || amt <= 0) { setError("Informe um valor válido."); return; }
    const isCard = form.paymentMethod === "cartao_credito";
    const parcelas = parseInt(form.installments) || 1;
    if (isCard && parcelas > 1 && !form.dueDate) { setError("Informe o vencimento da 1ª parcela."); return; }

    setSaving(true); setError("");
    const url = editId ? `/api/admin/despesas/${editId}` : "/api/admin/despesas";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: amt, installments: parcelas }),
    });
    setSaving(false);
    if (res.ok) { setShowForm(false); loadExpenses(); loadCardExpenses(); }
    else { const d = await res.json(); setError(d.error || "Erro ao salvar."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta despesa?")) return;
    await fetch(`/api/admin/despesas/${id}`, { method: "DELETE" });
    loadExpenses();
    loadCardExpenses();
    loadOperatorFees();
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

  // Agrupa despesas parceladas e ordena por data
  const groupedExpenses = (() => {
    const seen = new Set<string>();
    return expenses
      .filter(e => {
        if (e.groupId) {
          if (seen.has(e.groupId)) return false;
          seen.add(e.groupId);
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  })();

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

      {/* Abas */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "2px solid rgba(140,100,20,0.1)", paddingBottom: "0" }}>
        {[
          { key: "resumo", label: "📊 Resumo" },
          { key: "despesas", label: "📋 Despesas" },
          { key: "cartao", label: "💳 Cartão de Crédito" },
          { key: "taxa_operadora", label: "💰 Taxa de Operadora" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            style={{ padding: "0.6rem 1.25rem", border: "none", borderBottom: `3px solid ${tab === t.key ? "#b8891a" : "transparent"}`, backgroundColor: "transparent", fontWeight: 700, fontSize: "0.875rem", color: tab === t.key ? "#b8891a" : "#9a8060", cursor: "pointer", marginBottom: "-2px" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Aba Resumo */}
      {tab === "resumo" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ backgroundColor: "#b8891a", borderRadius: "1rem", padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 12px rgba(184,137,26,0.15)" }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total de Despesas</div>
              <div style={{ color: "#fff", fontSize: "2.5rem", fontWeight: 900, lineHeight: 1, marginBottom: "0.5rem" }}>{fmt(total)}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>{expenses.length} lançamentos</div>
            </div>
          </div>

          <div style={{ backgroundColor: "#6a30b8", borderRadius: "1rem", padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 12px rgba(106,48,184,0.15)" }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Cartão de Crédito</div>
              <div style={{ color: "#fff", fontSize: "2.5rem", fontWeight: 900, lineHeight: 1, marginBottom: "0.5rem" }}>{fmt(cardTotal)}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>{cardExpenses.length} parcelas</div>
            </div>
          </div>

          <div style={{ backgroundColor: "#c04040", borderRadius: "1rem", padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 12px rgba(192,64,64,0.15)" }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Taxa de Operadora</div>
              <div style={{ color: "#fff", fontSize: "2.5rem", fontWeight: 900, lineHeight: 1, marginBottom: "0.5rem" }}>{fmt(feeTotal)}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>{operatorFees.length} lançamentos</div>
            </div>
          </div>
        </div>
      )}

      {/* Projeção de Caixa */}
      {tab === "resumo" && <ProjecaoCaixa />}

      {/* Aba Cartão */}
      {tab === "cartao" && (
        <div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "1.5rem", backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1rem 1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.7rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" }}>MÊS DA FATURA</label>
              <input type="month" value={cardMonth} onChange={e => setCardMonth(e.target.value)} style={{ ...inp(), width: 180 }} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[
                { label: "Mês atual", fn: () => setCardMonth(`${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}`) },
                { label: "Próximo mês", fn: () => setCardMonth(`${nextM.getFullYear()}-${String(nextM.getMonth() + 1).padStart(2, "0")}`) },
              ].map(b => (
                <button key={b.label} onClick={b.fn} style={{ backgroundColor: "#f0e8ff", border: "1px solid rgba(106,48,184,0.2)", color: "#6a30b8", fontWeight: 700, fontSize: "0.78rem", padding: "0.5rem 0.875rem", borderRadius: "0.625rem", cursor: "pointer" }}>
                  {b.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "auto" }}>
              {invoicePaid[cardMonth] ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "#e8f8e8", borderRadius: "0.625rem", border: "1px solid rgba(26,138,42,0.2)" }}>
                  <span style={{ fontSize: "1.2rem" }}>✓</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a8a2a" }}>Fatura Paga</span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "#fff8e1", borderRadius: "0.625rem", border: "1px solid rgba(184,137,26,0.3)" }}>
                  <span style={{ fontSize: "1.2rem" }}>⏳</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#856404" }}>Pendente</span>
                </div>
              )}
              <button onClick={() => setInvoicePaid(p => ({ ...p, [cardMonth]: !p[cardMonth] }))}
                style={{ backgroundColor: invoicePaid[cardMonth] ? "#fee8e8" : "#b8891a", color: invoicePaid[cardMonth] ? "#c04040" : "#fff", border: "none", fontWeight: 700, fontSize: "0.8rem", padding: "0.5rem 1rem", borderRadius: "0.625rem", cursor: "pointer" }}>
                {invoicePaid[cardMonth] ? "Marcar como Pendente" : "Marcar como Paga"}
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden", marginTop: "1.5rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f0e8ff" }}>
                  {["Compra", "Vencimento", "Descrição", "Parcela", "Valor", ""].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#6a30b8", fontWeight: 700, fontSize: "0.75rem", borderBottom: "1px solid rgba(106,48,184,0.1)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cardExpenses.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#b8a080" }}>Nenhuma despesa no cartão neste período.</td></tr>
                ) : cardExpenses.map(e => {
                  const isOverdue = e.dueDate && new Date(e.dueDate) < new Date();
                  const parcelas = e.installments && e.installments > 1 ? e.installments : 1;
                  return (
                    <tr key={e.id} style={{ borderBottom: "1px solid rgba(106,48,184,0.06)", backgroundColor: isOverdue ? "#fff0f0" : "transparent" }}>
                      <td style={{ padding: "0.75rem 1rem", color: "#9a8060", fontSize: "0.8rem" }}>{new Date(e.date).toLocaleDateString("pt-BR")}</td>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: isOverdue ? "#c04040" : "#6a30b8", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {e.dueDate ? new Date(e.dueDate).toLocaleDateString("pt-BR") : "—"}
                        {isOverdue && " ⚠️"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "#1a1510", fontWeight: 600 }}>{e.description}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#6a30b8", fontSize: "0.78rem" }}>
                        {parcelas > 1 ? `${e.installmentNumber || 1}/${parcelas}` : "À vista"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "#c04040", fontWeight: 700 }}>-{fmt(e.amount)}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button onClick={() => openEdit(e)} style={{ backgroundColor: "#f0e8ff", border: "1px solid rgba(106,48,184,0.2)", color: "#6a30b8", fontWeight: 700, fontSize: "0.7rem", padding: "0.3rem 0.625rem", borderRadius: "0.5rem", cursor: "pointer" }}>
                            Editar
                          </button>
                          <button onClick={() => handleDelete(e.id)} style={{ backgroundColor: "#fee8e8", border: "1px solid rgba(192,64,64,0.2)", color: "#c04040", fontWeight: 700, fontSize: "0.7rem", padding: "0.3rem 0.625rem", borderRadius: "0.5rem", cursor: "pointer" }}>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {cardExpenses.length > 0 && (
                <tfoot>
                  <tr style={{ backgroundColor: "#f0e8ff" }}>
                    <td colSpan={4} style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#6a30b8" }}>Total</td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 900, color: "#6a30b8" }}>-{fmt(cardTotal)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {tab === "despesas" && <>
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


      {/* Tabela */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: "1px solid rgba(140,100,20,0.08)", backgroundColor: "#FAF6EE" }}>
          <h2 style={{ color: "#1a1510", fontWeight: 800, fontSize: "1rem" }}>Lançamentos</h2>
          <span style={{ fontSize: "0.75rem", color: "#9a8060" }}>{expenses.length} registros</span>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#b8a080" }}>Carregando...</div>
        ) : groupedExpenses.length === 0 ? (
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
                {groupedExpenses.map(e => {
                  const totalAmount = e.groupId
                    ? expenses.filter(x => x.groupId === e.groupId).reduce((s, x) => s + x.amount, 0)
                    : e.amount;
                  return (
                  <tr key={e.id} style={{ borderBottom: "1px solid rgba(140,100,20,0.05)" }}>
                    <td style={{ padding: "0.75rem 1rem", color: "#9a8060", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {new Date(e.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#1a1510", fontWeight: 600 }}>
                      {e.description}
                      {e.groupId && e.installments && e.installments > 1 && (
                        <div style={{ color: "#6a30b8", fontSize: "0.7rem", fontWeight: 700 }}>📦 {e.installments}x</div>
                      )}
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
                      -{fmt(totalAmount)}
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
                  );
                })}
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
      </>}

      {/* Aba Taxa de Operadora */}
      {tab === "taxa_operadora" && (
        <div>
          {/* Tabela */}
          <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: "1px solid rgba(140,100,20,0.08)", backgroundColor: "#FAF6EE" }}>
              <h2 style={{ color: "#1a1510", fontWeight: 800, fontSize: "1rem" }}>Descontos de Operadora</h2>
              <span style={{ fontSize: "0.75rem", color: "#9a8060" }}>{operatorFees.length} registros</span>
            </div>
            {operatorFees.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ color: "#b8a080", marginBottom: "1rem" }}>Nenhuma taxa de operadora registrada.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#FDFAF4" }}>
                      {["Data", "Descrição", "Método", "Valor", ""].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#9a8060", fontWeight: 700, fontSize: "0.75rem", borderBottom: "1px solid rgba(140,100,20,0.08)", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {operatorFees.map(e => (
                      <tr key={e.id} style={{ borderBottom: "1px solid rgba(140,100,20,0.05)" }}>
                        <td style={{ padding: "0.75rem 1rem", color: "#9a8060", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                          {new Date(e.date).toLocaleDateString("pt-BR")}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "#1a1510", fontWeight: 600 }}>
                          {e.description}
                          {e.notes && <div style={{ color: "#9a8060", fontSize: "0.7rem", fontWeight: 400 }}>{e.notes}</div>}
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
                      <td colSpan={3} style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#1a1510", textAlign: "right" }}>
                        TOTAL:
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 900, color: "#c04040" }}>
                        -{fmt(feeTotal)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nova/Editar Despesa */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ backgroundColor: "#FAF6EE", borderRadius: "1.25rem", padding: "2rem", width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "#1a1510", fontWeight: 900, fontSize: "1.1rem" }}>{editId ? "Editar Despesa" : "Nova Despesa"}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#9a8060" }}>✕</button>
            </div>

            {editId && parseInt(form.installments) > 1 && (
              <div style={{ backgroundColor: "#f0e8ff", border: "1px solid rgba(106,48,184,0.2)", borderRadius: "0.625rem", padding: "0.75rem 1rem", marginBottom: "1rem", color: "#6a30b8", fontSize: "0.8rem" }}>
                📦 Você está editando um lançamento parcelado. Ao salvar, todas as {form.installments} parcelas serão recalculadas.
              </div>
            )}

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
                  <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value, installments: "1", dueDate: "" }))} style={inp()}>
                    {PAYMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Campos cartão de crédito */}
              {form.paymentMethod === "cartao_credito" && (
                <div style={{ backgroundColor: "#f0e8ff", border: "1px solid rgba(106,48,184,0.2)", borderRadius: "0.75rem", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6a30b8" }}>💳 Parcelamento no Cartão</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>Parcelas</label>
                      <select value={form.installments} onChange={e => setForm(f => ({ ...f, installments: e.target.value }))} style={inp()}>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                          <option key={n} value={n}>{n}x {n > 1 && form.amount ? `de ${fmt(parseFloat(form.amount.replace(",",".")) / n)}` : ""}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a4a2a", display: "block", marginBottom: "0.4rem" }}>
                        Mês {parseInt(form.installments) > 1 ? "da 1ª parcela" : "da fatura"}
                        {parseInt(form.installments) > 1 && <span style={{ color: "#c04040" }}> *</span>}
                      </label>
                      <input type="month" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={{ ...inp(), borderColor: parseInt(form.installments) > 1 && !form.dueDate ? "#c04040" : undefined }} required={parseInt(form.installments) > 1} />
                    </div>
                  </div>
                  {parseInt(form.installments) > 1 && form.amount && (
                    <div style={{ padding: "0.75rem", backgroundColor: "#f0e8ff", borderRadius: "0.625rem", borderLeft: "3px solid #6a30b8" }}>
                      <p style={{ fontSize: "0.75rem", color: "#6a30b8", margin: "0 0 0.3rem", fontWeight: 700 }}>
                        💳 {form.installments}x de {fmt(parseFloat(form.amount.replace(",",".")) / parseInt(form.installments))}
                      </p>
                      <p style={{ fontSize: "0.7rem", color: "#6a30b8", margin: 0 }}>
                        Vencimento dia 10 de cada mês{form.dueDate ? `, começando em ${new Date(form.dueDate + "-10").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}` : " — preencha o mês acima"}
                      </p>
                      {form.dueDate && (
                        <p style={{ fontSize: "0.7rem", color: "#6a30b8", margin: "0.3rem 0 0", fontStyle: "italic" }}>
                          ✓ Parcelas aparecerão na aba Cartão em seus respectivos meses
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

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
