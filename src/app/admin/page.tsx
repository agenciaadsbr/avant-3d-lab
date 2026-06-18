import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    productCount, orderCount, userCount,
    recentOrders, revenue, revenueThisMonth, revenueLastMonth,
    stockData, lowStock, zeroStock, pendingOrders,
    ordersThisMonth, newUsersThisMonth,
    totalExpenses, expensesThisMonth,
    topProducts, cadernoOrders, recentSales,
  ] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.order.findMany({
      take: 6, orderBy: { createdAt: "desc" },
      include: { user: true, items: true },
    }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "cancelled" } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "cancelled" }, createdAt: { gte: startOfMonth } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "cancelled" }, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.product.findMany({ where: { active: true }, select: { price: true, costPrice: true, stock: true, name: true } }),
    prisma.product.count({ where: { active: true, stock: { gt: 0, lte: 5 } } }),
    prisma.product.count({ where: { active: true, stock: 0 } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { role: "customer", createdAt: { gte: startOfMonth } } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: startOfMonth } } }),
    prisma.orderItem.groupBy({
      by: ["productId"], _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } }, take: 5,
    }),
    prisma.order.findMany({
      where: { paymentMethod: "caderno", paymentStatus: { not: "paid" } },
      select: { total: true, amountPaid: true },
    }),
    prisma.order.findMany({
      where: { status: { not: "cancelled" }, createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } },
      select: { total: true, createdAt: true },
    }),
  ]);

  const valorVenda = stockData.reduce((a, p) => a + p.price * p.stock, 0);
  const valorCusto = stockData.reduce((a, p) => a + (p.costPrice ?? p.price * 0.55) * p.stock, 0);
  const totalUnidades = stockData.reduce((a, p) => a + p.stock, 0);
  const margemEstoque = valorVenda > 0 ? ((valorVenda - valorCusto) / valorVenda) * 100 : 0;

  const receitaMes = revenueThisMonth._sum.total || 0;
  const receitaMesPassado = revenueLastMonth._sum.total || 0;
  const variacaoReceita = receitaMesPassado > 0 ? ((receitaMes - receitaMesPassado) / receitaMesPassado) * 100 : 0;

  const totalGastos = totalExpenses._sum.amount || 0;
  const gastosMes = expensesThisMonth._sum.amount || 0;
  const lucroLiquido = (revenue._sum.total || 0) - totalGastos;

  const ticketMedio = orderCount > 0 ? (revenue._sum.total || 0) / orderCount : 0;
  const cadernoNaRua = cadernoOrders.reduce((s, o) => s + (o.total - o.amountPaid), 0);
  const cadernoQtd = cadernoOrders.length;

  // monthly revenue chart (last 6 months)
  const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const total = recentSales
      .filter(o => { const od = new Date(o.createdAt); return od.getMonth() === month && od.getFullYear() === year; })
      .reduce((s, o) => s + o.total, 0);
    return { label: MONTHS_PT[month], total };
  });
  const monthlyMax = Math.max(...monthlyData.map(m => m.total), 1);

  // bar chart data for custo vs venda
  const barMax = Math.max(valorCusto, valorVenda, 1);
  const custoW = Math.round((valorCusto / barMax) * 100);
  const vendaW = Math.round((valorVenda / barMax) * 100);

  const statusLabel: Record<string, string> = {
    pending: "Aguardando", confirmed: "Confirmado",
    shipped: "Enviado", delivered: "Entregue", cancelled: "Cancelado",
  };
  const statusColors: Record<string, { bg: string; color: string }> = {
    pending:   { bg: "#fff8e1", color: "#b8891a" },
    confirmed: { bg: "#e8f4fd", color: "#1a6a9a" },
    shipped:   { bg: "#f0e8ff", color: "#6a30b8" },
    delivered: { bg: "#e8f8e8", color: "#1a8a2a" },
    cancelled: { bg: "#fee8e8", color: "#c04040" },
  };

  const adminName = (session.user as any)?.name?.split(" ")[0] || "Admin";

  const card = (style?: object) => ({
    backgroundColor: "#fff",
    border: "1px solid rgba(140,100,20,0.1)",
    borderRadius: "1rem",
    padding: "1.25rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    ...style,
  });

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ color: "#9a8060", fontSize: "0.875rem", marginBottom: "0.2rem" }}>Olá, {adminName} 👋</p>
          <h1 style={{ color: "#1a1510", fontSize: "1.75rem", fontWeight: 900, lineHeight: 1 }}>Painel Access Fit</h1>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <a href="/admin/financeiro" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: "#fff", border: "1px solid rgba(184,137,26,0.3)", color: "#b8891a", fontWeight: 700, fontSize: "0.8rem", padding: "0.5rem 1rem", borderRadius: "0.625rem", textDecoration: "none" }}>
            💳 Financeiro
          </a>
          <a href="/admin/importar" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: "#fff", border: "1px solid rgba(184,137,26,0.3)", color: "#b8891a", fontWeight: 700, fontSize: "0.8rem", padding: "0.5rem 1rem", borderRadius: "0.625rem", textDecoration: "none" }}>
            ↑ Importar Excel
          </a>
          <a href="/admin/produtos/novo" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, fontSize: "0.8rem", padding: "0.5rem 1rem", borderRadius: "0.625rem", textDecoration: "none" }}>
            + Novo Produto
          </a>
        </div>
      </div>

      {/* Alertas */}
      {(lowStock > 0 || zeroStock > 0 || pendingOrders > 0) && (
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {zeroStock > 0 && (
            <a href="/admin/produtos" style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#fee8e8", border: "1px solid rgba(192,64,64,0.2)", borderRadius: "0.75rem", padding: "0.6rem 1rem", textDecoration: "none" }}>
              <span>🚫</span>
              <span style={{ color: "#c04040", fontSize: "0.8rem", fontWeight: 700 }}>{zeroStock} produto{zeroStock > 1 ? "s" : ""} sem estoque</span>
            </a>
          )}
          {lowStock > 0 && (
            <a href="/admin/produtos" style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#fff8e1", border: "1px solid rgba(184,137,26,0.3)", borderRadius: "0.75rem", padding: "0.6rem 1rem", textDecoration: "none" }}>
              <span>⚠️</span>
              <span style={{ color: "#b8891a", fontSize: "0.8rem", fontWeight: 700 }}>{lowStock} produto{lowStock > 1 ? "s" : ""} com estoque baixo</span>
            </a>
          )}
          {pendingOrders > 0 && (
            <a href="/admin/pedidos" style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#e8f4fd", border: "1px solid rgba(26,106,154,0.2)", borderRadius: "0.75rem", padding: "0.6rem 1rem", textDecoration: "none" }}>
              <span>🔔</span>
              <span style={{ color: "#1a6a9a", fontSize: "0.8rem", fontWeight: 700 }}>{pendingOrders} pedido{pendingOrders > 1 ? "s" : ""} aguardando</span>
            </a>
          )}
        </div>
      )}

      {/* KPIs Financeiros — linha 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ ...card(), backgroundColor: "#b8891a", border: "none" }}>
          <div style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>💰</div>
          <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 900, lineHeight: 1 }}>{formatCurrency(revenue._sum.total || 0)}</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.75rem", fontWeight: 700, marginTop: "0.3rem" }}>Receita Total</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem", marginTop: "0.1rem" }}>todos os pedidos</div>
        </div>
        <div style={card()}>
          <div style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>📅</div>
          <div style={{ color: "#1a1510", fontSize: "1.5rem", fontWeight: 900, lineHeight: 1 }}>{formatCurrency(receitaMes)}</div>
          <div style={{ color: "#9a8060", fontSize: "0.75rem", fontWeight: 700, marginTop: "0.3rem" }}>Receita este Mês</div>
          <div style={{ color: variacaoReceita >= 0 ? "#1a8a2a" : "#c04040", fontSize: "0.7rem", marginTop: "0.1rem", fontWeight: 700 }}>
            {variacaoReceita >= 0 ? "▲" : "▼"} {Math.abs(variacaoReceita).toFixed(1)}% vs mês passado
          </div>
        </div>
        <div style={card()}>
          <div style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>💸</div>
          <div style={{ color: "#1a1510", fontSize: "1.5rem", fontWeight: 900, lineHeight: 1 }}>{formatCurrency(totalGastos)}</div>
          <div style={{ color: "#9a8060", fontSize: "0.75rem", fontWeight: 700, marginTop: "0.3rem" }}>Total Despesas</div>
          <div style={{ color: "#b8a080", fontSize: "0.7rem", marginTop: "0.1rem" }}>{formatCurrency(gastosMes)} este mês</div>
        </div>
        <div style={{ ...card(), backgroundColor: lucroLiquido >= 0 ? "#f0fff4" : "#fff0f0", border: `1px solid ${lucroLiquido >= 0 ? "rgba(26,138,42,0.2)" : "rgba(192,64,64,0.2)"}` }}>
          <div style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>📈</div>
          <div style={{ color: lucroLiquido >= 0 ? "#1a8a2a" : "#c04040", fontSize: "1.5rem", fontWeight: 900, lineHeight: 1 }}>{formatCurrency(lucroLiquido)}</div>
          <div style={{ color: "#9a8060", fontSize: "0.75rem", fontWeight: 700, marginTop: "0.3rem" }}>Lucro Líquido</div>
          <div style={{ color: "#b8a080", fontSize: "0.7rem", marginTop: "0.1rem" }}>receita − despesas</div>
        </div>
        <div style={card()}>
          <div style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>🎯</div>
          <div style={{ color: "#1a1510", fontSize: "1.5rem", fontWeight: 900, lineHeight: 1 }}>{formatCurrency(ticketMedio)}</div>
          <div style={{ color: "#9a8060", fontSize: "0.75rem", fontWeight: 700, marginTop: "0.3rem" }}>Ticket Médio</div>
          <div style={{ color: "#b8a080", fontSize: "0.7rem", marginTop: "0.1rem" }}>{orderCount} pedidos</div>
        </div>
        <Link href="/admin/pedidos?method=caderno" style={{ textDecoration: "none" }}>
          <div style={{ backgroundColor: cadernoNaRua > 0 ? "#fffbea" : "#fff", border: `1px solid ${cadernoNaRua > 0 ? "rgba(133,100,4,0.35)" : "rgba(140,100,20,0.1)"}`, borderRadius: "1rem", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", cursor: "pointer", height: "100%", boxSizing: "border-box" as const }}>
            <div style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>📒</div>
            <div style={{ color: cadernoNaRua > 0 ? "#856404" : "#1a1510", fontSize: "1.5rem", fontWeight: 900, lineHeight: 1 }}>{formatCurrency(cadernoNaRua)}</div>
            <div style={{ color: "#9a8060", fontSize: "0.75rem", fontWeight: 700, marginTop: "0.3rem" }}>Caderno na Rua</div>
            <div style={{ color: "#b8a080", fontSize: "0.7rem", marginTop: "0.1rem" }}>{cadernoQtd} {cadernoQtd === 1 ? "cliente" : "clientes"} em aberto</div>
          </div>
        </Link>
      </div>

      {/* KPIs Estoque + Operacionais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={card()}>
          <div style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>🏷️</div>
          <div style={{ color: "#1a1510", fontSize: "1.5rem", fontWeight: 900, lineHeight: 1 }}>{formatCurrency(valorCusto)}</div>
          <div style={{ color: "#9a8060", fontSize: "0.75rem", fontWeight: 700, marginTop: "0.3rem" }}>Valor Custo Estoque</div>
          <div style={{ color: "#b8a080", fontSize: "0.7rem", marginTop: "0.1rem" }}>investido nas peças</div>
        </div>
        <div style={card()}>
          <div style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>📦</div>
          <div style={{ color: "#1a1510", fontSize: "1.5rem", fontWeight: 900, lineHeight: 1 }}>{formatCurrency(valorVenda)}</div>
          <div style={{ color: "#9a8060", fontSize: "0.75rem", fontWeight: 700, marginTop: "0.3rem" }}>Valor Venda Estoque</div>
          <div style={{ color: "#b8a080", fontSize: "0.7rem", marginTop: "0.1rem" }}>{totalUnidades} unidades</div>
        </div>
        <div style={card()}>
          <div style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>✨</div>
          <div style={{ color: "#b8891a", fontSize: "1.5rem", fontWeight: 900, lineHeight: 1 }}>{margemEstoque.toFixed(1)}%</div>
          <div style={{ color: "#9a8060", fontSize: "0.75rem", fontWeight: 700, marginTop: "0.3rem" }}>Margem Potencial</div>
          <div style={{ color: "#b8a080", fontSize: "0.7rem", marginTop: "0.1rem" }}>sobre estoque atual</div>
        </div>
        <div style={card()}>
          <div style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>🛍️</div>
          <div style={{ color: "#1a1510", fontSize: "1.5rem", fontWeight: 900, lineHeight: 1 }}>{ordersThisMonth}</div>
          <div style={{ color: "#9a8060", fontSize: "0.75rem", fontWeight: 700, marginTop: "0.3rem" }}>Pedidos este Mês</div>
          <div style={{ color: "#b8a080", fontSize: "0.7rem", marginTop: "0.1rem" }}>{pendingOrders} aguardando</div>
        </div>
        <div style={card()}>
          <div style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>👥</div>
          <div style={{ color: "#1a1510", fontSize: "1.5rem", fontWeight: 900, lineHeight: 1 }}>{userCount}</div>
          <div style={{ color: "#9a8060", fontSize: "0.75rem", fontWeight: 700, marginTop: "0.3rem" }}>Clientes</div>
          <div style={{ color: "#1a8a2a", fontSize: "0.7rem", marginTop: "0.1rem", fontWeight: 700 }}>+{newUsersThisMonth} este mês</div>
        </div>
      </div>

      {/* Gráfico Custo vs Venda + Atalhos */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>

        {/* Gráfico Custo x Venda */}
        <div style={card()}>
          <h2 style={{ color: "#1a1510", fontWeight: 800, fontSize: "0.95rem", marginBottom: "1.25rem" }}>
            📊 Estoque — Custo × Venda
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#9a8060", fontWeight: 700 }}>💸 Custo (investido)</span>
                <span style={{ fontSize: "0.75rem", color: "#1a1510", fontWeight: 900 }}>{formatCurrency(valorCusto)}</span>
              </div>
              <div style={{ height: 12, backgroundColor: "#f0e8d0", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${custoW}%`, backgroundColor: "#d4a853", borderRadius: 999, transition: "width 0.5s" }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#9a8060", fontWeight: 700 }}>💰 Venda (potencial)</span>
                <span style={{ fontSize: "0.75rem", color: "#1a1510", fontWeight: 900 }}>{formatCurrency(valorVenda)}</span>
              </div>
              <div style={{ height: 12, backgroundColor: "#f0e8d0", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${vendaW}%`, backgroundColor: "#b8891a", borderRadius: 999, transition: "width 0.5s" }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#9a8060", fontWeight: 700 }}>📈 Lucro potencial</span>
                <span style={{ fontSize: "0.75rem", color: "#1a8a2a", fontWeight: 900 }}>{formatCurrency(valorVenda - valorCusto)}</span>
              </div>
              <div style={{ height: 12, backgroundColor: "#f0e8d0", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.round(((valorVenda - valorCusto) / barMax) * 100)}%`, backgroundColor: "#4aab6a", borderRadius: 999 }} />
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(140,100,20,0.1)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "#9a8060" }}>Margem sobre venda</span>
              <span style={{ fontSize: "1rem", fontWeight: 900, color: "#b8891a" }}>{margemEstoque.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Atalhos */}
        <div style={card()}>
          <h2 style={{ color: "#1a1510", fontWeight: 800, fontSize: "0.95rem", marginBottom: "1.25rem" }}>⚡ Atalhos Rápidos</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
            {[
              { label: "Produtos", href: "/admin/produtos", emoji: "👗", sub: `${productCount} ativos` },
              { label: "Pedidos", href: "/admin/pedidos", emoji: "📦", sub: `${orderCount} total` },
              { label: "Financeiro", href: "/admin/financeiro", emoji: "💳", sub: "despesas" },
              { label: "Clientes", href: "/admin/clientes", emoji: "👥", sub: `${userCount} cadastros` },
              { label: "Categorias", href: "/admin/categorias", emoji: "🗂️", sub: "organizar" },
              { label: "Importar Excel", href: "/admin/importar", emoji: "📊", sub: "estoque" },
            ].map(link => (
              <a key={link.href} href={link.href}
                style={{ display: "flex", alignItems: "center", gap: "0.625rem", backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "0.75rem", padding: "0.75rem", textDecoration: "none" }}>
                <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{link.emoji}</span>
                <div>
                  <div style={{ color: "#1a1510", fontSize: "0.8rem", fontWeight: 700 }}>{link.label}</div>
                  <div style={{ color: "#9a8060", fontSize: "0.65rem" }}>{link.sub}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico Receita Mensal */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: "1.5rem" }}>
        <h2 style={{ color: "#1a1510", fontWeight: 800, fontSize: "0.95rem", marginBottom: "1.5rem" }}>📈 Receita por Mês</h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "0.625rem", height: 160 }}>
          {monthlyData.map((m, i) => {
            const h = Math.max(Math.round((m.total / monthlyMax) * 140), m.total > 0 ? 6 : 2);
            const isCurrent = i === 5;
            return (
              <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.65rem", color: "#9a8060", fontWeight: 700, whiteSpace: "nowrap" }}>
                  {m.total > 0 ? `R$${(m.total / 1000).toFixed(1)}k` : ""}
                </span>
                <div style={{ width: "100%", height: h, backgroundColor: isCurrent ? "#b8891a" : "#e8d9b0", borderRadius: "6px 6px 0 0", transition: "height 0.4s", position: "relative" }} />
                <span style={{ fontSize: "0.72rem", color: isCurrent ? "#b8891a" : "#9a8060", fontWeight: isCurrent ? 900 : 600 }}>{m.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", borderTop: "1px solid rgba(140,100,20,0.08)", paddingTop: "0.75rem" }}>
          <div style={{ fontSize: "0.75rem", color: "#9a8060" }}>
            <span style={{ display: "inline-block", width: 10, height: 10, backgroundColor: "#b8891a", borderRadius: 2, marginRight: 4 }} />
            Mês atual
          </div>
          <div style={{ fontSize: "0.75rem", color: "#9a8060" }}>
            <span style={{ display: "inline-block", width: 10, height: 10, backgroundColor: "#e8d9b0", borderRadius: 2, marginRight: 4 }} />
            Meses anteriores
          </div>
          <div style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#5a4a2a", fontWeight: 700 }}>
            Total 6 meses: {formatCurrency(monthlyData.reduce((s, m) => s + m.total, 0))}
          </div>
        </div>
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
                      <td style={{ padding: "0.875rem 1rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#9a8060" }}>
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
