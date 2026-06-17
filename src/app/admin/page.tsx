import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const [productCount, orderCount, userCount, recentOrders, revenue, stockData, lowStock, pendingOrders] =
    await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "customer" } }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { user: true, items: true },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "cancelled" } },
      }),
      // valor total do estoque = soma(price * stock)
      prisma.product.findMany({
        where: { active: true },
        select: { price: true, stock: true },
      }),
      // produtos com estoque baixo (<=5)
      prisma.product.count({ where: { active: true, stock: { lte: 5 } } }),
      // pedidos aguardando
      prisma.order.count({ where: { status: "pending" } }),
    ]);

  const totalEstoque = stockData.reduce((acc, p) => acc + p.price * p.stock, 0);
  const totalUnidades = stockData.reduce((acc, p) => acc + p.stock, 0);

  const statusLabel: Record<string, string> = {
    pending: "Aguardando",
    confirmed: "Confirmado",
    shipped: "Enviado",
    delivered: "Entregue",
    cancelled: "Cancelado",
  };

  const statusColors: Record<string, { bg: string; color: string }> = {
    pending:   { bg: "#fff8e1", color: "#b8891a" },
    confirmed: { bg: "#e8f4fd", color: "#1a6a9a" },
    shipped:   { bg: "#f0e8ff", color: "#6a30b8" },
    delivered: { bg: "#e8f8e8", color: "#1a8a2a" },
    cancelled: { bg: "#fee8e8", color: "#c04040" },
  };

  const adminName = (session.user as any)?.name?.split(" ")[0] || "Admin";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ color: "#9a8060", fontSize: "0.875rem", marginBottom: "0.2rem" }}>Olá, {adminName} 👋</p>
          <h1 style={{ color: "#1a1510", fontSize: "1.75rem", fontWeight: 900, lineHeight: 1 }}>Painel Access Fit</h1>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <a href="/admin/importar" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: "#fff", border: "1px solid rgba(184,137,26,0.3)", color: "#b8891a", fontWeight: 700, fontSize: "0.8rem", padding: "0.5rem 1rem", borderRadius: "0.625rem", textDecoration: "none" }}>
            ↑ Importar Excel
          </a>
          <a href="/admin/produtos/novo" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, fontSize: "0.8rem", padding: "0.5rem 1rem", borderRadius: "0.625rem", textDecoration: "none" }}>
            + Novo Produto
          </a>
        </div>
      </div>

      {/* Alertas */}
      {(lowStock > 0 || pendingOrders > 0) && (
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {lowStock > 0 && (
            <a href="/admin/produtos" style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#fff8e1", border: "1px solid rgba(184,137,26,0.3)", borderRadius: "0.75rem", padding: "0.6rem 1rem", textDecoration: "none" }}>
              <span style={{ fontSize: "1rem" }}>⚠️</span>
              <span style={{ color: "#b8891a", fontSize: "0.8rem", fontWeight: 700 }}>{lowStock} produto{lowStock > 1 ? "s" : ""} com estoque baixo</span>
            </a>
          )}
          {pendingOrders > 0 && (
            <a href="/admin/pedidos" style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#fee8e8", border: "1px solid rgba(192,64,64,0.2)", borderRadius: "0.75rem", padding: "0.6rem 1rem", textDecoration: "none" }}>
              <span style={{ fontSize: "1rem" }}>🔔</span>
              <span style={{ color: "#c04040", fontSize: "0.8rem", fontWeight: 700 }}>{pendingOrders} pedido{pendingOrders > 1 ? "s" : ""} aguardando</span>
            </a>
          )}
        </div>
      )}

      {/* KPIs principais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { emoji: "💰", label: "Receita Total", value: formatCurrency(revenue._sum.total || 0), sub: "pedidos confirmados", gold: true },
          { emoji: "📦", label: "Valor em Estoque", value: formatCurrency(totalEstoque), sub: `${totalUnidades} unidades`, gold: false },
          { emoji: "🛍️", label: "Pedidos", value: orderCount, sub: `${pendingOrders} aguardando`, gold: false },
          { emoji: "👗", label: "Produtos Ativos", value: productCount, sub: `${lowStock} com estoque baixo`, gold: false },
          { emoji: "👥", label: "Clientes", value: userCount, sub: "cadastrados", gold: false },
        ].map(stat => (
          <div key={stat.label} style={{ backgroundColor: stat.gold ? "#b8891a" : "#fff", border: stat.gold ? "none" : "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{stat.emoji}</div>
            <div style={{ color: stat.gold ? "#fff" : "#1a1510", fontSize: "1.6rem", fontWeight: 900, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ color: stat.gold ? "rgba(255,255,255,0.8)" : "#9a8060", fontSize: "0.75rem", fontWeight: 600, marginTop: "0.3rem" }}>{stat.label}</div>
            <div style={{ color: stat.gold ? "rgba(255,255,255,0.6)" : "#b8a080", fontSize: "0.7rem", marginTop: "0.15rem" }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Atalhos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "2rem" }}>
        {[
          { label: "Produtos", href: "/admin/produtos", emoji: "👗" },
          { label: "Pedidos", href: "/admin/pedidos", emoji: "📦" },
          { label: "Clientes", href: "/admin/clientes", emoji: "👥" },
          { label: "Categorias", href: "/admin/categorias", emoji: "🗂️" },
          { label: "Importar Excel", href: "/admin/importar", emoji: "📊" },
        ].map(link => (
          <a key={link.href} href={link.href}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "0.875rem", padding: "1rem 0.75rem", textDecoration: "none" }}>
            <span style={{ fontSize: "1.4rem" }}>{link.emoji}</span>
            <span style={{ color: "#1a1510", fontSize: "0.8rem", fontWeight: 700, textAlign: "center" }}>{link.label}</span>
          </a>
        ))}
      </div>

      {/* Pedidos recentes */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: "1px solid rgba(140,100,20,0.08)", backgroundColor: "#FAF6EE" }}>
          <h2 style={{ color: "#1a1510", fontWeight: 800, fontSize: "1rem" }}>Pedidos Recentes</h2>
          <a href="/admin/pedidos" style={{ color: "#b8891a", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none" }}>Ver todos →</a>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#FDFAF4" }}>
                {["Pedido", "Cliente", "Itens", "Total", "Status", "Data"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#9a8060", fontWeight: 700, fontSize: "0.75rem", borderBottom: "1px solid rgba(140,100,20,0.08)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#b8a080", fontSize: "0.875rem" }}>
                    Nenhum pedido ainda.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const sc = statusColors[order.status] || { bg: "#f0f0f0", color: "#666" };
                  return (
                    <tr key={order.id} style={{ borderBottom: "1px solid rgba(140,100,20,0.05)" }}>
                      <td style={{ padding: "0.875rem 1rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#9a8060", whiteSpace: "nowrap" }}>
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#1a1510", fontWeight: 600 }}>
                        {order.user?.name || "—"}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#5a4a2a" }}>
                        {order.items.reduce((s, i) => s + i.quantity, 0)} itens
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#1a1510", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {formatCurrency(order.total)}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ backgroundColor: sc.bg, color: sc.color, fontSize: "0.7rem", fontWeight: 700, padding: "0.25rem 0.625rem", borderRadius: "999px", whiteSpace: "nowrap" }}>
                          {statusLabel[order.status] || order.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#9a8060", whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
