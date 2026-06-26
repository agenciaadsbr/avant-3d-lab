import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import RelatorioClientes from "../RelatorioClientes";
import DashboardVendas from "../DashboardVendas";

export const dynamic = 'force-dynamic';

const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export default async function RelatoriosPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const now = new Date();
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const start6Months = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    // Receita mensal (6 meses)
    salesByMonth,
    // Despesas mensais (6 meses)
    expensesByMonth,
    // Ranking de clientes
    topClients,
    // Projeção: caderno a receber
    cadernoAberto,
    // Projeção: fatura cartão próximos 3 meses
    cartaoFuturo,
    // Estoque
    products,
    // Home Try-On stats
    tryOnTotal,
    tryOnConfirmed,
    tryOnReturned,
    // Novos clientes por mês
    newClientsThisMonth,
    newClientsLastMonth,
  ] = await Promise.all([
    // Vendas por mês (últimos 6)
    prisma.order.findMany({
      where: { status: { not: "cancelled" }, createdAt: { gte: start6Months } },
      select: { total: true, amountPaid: true, createdAt: true, paymentStatus: true },
    }),
    // Despesas por mês (últimos 6)
    prisma.expense.findMany({
      where: { date: { gte: start6Months } },
      select: { amount: true, date: true, category: true },
    }),
    // Top 10 clientes
    prisma.order.groupBy({
      by: ["userId"],
      where: { status: { not: "cancelled" }, status2: undefined } as any,
      _sum: { total: true, amountPaid: true },
      _count: { id: true },
      orderBy: { _sum: { total: "desc" } },
      take: 10,
    }).catch(() => prisma.$queryRaw`
      SELECT "userId",
        SUM(total) as total_gasto,
        COUNT(id) as num_pedidos,
        SUM("amountPaid") as total_pago
      FROM "Order"
      WHERE status != 'cancelled'
      GROUP BY "userId"
      ORDER BY total_gasto DESC
      LIMIT 10
    `),
    // Caderno em aberto
    prisma.order.findMany({
      where: { paymentStatus: { not: "paid" }, status: { not: "cancelled" } },
      select: { total: true, amountPaid: true, dueDate: true, user: { select: { name: true } } },
    }),
    // Cartão: próximos 3 meses
    prisma.expense.findMany({
      where: {
        paymentMethod: "cartao_credito",
        dueDate: { gte: now, lte: new Date(now.getFullYear(), now.getMonth() + 3, 0) },
      },
      select: { amount: true, dueDate: true, installments: true, description: true },
    }),
    // Produtos para giro
    prisma.product.findMany({
      where: { active: true, NOT: { slug: "venda-manual" } },
      select: { id: true, name: true, sku: true, stock: true, price: true, costPrice: true, category: { select: { name: true } } },
      orderBy: { stock: "asc" },
    }),
    // Home Try-On total
    prisma.order.count({ where: { status: "try-on" } }),
    prisma.order.count({ where: { status: "delivered", notes: { contains: "try" } } }).catch(() => 0),
    prisma.order.count({ where: { status: "cancelled" } }),
    prisma.user.count({ where: { role: "customer", createdAt: { gte: startThisMonth } } }),
    prisma.user.count({ where: { role: "customer", createdAt: { gte: startLastMonth, lte: endLastMonth } } }),
  ]);

  // Buscar nomes dos top clientes
  const topClientsRaw = await prisma.$queryRaw<Array<{userId: string, total_gasto: number, num_pedidos: number, total_pago: number}>>`
    SELECT "userId",
      SUM(total) as total_gasto,
      COUNT(id) as num_pedidos,
      SUM("amountPaid") as total_pago
    FROM "Order"
    WHERE status != 'cancelled'
    GROUP BY "userId"
    ORDER BY total_gasto DESC
    LIMIT 10
  `;

  const clientIds = topClientsRaw.map(c => c.userId);
  const clientNames = await prisma.user.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true },
  });
  const nameMap = Object.fromEntries(clientNames.map(c => [c.id, c.name]));

  const topClientsList = topClientsRaw.map(c => ({
    name: nameMap[c.userId] || "—",
    totalGasto: Number(c.total_gasto),
    numPedidos: Number(c.num_pedidos),
    totalPago: Number(c.total_pago),
    saldo: Number(c.total_gasto) - Number(c.total_pago),
  }));

  // Montar dados mensais
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const m = d.getMonth(); const y = d.getFullYear();
    const receita = salesByMonth
      .filter(o => { const od = new Date(o.createdAt); return od.getMonth() === m && od.getFullYear() === y; })
      .reduce((s, o) => s + o.total, 0);
    const despesa = expensesByMonth
      .filter(e => { const ed = new Date(e.date); return ed.getMonth() === m && ed.getFullYear() === y; })
      .reduce((s, e) => s + e.amount, 0);
    return { label: MONTHS_PT[m], receita, despesa, lucro: receita - despesa, isCurrent: i === 5 };
  });

  const receitaMes = monthlyData[5].receita;
  const receitaMesAnterior = monthlyData[4].receita;
  const lucroMes = monthlyData[5].lucro;
  const varReceita = receitaMesAnterior > 0 ? ((receitaMes - receitaMesAnterior) / receitaMesAnterior) * 100 : 0;
  const maxBar = Math.max(...monthlyData.map(m => Math.max(m.receita, m.despesa)), 1);

  // Projeção caixa
  const totalAReceber = cadernoAberto.reduce((s, o) => s + (o.total - o.amountPaid), 0);
  const vencidosHoje = cadernoAberto.filter(o => o.dueDate && new Date(o.dueDate) < now);
  const totalVencido = vencidosHoje.reduce((s, o) => s + (o.total - o.amountPaid), 0);

  // Fatura cartão por mês
  const cartaoProxMeses = [0, 1, 2].map(i => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const m = d.getMonth(); const y = d.getFullYear();
    const total = cartaoFuturo
      .filter(e => { if (!e.dueDate) return false; const dd = new Date(e.dueDate); return dd.getMonth() === m && dd.getFullYear() === y; })
      .reduce((s, e) => s + e.amount / (e.installments || 1), 0);
    return { label: MONTHS_PT[m], total };
  });

  // Estoque zerado e baixo
  const produtosZerados = products.filter(p => p.stock === 0);
  const produtosBaixo = products.filter(p => p.stock > 0 && p.stock <= 2);
  const valorEstoque = products.reduce((s, p) => s + p.price * p.stock, 0);
  const custoEstoque = products.reduce((s, p) => s + (p.costPrice || 0) * p.stock, 0);

  const card = (style?: object) => ({
    backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)",
    borderRadius: "1rem", padding: "1.25rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)", ...style,
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.25rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#1a1510" }}>📊 Relatórios</h1>
        <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.2rem" }}>Visão analítica do negócio</p>
      </div>

      {/* SEÇÃO: FATURAMENTO */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 900, color: "#b8891a", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>💰 Faturamento</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { emoji: "💵", label: "Receita este mês", value: formatCurrency(receitaMes), sub: `${varReceita >= 0 ? "▲" : "▼"} ${Math.abs(varReceita).toFixed(0)}% vs mês anterior`, ok: varReceita >= 0, color: "#b8891a" },
            { emoji: "📦", label: "Custo de Produtos", value: formatCurrency(monthlyData[5].receita > 0 ? monthlyData[5].receita * 0.5 : 0), sub: "aproximado (50% da receita)", color: "#5a4a2a" },
            { emoji: "💸", label: "Despesas Gerais", value: formatCurrency(monthlyData[5].despesa), sub: "estoque, cartão, frete, etc", color: "#c04040" },
            { emoji: "📈", label: "Lucro Líquido", value: formatCurrency(lucroMes), sub: lucroMes >= 0 ? `${((lucroMes / receitaMes) * 100).toFixed(1)}% de margem` : "investimento", ok: lucroMes >= 0, color: lucroMes >= 0 ? "#1a8a2a" : "#c04040" },
          ].map(k => (
            <div key={k.label} style={card({ borderLeft: `4px solid ${(k as any).color || "#b8891a"}` })}>
              <div style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>{k.emoji}</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 900, color: (k as any).color || "#1a1510" }}>{k.value}</div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9a8060", marginTop: "0.2rem" }}>{k.label}</div>
              <div style={{ fontSize: "0.68rem", color: (k as any).ok !== undefined ? ((k as any).ok ? "#1a8a2a" : "#c04040") : "#9a8060", marginTop: "0.15rem" }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO: ANÁLISE MENSAL */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 900, color: "#b8891a", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>📈 Análise Mensal</h2>
      </div>

      {/* Gráfico receita vs despesa */}
      <div style={{ ...card(), marginBottom: "1.5rem" }}>
        <h3 style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a1510", marginBottom: "1.5rem" }}>Receita × Despesa (últimos 6 meses)</h3>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", height: 140 }}>
          {monthlyData.map((m, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
              <div style={{ width: "100%", display: "flex", gap: "2px", alignItems: "flex-end", height: 110 }}>
                <div style={{ flex: 1, height: Math.max(m.receita / maxBar * 100, 2), backgroundColor: m.isCurrent ? "#b8891a" : "#e8d9b0", borderRadius: "3px 3px 0 0", transition: "height 0.4s" }} title={`Receita: ${formatCurrency(m.receita)}`} />
                <div style={{ flex: 1, height: Math.max(m.despesa / maxBar * 100, 2), backgroundColor: m.isCurrent ? "#c04040" : "#f5d0cc", borderRadius: "3px 3px 0 0", transition: "height 0.4s" }} title={`Despesa: ${formatCurrency(m.despesa)}`} />
              </div>
              <span style={{ fontSize: "0.68rem", color: m.isCurrent ? "#b8891a" : "#9a8060", fontWeight: m.isCurrent ? 900 : 600 }}>{m.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(140,100,20,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "#9a8060" }}>
            <div style={{ width: 10, height: 10, backgroundColor: "#b8891a", borderRadius: 2 }} /> Receita
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "#9a8060" }}>
            <div style={{ width: 10, height: 10, backgroundColor: "#c04040", borderRadius: 2 }} /> Despesa
          </div>
          <div style={{ marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700, color: lucroMes >= 0 ? "#1a8a2a" : "#c04040" }}>
            Lucro este mês: {formatCurrency(lucroMes)}
          </div>
        </div>
      </div>

      {/* SEÇÃO: PROJEÇÕES E RECEBIMENTOS */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 900, color: "#b8891a", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>📋 Projeções e Recebimentos</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

        {/* Projeção de caixa */}
        <div style={card()}>
          <h3 style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a1510", marginBottom: "1.25rem" }}>💰 Caderno (A Receber)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div style={{ backgroundColor: "#e8f8e8", borderRadius: "0.75rem", padding: "0.875rem 1rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1a6a2a", marginBottom: "0.2rem" }}>✅ A RECEBER (CADERNO)</p>
              <p style={{ fontSize: "1.35rem", fontWeight: 900, color: "#1a8a2a" }}>{formatCurrency(totalAReceber)}</p>
              {totalVencido > 0 && <p style={{ fontSize: "0.72rem", color: "#c04040", marginTop: "0.2rem" }}>⚠️ {formatCurrency(totalVencido)} em atraso</p>}
            </div>
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6a30b8", marginBottom: "0.5rem" }}>💳 FATURA CARTÃO</p>
              {cartaoProxMeses.map(m => (
                <div key={m.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid rgba(140,100,20,0.06)", fontSize: "0.85rem" }}>
                  <span style={{ color: "#5a4a2a" }}>{m.label}</span>
                  <span style={{ fontWeight: 700, color: m.total > 0 ? "#6a30b8" : "#b8a080" }}>{m.total > 0 ? `-${formatCurrency(m.total)}` : "—"}</span>
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: "#FAF6EE", borderRadius: "0.5rem", padding: "0.75rem", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#5a4a2a" }}>Saldo potencial</span>
              <span style={{ fontSize: "0.9rem", fontWeight: 900, color: totalAReceber - cartaoProxMeses[0].total >= 0 ? "#1a8a2a" : "#c04040" }}>
                {formatCurrency(totalAReceber - cartaoProxMeses[0].total)}
              </span>
            </div>
          </div>
        </div>

        {/* Top Clientes */}
        <div style={card()}>
          <h3 style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a1510", marginBottom: "1.25rem" }}>🏆 Clientes com Maior Gasto</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {topClientsList.slice(0, 8).map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 900, color: i < 3 ? "#b8891a" : "#9a8060", minWidth: 20 }}>#{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1a1510", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                  <p style={{ fontSize: "0.68rem", color: "#9a8060" }}>{c.numPedidos} pedido{c.numPedidos > 1 ? "s" : ""}{c.saldo > 0 ? ` · ${formatCurrency(c.saldo)} em aberto` : ""}</p>
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "#b8891a", whiteSpace: "nowrap" }}>{formatCurrency(c.totalGasto)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEÇÃO: OPERACIONAL */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 900, color: "#b8891a", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>📦 Operacional</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

        {/* Estoque */}
        <div style={card()}>
          <h3 style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a1510", marginBottom: "1.25rem" }}>Saúde do Estoque</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
            {[
              { label: "Valor de venda", value: formatCurrency(valorEstoque), color: "#1a8a2a" },
              { label: "Valor de custo", value: formatCurrency(custoEstoque), color: "#5a4a2a" },
              { label: "Sem estoque", value: produtosZerados.length, warn: produtosZerados.length > 0 },
              { label: "Estoque baixo (≤2)", value: produtosBaixo.length, warn: produtosBaixo.length > 0 },
            ].map(k => (
              <div key={k.label} style={{ backgroundColor: (k as any).warn ? "#fee8e8" : "#FAF6EE", borderRadius: "0.625rem", padding: "0.75rem" }}>
                <p style={{ fontSize: "1.1rem", fontWeight: 900, color: (k as any).warn ? "#c04040" : (k as any).color || "#1a1510" }}>{k.value}</p>
                <p style={{ fontSize: "0.68rem", color: "#9a8060", marginTop: "0.1rem" }}>{k.label}</p>
              </div>
            ))}
          </div>
          {produtosZerados.length > 0 && (
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#c04040", marginBottom: "0.4rem" }}>SEM ESTOQUE:</p>
              {produtosZerados.slice(0, 5).map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", padding: "0.2rem 0", color: "#5a4a2a" }}>
                  <span>{p.sku && <span style={{ color: "#b8891a", fontFamily: "monospace", marginRight: 4 }}>{p.sku}</span>}{p.name}</span>
                </div>
              ))}
              {produtosZerados.length > 5 && <p style={{ fontSize: "0.7rem", color: "#9a8060" }}>+{produtosZerados.length - 5} mais</p>}
            </div>
          )}
        </div>

        {/* Home Try-On */}
        <div style={card()}>
          <h3 style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a1510", marginBottom: "1.25rem" }}>👗 Home Try-On</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div style={{ backgroundColor: "#fce8ff", borderRadius: "0.75rem", padding: "0.875rem 1rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#5a0a7a", marginBottom: "0.2rem" }}>EM ANDAMENTO</p>
              <p style={{ fontSize: "1.5rem", fontWeight: 900, color: "#8a1ab8" }}>{tryOnTotal}</p>
              <p style={{ fontSize: "0.72rem", color: "#9a8060", marginTop: "0.15rem" }}>peças na rua agora</p>
            </div>
            <p style={{ fontSize: "0.78rem", color: "#9a8060", fontStyle: "italic", textAlign: "center", padding: "0.5rem" }}>
              Taxa de conversão disponível após mais registros via sistema
            </p>
            <Link href="/admin/pedidos?status=try-on" style={{ display: "block", textAlign: "center", color: "#8a1ab8", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", padding: "0.5rem", backgroundColor: "#fce8ff", borderRadius: "0.625rem" }}>
              Ver pedidos Try-On →
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard de Vendas */}
      <DashboardVendas />

      {/* Relatório de Clientes */}
      <RelatorioClientes />

    </div>
  );
}
