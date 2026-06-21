import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const PAY_LABEL: Record<string, string> = {
  pix: "Pix", cartao: "Cartão", dinheiro: "Dinheiro",
  link: "Link", caderno: "Caderno",
};
const STATUS_LABEL: Record<string, string> = {
  "try-on": "Home Try-On", pending: "Aguardando",
  delivered: "Entregue", cancelled: "Cancelado",
};
const PAY_STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  paid: { bg: "#e8f8e8", color: "#1a8a2a" },
  partial: { bg: "#fff8e1", color: "#b8891a" },
  pending: { bg: "#fee8e8", color: "#c04040" },
};

export default async function ClientePerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const { id } = await params;

  const cliente = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: { select: { quantity: true, price: true, size: true } } },
      },
    },
  });

  if (!cliente) redirect("/admin/clientes");

  const pedidosAtivos = cliente.orders.filter(o => o.status !== "cancelled");
  const totalGasto = pedidosAtivos.reduce((s, o) => s + o.total, 0);
  const totalPago = pedidosAtivos.reduce((s, o) => s + o.amountPaid, 0);
  const saldoAberto = totalGasto - totalPago;
  const ticketMedio = pedidosAtivos.length > 0 ? totalGasto / pedidosAtivos.length : 0;

  // Produtos mais comprados
  const itemCounts: Record<string, { name: string; count: number; total: number }> = {};
  pedidosAtivos.forEach(o => {
    o.items.forEach(i => {
      const key = i.size || "item";
      if (!itemCounts[key]) itemCounts[key] = { name: key, count: 0, total: 0 };
      itemCounts[key].count += i.quantity;
      itemCounts[key].total += i.price * i.quantity;
    });
  });

  // Preferências de tamanho
  const sizeCount: Record<string, number> = {};
  pedidosAtivos.forEach(o => {
    o.items.forEach(i => {
      if (i.size && i.size.length <= 5) { // só tamanhos reais (P, M, G, etc)
        sizeCount[i.size] = (sizeCount[i.size] || 0) + 1;
      }
    });
  });
  const prefTamanho = Object.entries(sizeCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s]) => s);

  const tryOnOrders = cliente.orders.filter(o => o.status === "try-on");
  const ultimaCompra = pedidosAtivos[0]?.createdAt;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.25rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/admin/clientes" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Clientes</Link>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginTop: "0.3rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#1a1510" }}>{cliente.name || "Cliente"}</h1>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
              {cliente.phone && <span style={{ fontSize: "0.8rem", color: "#7a6030" }}>📞 {cliente.phone}</span>}
              <span style={{ fontSize: "0.8rem", color: "#9a8060" }}>📧 {cliente.email}</span>
              <span style={{ fontSize: "0.8rem", color: "#9a8060" }}>Cliente desde {new Date(cliente.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link href={`/admin/pedidos/novo?clienteId=${cliente.id}`}
              style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, fontSize: "0.85rem", padding: "0.5rem 1rem", borderRadius: "0.625rem", textDecoration: "none" }}>
              + Novo Pedido
            </Link>
            {saldoAberto > 0 && (
              <Link href={`/admin/caderno/${cliente.id}`}
                style={{ backgroundColor: "#fff8e1", border: "1px solid rgba(184,137,26,0.3)", color: "#856404", fontWeight: 700, fontSize: "0.85rem", padding: "0.5rem 1rem", borderRadius: "0.625rem", textDecoration: "none" }}>
                Ver caderno
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.875rem", marginBottom: "1.5rem" }}>
        {[
          { emoji: "🛍️", label: "Pedidos", value: pedidosAtivos.length },
          { emoji: "💰", label: "Total gasto", value: formatCurrency(totalGasto) },
          { emoji: "✅", label: "Total pago", value: formatCurrency(totalPago), ok: true },
          { emoji: "📒", label: "Saldo em aberto", value: formatCurrency(saldoAberto), warn: saldoAberto > 0 },
          { emoji: "🎯", label: "Ticket médio", value: formatCurrency(ticketMedio) },
          { emoji: "👗", label: "Home Try-On", value: tryOnOrders.length },
        ].map(k => (
          <div key={k.label} style={{ backgroundColor: "#fff", border: `1px solid ${(k as any).warn ? "rgba(184,137,26,0.3)" : "rgba(140,100,20,0.1)"}`, borderRadius: "0.875rem", padding: "0.875rem 1rem" }}>
            <div style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>{k.emoji}</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 900, color: (k as any).warn ? "#856404" : (k as any).ok ? "#1a8a2a" : "#1a1510" }}>{k.value}</div>
            <div style={{ fontSize: "0.7rem", color: "#9a8060", marginTop: "0.15rem" }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>

        {/* Histórico de pedidos */}
        <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(140,100,20,0.08)", backgroundColor: "#FAF6EE" }}>
            <h2 style={{ fontWeight: 800, fontSize: "0.95rem", color: "#1a1510" }}>Histórico de Pedidos</h2>
          </div>
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {cliente.orders.length === 0 ? (
              <p style={{ textAlign: "center", padding: "2rem", color: "#b8a080" }}>Nenhum pedido ainda.</p>
            ) : cliente.orders.map(o => {
              const saldo = o.total - o.amountPaid;
              const sc = PAY_STATUS_COLOR[o.paymentStatus] || { bg: "#f0f0f0", color: "#666" };
              return (
                <div key={o.id} style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid rgba(140,100,20,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.72rem", fontFamily: "monospace", color: "#9a8060" }}>#{o.id.slice(-8).toUpperCase()}</span>
                      <span style={{ fontSize: "0.72rem", backgroundColor: sc.bg, color: sc.color, padding: "0.15rem 0.5rem", borderRadius: 999, fontWeight: 700 }}>
                        {o.paymentStatus === "paid" ? "Pago" : o.paymentStatus === "partial" ? "Parcial" : "Pendente"}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#9a8060" }}>{STATUS_LABEL[o.status] || o.status}</span>
                      <span style={{ fontSize: "0.72rem", color: "#9a8060" }}>{PAY_LABEL[o.paymentMethod] || o.paymentMethod}</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#9a8060", marginTop: "0.2rem" }}>
                      {new Date(o.createdAt).toLocaleDateString("pt-BR")} · {o.items.length} item(s)
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "#1a1510" }}>{formatCurrency(o.total)}</div>
                    {saldo > 0 && <div style={{ fontSize: "0.72rem", color: "#c04040" }}>saldo: {formatCurrency(saldo)}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Perfil e preferências */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {prefTamanho.length > 0 && (
            <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.25rem" }}>
              <h3 style={{ fontWeight: 800, fontSize: "0.875rem", color: "#1a1510", marginBottom: "0.75rem" }}>✨ Preferências</h3>
              <div>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9a8060", marginBottom: "0.4rem" }}>TAMANHOS MAIS USADOS</p>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {prefTamanho.map(s => (
                    <span key={s} style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, fontSize: "0.8rem", padding: "0.3rem 0.75rem", borderRadius: 999 }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {ultimaCompra && (
            <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.25rem" }}>
              <h3 style={{ fontWeight: 800, fontSize: "0.875rem", color: "#1a1510", marginBottom: "0.75rem" }}>📅 Atividade</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                  <span style={{ color: "#9a8060" }}>Última compra</span>
                  <span style={{ fontWeight: 700, color: "#1a1510" }}>{new Date(ultimaCompra).toLocaleDateString("pt-BR")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                  <span style={{ color: "#9a8060" }}>Dias desde última compra</span>
                  <span style={{ fontWeight: 700, color: "#1a1510" }}>
                    {Math.floor((Date.now() - new Date(ultimaCompra).getTime()) / (1000 * 60 * 60 * 24))}d
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                  <span style={{ color: "#9a8060" }}>Frequência média</span>
                  <span style={{ fontWeight: 700, color: "#1a1510" }}>
                    {pedidosAtivos.length > 1
                      ? `${Math.floor((Date.now() - new Date(cliente.createdAt).getTime()) / (1000 * 60 * 60 * 24) / pedidosAtivos.length)}d/pedido`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Link href={`https://wa.me/55${(cliente.phone || "").replace(/\D/g, "")}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", backgroundColor: "#25D366", color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "0.75rem", borderRadius: "0.875rem", textDecoration: "none" }}>
            💬 Falar no WhatsApp
          </Link>
        </div>
      </div>
    </div>
  );
}
