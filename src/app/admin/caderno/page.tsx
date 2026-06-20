import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function CadernoPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const orders = await prisma.order.findMany({
    where: { paymentStatus: { not: "paid" }, status: { not: "cancelled" } },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  // Agrupar por cliente
  const byUser = new Map<string, {
    user: { id: string; name: string | null; email: string; phone: string | null };
    total: number;
    amountPaid: number;
    count: number;
    lastDate: Date;
  }>();

  for (const o of orders) {
    const existing = byUser.get(o.userId);
    if (existing) {
      existing.total += o.total;
      existing.amountPaid += o.amountPaid;
      existing.count += 1;
      if (new Date(o.createdAt) > existing.lastDate) existing.lastDate = new Date(o.createdAt);
    } else {
      byUser.set(o.userId, {
        user: o.user,
        total: o.total,
        amountPaid: o.amountPaid,
        count: 1,
        lastDate: new Date(o.createdAt),
      });
    }
  }

  const clientes = [...byUser.values()].sort((a, b) => (b.total - b.amountPaid) - (a.total - a.amountPaid));
  const totalGeral = clientes.reduce((s, c) => s + c.total, 0);
  const pagoGeral = clientes.reduce((s, c) => s + c.amountPaid, 0);
  const saldoGeral = totalGeral - pagoGeral;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <a href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</a>
          <h1 style={{ color: "#1a1510", fontSize: "1.75rem", fontWeight: 900, marginTop: "0.2rem" }}>📒 Caderno</h1>
          <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.2rem" }}>Saldo devedor por cliente</p>
        </div>
        <a href="/admin/pedidos/novo" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "0.6rem 1.25rem", borderRadius: "0.75rem", textDecoration: "none" }}>
          + Novo Pedido
        </a>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { emoji: "👥", label: "Clientes no caderno", value: clientes.length },
          { emoji: "🛍️", label: "Compras em aberto", value: orders.length },
          { emoji: "💰", label: "Total comprado", value: formatCurrency(totalGeral) },
          { emoji: "✅", label: "Total recebido", value: formatCurrency(pagoGeral), ok: true },
          { emoji: "📒", label: "Saldo a receber", value: formatCurrency(saldoGeral), warn: saldoGeral > 0 },
        ].map(k => (
          <div key={k.label} style={{ backgroundColor: "#fff", border: `1px solid ${(k as any).warn ? "rgba(184,137,26,0.35)" : "rgba(140,100,20,0.1)"}`, borderRadius: "0.875rem", padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "1.2rem", marginBottom: "0.3rem" }}>{k.emoji}</div>
            <div style={{ color: (k as any).warn ? "#856404" : (k as any).ok ? "#1a8a2a" : "#1a1510", fontSize: "1.35rem", fontWeight: 900 }}>{k.value}</div>
            <div style={{ color: "#9a8060", fontSize: "0.72rem", marginTop: "0.2rem" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      {clientes.length === 0 ? (
        <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "4rem", textAlign: "center", color: "#9a8060", border: "1px solid rgba(140,100,20,0.1)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📒</div>
          <p style={{ fontWeight: 700 }}>Nenhum saldo em aberto no caderno.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#FAF6EE" }}>
                  {["Cliente", "Compras", "Total", "Pago", "Saldo", "Última compra", ""].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0.875rem 1rem", color: "#9a8060", fontWeight: 700, fontSize: "0.75rem", borderBottom: "1px solid rgba(140,100,20,0.1)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientes.map(c => {
                  const saldo = c.total - c.amountPaid;
                  return (
                    <tr key={c.user.id} style={{ borderBottom: "1px solid rgba(140,100,20,0.06)" }}>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ fontWeight: 700, color: "#1a1510" }}>{c.user.name || "—"}</div>
                        {c.user.phone && <div style={{ fontSize: "0.72rem", color: "#9a8060" }}>{c.user.phone}</div>}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#5a4a2a" }}>{c.count}</td>
                      <td style={{ padding: "0.875rem 1rem", color: "#1a1510", fontWeight: 600, whiteSpace: "nowrap" }}>{formatCurrency(c.total)}</td>
                      <td style={{ padding: "0.875rem 1rem", color: "#1a8a2a", fontWeight: 600, whiteSpace: "nowrap" }}>{formatCurrency(c.amountPaid)}</td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <span style={{ backgroundColor: "#fff8e1", color: "#856404", fontWeight: 900, fontSize: "0.875rem", padding: "0.25rem 0.625rem", borderRadius: 999, whiteSpace: "nowrap" }}>
                          {formatCurrency(saldo)}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "#9a8060", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {c.lastDate.toLocaleDateString("pt-BR")}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <Link href={`/admin/caderno/${c.user.id}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", backgroundColor: "#FAF6EE", border: "1px solid rgba(184,137,26,0.3)", color: "#b8891a", fontSize: "0.75rem", fontWeight: 700, padding: "0.35rem 0.75rem", borderRadius: "0.5rem", textDecoration: "none", whiteSpace: "nowrap" }}>
                          Ver detalhes →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
