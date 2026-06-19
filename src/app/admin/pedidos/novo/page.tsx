"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

type Customer = { id: string; name: string; email: string; phone?: string };
type Item = { description: string; price: number; quantity: number };

const inp = {
  padding: "0.6rem 0.875rem", border: "1px solid rgba(140,100,20,0.25)",
  borderRadius: "0.625rem", fontSize: "0.875rem", backgroundColor: "#FAF6EE",
  outline: "none", width: "100%", boxSizing: "border-box" as const,
};
const label = { fontSize: "0.75rem", color: "#9a8060", fontWeight: 700, display: "block", marginBottom: "0.3rem" };

export default function NovoPedidoPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const [items, setItems] = useState<Item[]>([{ description: "", price: 0, quantity: 1 }]);
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [amountPaid, setAmountPaid] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [installments, setInstallments] = useState(1);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [existingCadernoOrder, setExistingCadernoOrder] = useState<any>(null);
  const [dismissedOrderId, setDismissedOrderId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/clientes").then(r => r.json()).then(d => setCustomers(d.customers || d || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCustomer || paymentMethod !== "caderno" || isNewCustomer) {
      setExistingCadernoOrder(null);
      return;
    }
    fetch(`/api/admin/pedidos?userId=${selectedCustomer.id}&date=${date}&paymentMethod=caderno`)
      .then(r => r.json())
      .then(orders => {
        const order = orders?.[0] || null;
        if (order && order.id !== dismissedOrderId) setExistingCadernoOrder(order);
        else setExistingCadernoOrder(null);
      })
      .catch(() => {});
  }, [selectedCustomer, paymentMethod, date, isNewCustomer, dismissedOrderId]);

  useEffect(() => {
    if (!search) { setFiltered([]); return; }
    setFiltered(customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8));
  }, [search, customers]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const paid = parseFloat(amountPaid) || 0;
  const saldo = paymentStatus !== "paid" ? subtotal - paid : 0;

  const addItem = () => setItems(p => [...p, { description: "", price: 0, quantity: 1 }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof Item, value: any) =>
    setItems(p => p.map((it, idx) => idx === i ? { ...it, [field]: value } : it));

  const handleAddToExisting = async () => {
    setError("");
    if (items.some(i => !i.description || i.price <= 0)) { setError("Preencha descrição e valor de todos os itens."); return; }
    setSaving(true);
    const res = await fetch(`/api/admin/pedidos/${existingCadernoOrder.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addItems: items }),
    });
    setSaving(false);
    if (res.ok) router.push("/admin/pedidos");
    else { const d = await res.json(); setError(d.error || "Erro ao adicionar itens."); }
  };

  const handleSave = async () => {
    setError("");
    if (!selectedCustomer && !newCustomer.name) { setError("Selecione ou cadastre um cliente."); return; }
    if (items.some(i => !i.description || i.price <= 0)) { setError("Preencha descrição e valor de todos os itens."); return; }

    setSaving(true);
    const res = await fetch("/api/admin/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedCustomer?.id,
        newCustomer: isNewCustomer ? newCustomer : null,
        items, paymentMethod, paymentStatus,
        amountPaid: paymentStatus === "paid" ? subtotal : paid,
        notes, createdAt: date, dueDate: dueDate || null, installments,
      }),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/pedidos");
    } else {
      const d = await res.json();
      setError(d.error || "Erro ao salvar pedido.");
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>
      <a href="/admin/pedidos" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Pedidos</a>
      <h1 style={{ color: "#1a1510", fontSize: "1.75rem", fontWeight: 900, margin: "0.3rem 0 1.5rem" }}>Novo Pedido</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* Cliente */}
        <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.25rem", border: "1px solid rgba(140,100,20,0.1)" }}>
          <p style={{ fontWeight: 800, color: "#1a1510", marginBottom: "1rem" }}>👤 Cliente</p>

          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <button onClick={() => { setIsNewCustomer(false); setSelectedCustomer(null); setSearch(""); }}
              style={{ padding: "0.4rem 0.875rem", borderRadius: "999px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", backgroundColor: !isNewCustomer ? "#b8891a" : "#EDE4CC", color: !isNewCustomer ? "#fff" : "#6a4a10" }}>
              Cliente existente
            </button>
            <button onClick={() => { setIsNewCustomer(true); setSelectedCustomer(null); }}
              style={{ padding: "0.4rem 0.875rem", borderRadius: "999px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", backgroundColor: isNewCustomer ? "#b8891a" : "#EDE4CC", color: isNewCustomer ? "#fff" : "#6a4a10" }}>
              + Novo cliente
            </button>
          </div>

          {!isNewCustomer ? (
            <div style={{ position: "relative" }} ref={dropdownRef}>
              {selectedCustomer ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.875rem", backgroundColor: "#e8f8e8", borderRadius: "0.625rem", border: "1px solid rgba(26,138,42,0.2)" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1a1510" }}>{selectedCustomer.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#9a8060" }}>{selectedCustomer.email}</div>
                  </div>
                  <button onClick={() => { setSelectedCustomer(null); setSearch(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9a8060", fontSize: "1rem" }}>✕</button>
                </div>
              ) : (
                <>
                  <input style={inp} placeholder="Buscar cliente..." value={search}
                    onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)} />
                  {showDropdown && filtered.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.2)", borderRadius: "0.625rem", zIndex: 50, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginTop: 2 }}>
                      {filtered.map(c => (
                        <div key={c.id} onClick={() => { setSelectedCustomer(c); setSearch(c.name); setShowDropdown(false); }}
                          style={{ padding: "0.6rem 0.875rem", cursor: "pointer", borderBottom: "1px solid rgba(140,100,20,0.06)" }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#FAF6EE")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}>
                          <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1a1510" }}>{c.name}</div>
                          <div style={{ fontSize: "0.7rem", color: "#9a8060" }}>{c.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={label}>Nome *</label>
                <input style={inp} placeholder="Nome completo" value={newCustomer.name} onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={label}>Telefone</label>
                <input style={inp} placeholder="(47) 9..." value={newCustomer.phone} onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
          )}
        </div>

        {/* Aviso caderno */}
        {existingCadernoOrder && (
          <div style={{ backgroundColor: "#fff8e1", border: "1px solid rgba(184,137,26,0.35)", borderRadius: "1rem", padding: "1.25rem" }}>
            <p style={{ fontWeight: 800, color: "#5a4a2a", marginBottom: "0.4rem" }}>📒 Pedido no caderno encontrado</p>
            <p style={{ fontSize: "0.875rem", color: "#7a5a10", marginBottom: "0.875rem" }}>
              <strong>{selectedCustomer?.name}</strong> já tem {existingCadernoOrder.items.length} item(s) no caderno nesta data — total atual:{" "}
              <strong>{existingCadernoOrder.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button onClick={handleAddToExisting} disabled={saving}
                style={{ backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.625rem", padding: "0.5rem 1.1rem", fontWeight: 700, fontSize: "0.875rem", cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Adicionando..." : "+ Adicionar ao pedido existente"}
              </button>
              <button onClick={() => setDismissedOrderId(existingCadernoOrder.id)}
                style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.2)", color: "#9a8060", borderRadius: "0.625rem", padding: "0.5rem 1.1rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
                Criar pedido separado
              </button>
            </div>
          </div>
        )}

        {/* Itens */}
        <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.25rem", border: "1px solid rgba(140,100,20,0.1)" }}>
          <p style={{ fontWeight: 800, color: "#1a1510", marginBottom: "1rem" }}>🛍️ Itens</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 100px 60px 32px", gap: "0.5rem", alignItems: "center" }}>
                <input style={inp} placeholder="Descrição do produto" value={item.description}
                  onChange={e => updateItem(i, "description", e.target.value)} />
                <input style={inp} type="number" placeholder="R$ valor" min="0" step="0.01" value={item.price || ""}
                  onChange={e => updateItem(i, "price", parseFloat(e.target.value) || 0)} />
                <input style={inp} type="number" placeholder="Qtd" min="1" value={item.quantity}
                  onChange={e => updateItem(i, "quantity", parseInt(e.target.value) || 1)} />
                {items.length > 1 && (
                  <button onClick={() => removeItem(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#c04040", fontSize: "1rem", padding: 0 }}>✕</button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addItem} style={{ marginTop: "0.75rem", padding: "0.4rem 0.875rem", backgroundColor: "#EDE4CC", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, color: "#6a4a10" }}>
            + Adicionar item
          </button>
          <div style={{ marginTop: "0.75rem", textAlign: "right", fontWeight: 900, color: "#b8891a", fontSize: "1.1rem" }}>
            Subtotal: {subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
        </div>

        {/* Pagamento */}
        <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.25rem", border: "1px solid rgba(140,100,20,0.1)" }}>
          <p style={{ fontWeight: 800, color: "#1a1510", marginBottom: "1rem" }}>💳 Pagamento</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={label}>Forma de Pagamento</label>
              <select style={inp} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="pix">Pix</option>
                <option value="cartao">Cartão</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="link">Link de Pagamento</option>
                <option value="caderno">Caderno</option>
              </select>
            </div>
            <div>
              <label style={label}>Status</label>
              <select style={inp} value={paymentStatus} onChange={e => { setPaymentStatus(e.target.value); if (e.target.value === "paid") setAmountPaid(""); }}>
                <option value="paid">Pago</option>
                <option value="partial">Parcial</option>
                <option value="pending">Pendente</option>
              </select>
            </div>
            {paymentStatus !== "paid" && (
              <>
                <div>
                  <label style={label}>Valor já pago (R$)</label>
                  <input style={inp} type="number" min="0" step="0.01" placeholder="0,00" value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)} />
                </div>
                <div>
                  <label style={label}>Parcelas</label>
                  <select style={inp} value={installments} onChange={e => setInstallments(Number(e.target.value))}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}x</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Vencimento (data de pagamento)</label>
                  <input style={inp} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </>
            )}
            <div>
              <label style={label}>Data da Venda</label>
              <input style={inp} type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
          {paymentStatus !== "paid" && subtotal > 0 && (
            <div style={{ marginTop: "0.75rem", padding: "0.6rem 0.875rem", backgroundColor: "#fff8e1", borderRadius: "0.625rem", display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
              <span style={{ color: "#5a4a2a" }}>Saldo em aberto:</span>
              <span style={{ fontWeight: 900, color: "#b8891a" }}>{saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
          )}
        </div>

        {/* Observações */}
        <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.25rem", border: "1px solid rgba(140,100,20,0.1)" }}>
          <label style={{ ...label, marginBottom: "0.5rem" }}>📝 Observações (opcional)</label>
          <textarea style={{ ...inp, resize: "vertical", minHeight: 70 }} placeholder="Ex: vai pagar em 2x, entregue no trabalho..."
            value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        {error && (
          <div style={{ backgroundColor: "#fee8e8", border: "1px solid rgba(192,64,64,0.2)", borderRadius: "0.625rem", padding: "0.75rem 1rem", color: "#c04040", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          style={{ backgroundColor: saving ? "#d4b870" : "#b8891a", color: "#fff", border: "none", borderRadius: "0.875rem", padding: "0.875rem", fontSize: "1rem", fontWeight: 900, cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 2px 8px rgba(184,137,26,0.3)" }}>
          {saving ? "Salvando..." : "✓ Registrar Pedido"}
        </button>
      </div>
    </div>
  );
}
