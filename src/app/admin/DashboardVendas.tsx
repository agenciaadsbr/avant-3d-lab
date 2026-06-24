"use client";
import { useEffect, useState } from "react";

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DashboardVendas() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard-vendas")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (!data) return <div>Erro ao carregar</div>;

  const maxRevenue = Math.max(...data.months.map((m: any) => m.revenue));
  const maxCatRevenue = Math.max(...data.byCategory.map((c: any) => c.revenue));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>

      {/* Vendas por Mês */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.5rem 1.25rem", overflow: "hidden" }}>
        <h3 style={{ color: "#1a1510", fontWeight: 800, fontSize: "1rem", margin: "0 0 1.25rem" }}>📈 Vendas Últimos 12 Meses</h3>
        <div style={{ display: "flex", gap: "0.3rem", alignItems: "flex-end", height: 200, marginBottom: "1rem" }}>
          {data.months.map((m: any, i: number) => (
            <div key={m.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "0.25rem" }}>
              <div style={{
                width: "100%",
                height: `${(m.revenue / maxRevenue) * 180}px`,
                backgroundColor: m.revenue > 0 ? "#b8891a" : "#e0d0b0",
                borderRadius: "0.25rem 0.25rem 0 0",
                minHeight: m.revenue > 0 ? 4 : 2,
              }} title={`${m.label}: ${fmt(m.revenue)}`} />
              <span style={{ fontSize: "0.6rem", color: "#9a8060", whiteSpace: "nowrap" }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Por Categoria */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.5rem 1.25rem" }}>
        <h3 style={{ color: "#1a1510", fontWeight: 800, fontSize: "1rem", margin: "0 0 1.25rem" }}>🏷️ Vendas por Categoria</h3>
        {data.byCategory.slice(0, 5).map((c: any, i: number) => (
          <div key={c.name} style={{ marginBottom: "0.875rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span style={{ fontWeight: 600, color: "#1a1510", fontSize: "0.85rem" }}>{c.name}</span>
              <span style={{ fontWeight: 700, color: "#b8891a", fontSize: "0.85rem" }}>{fmt(c.revenue)}</span>
            </div>
            <div style={{ width: "100%", height: 8, backgroundColor: "#f0e8d0", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", backgroundColor: "#b8891a", width: `${(c.revenue / maxCatRevenue) * 100}%` }} />
            </div>
            <span style={{ fontSize: "0.7rem", color: "#9a8060" }}>({c.quantity} unidades)</span>
          </div>
        ))}
      </div>

      {/* Produtos Top */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.5rem 1.25rem", gridColumn: "1 / -1" }}>
        <h3 style={{ color: "#1a1510", fontWeight: 800, fontSize: "1rem", margin: "0 0 1.25rem" }}>⭐ Top 10 Produtos Mais Vendidos</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(140,100,20,0.1)" }}>
                <th style={{ padding: "0.75rem", textAlign: "left", color: "#9a8060", fontWeight: 700 }}>Produto</th>
                <th style={{ padding: "0.75rem", textAlign: "right", color: "#9a8060", fontWeight: 700 }}>Quantidade</th>
                <th style={{ padding: "0.75rem", textAlign: "right", color: "#9a8060", fontWeight: 700 }}>Receita</th>
              </tr>
            </thead>
            <tbody>
              {data.byProduct.map((p: any) => (
                <tr key={p.name} style={{ borderBottom: "1px solid rgba(140,100,20,0.05)" }}>
                  <td style={{ padding: "0.75rem", fontWeight: 600, color: "#1a1510" }}>{p.name}</td>
                  <td style={{ padding: "0.75rem", textAlign: "right", color: "#9a8060" }}>{p.quantity}</td>
                  <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 700, color: "#b8891a" }}>{fmt(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
