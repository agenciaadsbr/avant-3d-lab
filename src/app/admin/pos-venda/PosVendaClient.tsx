"use client";
import { useEffect, useState } from "react";

type Item = { quantity: number; size: string | null; componentName?: string | null; product?: { name: string } | null };
type Order = {
  id: string; total: number; deliveredAt: string;
  user: { id: string; name: string | null; phone: string | null };
  items: Item[];
};

function itemName(i: Item): string {
  const isVM = i.product?.name === "Venda Manual";
  if (isVM) return i.size || "Item";
  if (i.product?.name) return i.componentName ? `${i.product.name} - ${i.componentName}` : i.product.name;
  return i.size || "Item";
}

export default function PosVendaClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/pos-venda").then(r => r.json()).then(d => setOrders(d.orders || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const enviarFollowUp = (order: Order) => {
    if (!order.user.phone) return alert("Cliente sem telefone cadastrado.");
    const itens = order.items.map(i => `- ${itemName(i)} x${i.quantity}`).join("\n");
    const msg = [
      `Olá ${order.user.name?.split(" ")[0] || ""}!`,
      ``,
      `Faz alguns dias que você recebeu seu pedido na *Access Fit*:`,
      ``,
      itens,
      ``,
      `Ficou tudo certinho? O que achou das peças? 😊`,
      `Adoraríamos saber sua opinião — e se precisar de troca ou tiver qualquer dúvida, é só chamar por aqui!`,
    ].join("\n");
    const phone = order.user.phone.replace(/\D/g, "");
    const ddi = phone.startsWith("55") ? phone : `55${phone}`;
    window.open(`https://wa.me/${ddi}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const marcarEnviado = async (id: string) => {
    setSendingId(id);
    await fetch(`/api/admin/pos-venda/${id}`, { method: "PUT" });
    setOrders(prev => prev.filter(o => o.id !== id));
    setSendingId(null);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>
      <a href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</a>
      <h1 style={{ color: "#1a1510", fontSize: "1.75rem", fontWeight: 900, marginTop: "0.2rem" }}>💬 Pós-venda</h1>
      <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.2rem", marginBottom: "1.5rem" }}>
        Pedidos entregues há 3+ dias, aguardando follow-up
      </p>

      {loading ? (
        <p style={{ color: "#9a8060" }}>Carregando...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#9a8060", backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)" }}>
          Nenhum pedido pendente de follow-up. 🎉
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {orders.map(order => (
            <div key={order.id} style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.12)", borderRadius: "1rem", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <p style={{ fontWeight: 800, color: "#1a1510", fontSize: "1rem" }}>{order.user.name || "—"}</p>
                  <p style={{ fontSize: "0.78rem", color: "#9a8060" }}>
                    Entregue em {new Date(order.deliveredAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span style={{ fontWeight: 700, color: "#b8891a" }}>R$ {order.total.toFixed(2).replace(".", ",")}</span>
              </div>

              <div style={{ backgroundColor: "#FAF6EE", borderRadius: "0.5rem", padding: "0.625rem 0.875rem", marginBottom: "0.875rem", fontSize: "0.8rem", color: "#5a4a2a" }}>
                {order.items.map((i, idx) => (
                  <div key={idx}>{itemName(i)} x{i.quantity}</div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button onClick={() => enviarFollowUp(order)}
                  style={{ backgroundColor: "#25D366", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.5rem 1rem", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                  📲 Enviar mensagem
                </button>
                <button onClick={() => marcarEnviado(order.id)} disabled={sendingId === order.id}
                  style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.25)", color: "#7a5a20", borderRadius: "0.5rem", padding: "0.5rem 1rem", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                  {sendingId === order.id ? "..." : "✓ Marcar como enviado"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
