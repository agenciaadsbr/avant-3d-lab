import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export default async function RelatoriosPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const now = new Date();
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const start6Months   = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    salesByMonth, expensesByMonth,
    ordersByMethod, ordersByStatus,
    allOrdersForClients,
    products,
    newClientsThisMonth, newClientsLastMonth,
    tryOnOrders,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { status: { not: "cancelled" }, createdAt: { gte: start6Months } },
      select: { total: true, amountPaid: true, createdAt: true, paymentStatus: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: start6Months } },
      select: { amount: true, date: true, category: true },
    }),
    // Receita por forma de pagamento
    prisma.order.groupBy({
      by: ["paymentMethod"],
      where: { status: { not: "cancelled" } },
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: "desc" } },
    }),
    // Pedidos por status (geral)
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    // Todos os pedidos para análise de clientes
    prisma.order.findMany({
      where: { status: { not: "cancelled" } },
      select: { userId: true, total: true, createdAt: true },
    }),
    // Produtos para estoque
    prisma.product.findMany({
      where: { active: true, NOT: { slug: "venda-manual" } },
      select: { id: true, name: true, sku: true, stock: true, price: true, costPrice: true, category: { select: { name: true } } },
      orderBy: { stock: "asc" },
    }),
    prisma.user.count({ where: { role: "customer", createdAt: { gte: startThisMonth } } }),
    prisma.user.count({ where: { role: "customer", createdAt: { gte: startLastMonth, lte: endLastMonth } } }),
    // Home Try-On
    prisma.order.findMany({
      where: { status: { in: ["try-on", "delivered", "cancelled"] }, createdAt: { gte: start6Months } },
      select: { status: true, total: true, createdAt: true },
    }),
  ]);

  // Mensais
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const m = d.getMonth(); const y = d.getFullYear();
    const receita = salesByMonth.filter(o => { const od = new Date(o.createdAt); return od.getMonth() === m && od.getFullYear() === y; }).reduce((s, o) => s + o.total, 0);
    const despesa = expensesByMonth.filter(e => { const ed = new Date(e.date); return ed.getMonth() === m && ed.getFullYear() === y; }).reduce((s, e) => s + e.amount, 0);
    return { label: MONTHS_PT[m], receita, despesa, lucro: receita - despesa, isCurrent: i === 5 };
  });

  const receitaMes    = monthlyData[5].receita;
  const receitaAnterior = monthlyData[4].receita;
  const lucroMes      = monthlyData[5].lucro;
  const despesaMes    = monthlyData[5].despesa;
  const varReceita    = receitaAnterior > 0 ? ((receitaMes - receitaAnterior) / receitaAnterior) * 100 : 0;
  const maxBar        = Math.max(...monthlyData.map(m => Math.max(m.receita, m.despesa)), 1);

  // Estoque
  const produtosZerados = products.filter(p => p.stock === 0);
  const produtosBaixo   = products.filter(p => p.stock > 0 && p.stock <= 2);
  const valorEstoque    = products.reduce((s, p) => s + p.price * p.stock, 0);
  const custoEstoque    = products.reduce((s, p) => s + (p.costPrice || 0) * p.stock, 0);

  // ── TAXAS DE CONVERSÃO ──

  // 1. Home Try-On
  const tryOnEmAndamento = tryOnOrders.filter(o => o.status === "try-on").length;
  const tryOnConfirmado  = tryOnOrders.filter(o => o.status === "delivered").length;
  const tryOnDevolvido   = tryOnOrders.filter(o => o.status === "cancelled").length;
  const tryOnTotal       = tryOnConfirmado + tryOnDevolvido;
  const taxaConversaoTryOn = tryOnTotal > 0 ? Math.round((tryOnConfirmado / tryOnTotal) * 100) : null;
  const receitaTryOn     = tryOnOrders.filter(o => o.status === "delivered").reduce((s, o) => s + o.total, 0);

  // 2. Recompra de clientes
  const clientesCounts: Record<string, number> = {};
  allOrdersForClients.forEach(o => { clientesCounts[o.userId] = (clientesCounts[o.userId] || 0) + 1; });
  const totalClientes   = Object.keys(clientesCounts).length;
  const clientesRepeat  = Object.values(clientesCounts).filter(c => c > 1).length;
  const taxaRecompra    = totalClientes > 0 ? Math.round((clientesRepeat / totalClientes) * 100) : 0;
  const ticketMedio     = allOrdersForClients.length > 0 ? allOrdersForClients.reduce((s, o) => s + o.total, 0) / allOrdersForClients.length : 0;

  // 3. Por forma de pagamento
  const totalGeralMetodos = ordersByMethod.reduce((s, m) => s + (m._sum.total || 0), 0);
  const PAY_LABEL: Record<string, string> = { pix: "Pix", cartao: "Cartão", dinheiro: "Dinheiro", link: "Link", caderno: "Caderno" };
  const PAY_COLOR: Record<string, string> = { pix: "#1a6a9a", cartao: "#6a30b8", dinheiro: "#1a8a2a", link: "#8a1ab8", caderno: "#856404" };

  // 4. Eficiência mensal
  const mesesComVenda = monthlyData.filter(m => m.receita > 0).length;
  const melhorMes     = monthlyData.reduce((best, m) => m.receita > best.receita ? m : best, monthlyData[0]);

  const card = (style?: object) => ({ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", ...style });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.25rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#1a1510" }}>📊 Relatórios</h1>
        <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.2rem" }}>Análise financeira e taxa de conversão</p>
      </div>

      {/* ── FATURAMENTO ── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#b8891a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>💰 Faturamento</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
          {[
            { emoji: "💵", label: "Receita este mês", value: formatCurrency(receitaMes), sub: `${varReceita >= 0 ? "▲" : "▼"} ${Math.abs(varReceita).toFixed(0)}% vs mês anterior`, subOk: varReceita >= 0 },
            { emoji: "💸", label: "Despesas este mês", value: formatCurrency(despesaMes), sub: "todas as categorias" },
            { emoji: "📈", label: "Lucro este mês", value: formatCurrency(lucroMes), sub: receitaMes > 0 ? `${((lucroMes / receitaMes) * 100).toFixed(1)}% de margem` : "—", subOk: lucroMes >= 0 },
            { emoji: "🎯", label: "Ticket médio", value: formatCurrency(ticketMedio), sub: `${allOrdersForClients.length} pedidos no total` },
            { emoji: "👥", label: "Novos clientes", value: newClientsThisMonth, sub: `${newClientsLastMonth} mês anterior`, subOk: newClientsThisMonth >= newClientsLastMonth },
          ].map(k => (
            <div key={k.label} style={card()}>
              <div style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>{k.emoji}</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#1a1510" }}>{k.value}</div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9a8060", marginTop: "0.2rem" }}>{k.label}</div>
              {k.sub && <div style={{ fontSize: "0.65rem", color: (k as any).subOk === false ? "#c04040" : (k as any).subOk ? "#1a8a2a" : "#b8a080", marginTop: "0.1rem" }}>{k.sub}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── GRÁFICO 6 MESES ── */}
      <div style={{ ...card(), marginBottom: "1.5rem" }}>
        <h3 style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a1510", marginBottom: "1.5rem" }}>Receita × Despesa — últimos 6 meses</h3>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", height: 140 }}>
          {monthlyData.map((m, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
              <div style={{ width: "100%", display: "flex", gap: "2px", alignItems: "flex-end", height: 110 }}>
                <div style={{ flex: 1, height: Math.max(m.receita / maxBar * 100, 2), backgroundColor: m.isCurrent ? "#b8891a" : "#e8d9b0", borderRadius: "3px 3px 0 0" }} title={`Receita: ${formatCurrency(m.receita)}`} />
                <div style={{ flex: 1, height: Math.max(m.despesa / maxBar * 100, 2), backgroundColor: m.isCurrent ? "#c04040" : "#f5d0cc", borderRadius: "3px 3px 0 0" }} title={`Despesa: ${formatCurrency(m.despesa)}`} />
              </div>
              <span style={{ fontSize: "0.68rem", color: m.isCurrent ? "#b8891a" : "#9a8060", fontWeight: m.isCurrent ? 900 : 600 }}>{m.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(140,100,20,0.08)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "#9a8060" }}><div style={{ width: 10, height: 10, backgroundColor: "#b8891a", borderRadius: 2 }} /> Receita</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "#9a8060" }}><div style={{ width: 10, height: 10, backgroundColor: "#c04040", borderRadius: 2 }} /> Despesa</div>
          <div style={{ marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700, color: lucroMes >= 0 ? "#1a8a2a" : "#c04040" }}>Lucro este mês: {formatCurrency(lucroMes)}</div>
          {melhorMes.receita > 0 && <div style={{ fontSize: "0.75rem", color: "#9a8060" }}>Melhor mês: <strong>{melhorMes.label}</strong> ({formatCurrency(melhorMes.receita)})</div>}
        </div>
      </div>

      {/* ── TAXAS DE CONVERSÃO ── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#b8891a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>📊 Taxas de Conversão</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

          {/* Home Try-On */}
          <div style={card()}>
            <h3 style={{ fontWeight: 800, fontSize: "0.875rem", color: "#1a1510", marginBottom: "1rem" }}>👗 Home Try-On</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
              {[
                { label: "Em andamento", value: tryOnEmAndamento, color: "#8a1ab8", bg: "#fce8ff" },
                { label: "Confirmados", value: tryOnConfirmado, color: "#1a8a2a", bg: "#e8f8e8" },
                { label: "Devolvidos", value: tryOnDevolvido, color: "#c04040", bg: "#fee8e8" },
              ].map(k => (
                <div key={k.label} style={{ backgroundColor: k.bg, borderRadius: "0.625rem", padding: "0.625rem", textAlign: "center" }}>
                  <p style={{ fontSize: "1.3rem", fontWeight: 900, color: k.color }}>{k.value}</p>
                  <p style={{ fontSize: "0.65rem", color: "#9a8060", marginTop: "0.1rem" }}>{k.label}</p>
                </div>
              ))}
            </div>
            {taxaConversaoTryOn !== null ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "#5a4a2a" }}>Taxa de conversão</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 900, color: taxaConversaoTryOn >= 70 ? "#1a8a2a" : taxaConversaoTryOn >= 50 ? "#b8891a" : "#c04040" }}>{taxaConversaoTryOn}%</span>
                </div>
                <div style={{ height: 10, backgroundColor: "#f0e8d0", borderRadius: 999, marginBottom: "0.5rem" }}>
                  <div style={{ height: "100%", width: `${taxaConversaoTryOn}%`, backgroundColor: taxaConversaoTryOn >= 70 ? "#1a8a2a" : taxaConversaoTryOn >= 50 ? "#b8891a" : "#c04040", borderRadius: 999 }} />
                </div>
                <p style={{ fontSize: "0.72rem", color: "#9a8060" }}>Receita gerada: <strong>{formatCurrency(receitaTryOn)}</strong></p>
              </div>
            ) : (
              <p style={{ fontSize: "0.78rem", color: "#b8a080", fontStyle: "italic" }}>Dados insuficientes — registre Try-Ons pelo sistema para calcular.</p>
            )}
            <Link href="/admin/pedidos?status=try-on" style={{ display: "block", textAlign: "center", marginTop: "0.75rem", fontSize: "0.78rem", color: "#8a1ab8", fontWeight: 700, textDecoration: "none" }}>Ver pedidos Try-On →</Link>
          </div>

          {/* Recompra */}
          <div style={card()}>
            <h3 style={{ fontWeight: 800, fontSize: "0.875rem", color: "#1a1510", marginBottom: "1rem" }}>🔁 Taxa de Recompra</h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", color: "#5a4a2a" }}>Clientes que voltaram</span>
              <span style={{ fontSize: "1.1rem", fontWeight: 900, color: taxaRecompra >= 50 ? "#1a8a2a" : "#b8891a" }}>{taxaRecompra}%</span>
            </div>
            <div style={{ height: 12, backgroundColor: "#f0e8d0", borderRadius: 999, marginBottom: "1rem" }}>
              <div style={{ height: "100%", width: `${taxaRecompra}%`, backgroundColor: taxaRecompra >= 50 ? "#1a8a2a" : "#b8891a", borderRadius: 999 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              {[
                { label: "Total clientes", value: totalClientes },
                { label: "Compraram 2x+", value: clientesRepeat },
                { label: "Ticket médio", value: formatCurrency(ticketMedio) },
                { label: "Meses ativos", value: `${mesesComVenda}/6` },
              ].map(k => (
                <div key={k.label} style={{ backgroundColor: "#FAF6EE", borderRadius: "0.5rem", padding: "0.5rem 0.75rem" }}>
                  <p style={{ fontSize: "0.95rem", fontWeight: 900, color: "#1a1510" }}>{k.value}</p>
                  <p style={{ fontSize: "0.65rem", color: "#9a8060" }}>{k.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Por forma de pagamento */}
      <div style={{ ...card(), marginBottom: "1.5rem" }}>
        <h3 style={{ fontWeight: 800, fontSize: "0.875rem", color: "#1a1510", marginBottom: "1.25rem" }}>💳 Receita por Forma de Pagamento</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {ordersByMethod.map(m => {
            const pct = totalGeralMetodos > 0 ? Math.round(((m._sum.total || 0) / totalGeralMetodos) * 100) : 0;
            return (
              <div key={m.paymentMethod}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.82rem", color: "#5a4a2a", fontWeight: 600 }}>{PAY_LABEL[m.paymentMethod] || m.paymentMethod}</span>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a1510" }}>{formatCurrency(m._sum.total || 0)}</span>
                    <span style={{ fontSize: "0.72rem", color: "#9a8060", marginLeft: "0.5rem" }}>{pct}% · {m._count.id} pedido{m._count.id !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div style={{ height: 8, backgroundColor: "#f0e8d0", borderRadius: 999 }}>
                  <div style={{ height: "100%", width: `${pct}%`, backgroundColor: PAY_COLOR[m.paymentMethod] || "#b8891a", borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ESTOQUE ── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#b8891a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>📦 Estoque</h2>
        <div style={card()}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: produtosZerados.length > 0 ? "1rem" : 0 }}>
            {[
              { label: "Valor de venda", value: formatCurrency(valorEstoque), color: "#1a8a2a" },
              { label: "Valor de custo", value: formatCurrency(custoEstoque), color: "#5a4a2a" },
              { label: "Margem potencial", value: custoEstoque > 0 ? `${(((valorEstoque - custoEstoque) / valorEstoque) * 100).toFixed(1)}%` : "—", color: "#b8891a" },
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
              {produtosZerados.slice(0, 6).map(p => (
                <div key={p.id} style={{ fontSize: "0.78rem", padding: "0.2rem 0", color: "#5a4a2a", borderBottom: "1px solid rgba(140,100,20,0.05)" }}>
                  {p.sku && <span style={{ color: "#b8891a", fontFamily: "monospace", marginRight: 6 }}>{p.sku}</span>}{p.name}
                </div>
              ))}
              {produtosZerados.length > 6 && <p style={{ fontSize: "0.7rem", color: "#9a8060", marginTop: "0.3rem" }}>+{produtosZerados.length - 6} mais → <Link href="/admin/produtos" style={{ color: "#b8891a" }}>ver todos</Link></p>}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
