"use client";
import { useState, useMemo } from "react";

type OrderItem = { id: string; quantity: number; price: number; size?: string; product: { id: string; name: string } };
type Order = {
  id: string; status: string; total: number; subtotal: number;
  shipping: number; discount: number; notes?: string;
  createdAt: string;
  user: { id: string; name: string; email: string; phone?: string };
  items: OrderItem[];
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando", confirmed: "Confirmado",
  shipped: "Enviado", delivered: "Entregue", cancelled: "Cancelado",
};
const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#fff8e1", color: "#b8891a" },
  confirmed: { bg: "#e8f4fd", color: "#1a6a9a" },
  shipped:   { bg: "#f0e8ff", color: "#6a30b8" },
  delivered: { bg: "#e8f8e8", color: "#1a8a2a" },
  cancelled: { bg: "#fee8e8", color: "#c04040" },
};

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PedidosClient({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [localOrders, setLocalOrders] = useState(orders);

  const filtered = useMemo(() => {
    return localOrders.filter(o => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.user.name.toLowerCase().includes(q) &&
            !o.id.toLowerCase().includes(q) &&
            !o.user.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [orders, statusFilter, search]);

  const totalReceita = filtered.reduce((s, o) => o.status !== "cancelled" ? s + o.total : s, 0);
  const totalEmAberto = filtered.filter(o => o.status === "pending").reduce((s, o) => s + o.total, 0);
  const countPending = filtered.filter(o => o.status === "pending").length;

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    const res = await fetch(`/api/admin/pedidos/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setLocalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    }
    setUpdatingId(null);
  };

  const inp = { padding: "0.55rem 0.875rem", border: "1px solid rgba(140,100,20,0.25)", borderRadius: "0.625rem", fontSize: "0.8rem", backgroundColor: "#FAF6EE", outline: "none" };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <a href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</a>
          <h1 style={{ color: "#1a1510", fontSize: "1.75rem", fontWeight: 900, marginTop: "0.2rem" }}>Pedidos</h1>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.875rem", marginBottom: "1.5rem" }}>
        {[
          { emoji: "🛍️", label: "Total de Pedidos", value: filtered.length, gold: false },
          { emoji: "💰", label: "Receita", value: fmt(totalReceita), gold: true },
          { emoji: "⏳", label: "Em Aberto", value: fmt(totalEmAberto), gold: false, warn: totalEmAberto > 0 },
          { emoji: "🔔", label: "Aguardando", value: countPending, gold: false, warn: countPending > 0 },
          { emoji: "✅", label: "Entregues", value: filtered.filter(o => o.status === "delivered").length, gold: false },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: s.gold ? "#b8891a" : "#fff", border: `1px solid ${(s as any).warn ? "rgba(192,64,64,0.25)" : s.gold ? "none" : "rgba(140,100,20,0.1)"}`, borderRadius: "0.875rem", padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "1.25rem", marginBottom: "0.4rem" }}>{s.emoji}</div>
            <div style={{ color: s.gold ? "#fff" : "#1a1510", fontSize: "1.4rem", fontWeight: 900 }}>{s.value}</div>
            <div style={{ color: s.gold ? "rgba(255,255,255,0.8)" : "#9a8060", fontSize: "0.75rem", marginTop: "0.2rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder="🔍 Buscar cliente ou pedido..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, minWidth: 220, flex: 1 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inp, minWidth: 180 }}>
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {(search || statusFilter) && (
          <button onClick={() => { setSearch(""); setStatusFilter(""); }}
            style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.2)", color: "#9a8060", fontWeight: 700, fontSize: "0.75rem", padding: "0.55rem 0.875rem", borderRadius: "0.625rem", cursor: "pointer" }}>
            ✕ Limpar
          </button>
        )}
      </div>

      {/* Tabela */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#FAF6EE" }}>
                {["Pedido", "Cliente", "Produtos", "Total", "Status", "Data", "Ações"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0.875rem 1rem", color: "#9a8060", fontWeight: 700, fontSize: "0.75rem", borderBottom: "1px solid rgba(140,100,20,0.1)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#b8a080" }}>Nenhum pedido encontrado.</td></tr>
              ) : filtered.map(order => {
                const sc = STATUS_COLOR[order.status] || { bg: "#f0f0f0", color: "#666" };
                const isExpanded = expanded === order.id;
                const produtoNome = order.items[0]?.size || order.items[0]?.product?.name || "—";
                const maisItens = order.items.length > 1 ? ` +${order.items.length - 1}` : "";
                return (
                  <>
                    <tr key={order.id} style={{ borderBottom: isExpanded ? "none" : "1px solid rgba(140,100,20,0.06)", cursor: "pointer", backgroundColor: isExpanded ? "#FDFAF4" : "transparent" }}
                      onClick={() => setExpanded(isExpanded ? null : order.id)}>
                      <td style={{ padding: "0.875rem 1rem", fontFamily: "monospace", fontSize: "0.72rem", color: "#9a8060" }}>
                        {isExpanded ? "▼" : "▶"} #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ color: "#1a1510", fontWeight: 600, fontSize: "0.875rem" }}>{order.user.name}</div>
                        <div style={{ color: "#9a8060", fontSize: "0.7rem" }}>{order.user.email}</div>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#5a4a2a", fontSize: "0.8rem" }}>
                        {produtoNome}{maisItens && <span style={{ color: "#b8891a", fontWeight: 700 }}>{maisItens}</span>}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#1a1510", fontWeight: 700, whiteSpace: "nowrap" }}>{fmt(order.total)}</td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ backgroundColor: sc.bg, color: sc.color, fontSize: "0.7rem", fontWeight: 700, padding: "0.25rem 0.625rem", borderRadius: "999px", whiteSpace: "nowrap" }}>
                          {STATUS_LABEL[order.status] || order.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#9a8060", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }} onClick={e => e.stopPropagation()}>
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          style={{ ...inp, fontSize: "0.72rem", padding: "0.3rem 0.5rem", cursor: "pointer" }}>
                          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={order.id + "-detail"} style={{ backgroundColor: "#FDFAF4", borderBottom: "1px solid rgba(140,100,20,0.06)" }}>
                        <td colSpan={7} style={{ padding: "0 1rem 1rem 1rem" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            {/* Itens */}
                            <div style={{ backgroundColor: "#fff", borderRadius: "0.75rem", padding: "1rem", border: "1px solid rgba(140,100,20,0.08)" }}>
                              <p style={{ fontWeight: 700, color: "#1a1510", fontSize: "0.8rem", marginBottom: "0.75rem" }}>Itens do Pedido</p>
                              {order.items.map(item => (
                                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", borderBottom: "1px solid rgba(140,100,20,0.06)", fontSize: "0.8rem" }}>
                                  <span style={{ color: "#3a2a10" }}>{item.size || item.product.name}</span>
                                  <span style={{ color: "#1a1510", fontWeight: 700 }}>{fmt(item.price)}</span>
                                </div>
                              ))}
                              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontWeight: 900, fontSize: "0.875rem" }}>
                                <span style={{ color: "#1a1510" }}>Total</span>
                                <span style={{ color: "#b8891a" }}>{fmt(order.total)}</span>
                              </div>
                            </div>
                            {/* Info cliente */}
                            <div style={{ backgroundColor: "#fff", borderRadius: "0.75rem", padding: "1rem", border: "1px solid rgba(140,100,20,0.08)" }}>
                              <p style={{ fontWeight: 700, color: "#1a1510", fontSize: "0.8rem", marginBottom: "0.75rem" }}>Cliente</p>
                              <p style={{ color: "#3a2a10", fontSize: "0.8rem", marginBottom: "0.3rem" }}>👤 {order.user.name}</p>
                              <p style={{ color: "#3a2a10", fontSize: "0.8rem", marginBottom: "0.3rem" }}>📧 {order.user.email}</p>
                              {order.user.phone && <p style={{ color: "#3a2a10", fontSize: "0.8rem", marginBottom: "0.3rem" }}>📞 {order.user.phone}</p>}
                              {order.notes && (
                                <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.75rem", backgroundColor: "#FAF6EE", borderRadius: "0.5rem", fontSize: "0.75rem", color: "#7a6030" }}>
                                  📝 {order.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
