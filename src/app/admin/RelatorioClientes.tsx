"use client";
import { useEffect, useState } from "react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  age: number | null;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string | null;
  joinedAt: string;
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function RelatorioClientes() {
  const [data, setData] = useState<{ clients: Client[]; total: number; totalRevenue: number; avgSpent: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"spent" | "orders" | "recent">("spent");

  useEffect(() => {
    fetch("/api/admin/relatorio-clientes")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (!data) return <div>Erro ao carregar</div>;

  const sorted = [...data.clients].sort((a, b) => {
    if (sort === "spent") return b.totalSpent - a.totalSpent;
    if (sort === "orders") return b.totalOrders - a.totalOrders;
    return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
  });

  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden", marginBottom: "2rem" }}>
      {/* Header */}
      <div style={{ padding: "1.5rem 1.25rem", backgroundColor: "#FAF6EE", borderBottom: "1px solid rgba(140,100,20,0.1)" }}>
        <h2 style={{ color: "#1a1510", fontWeight: 800, fontSize: "1rem", margin: 0 }}>👥 Relatório de Clientes</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#9a8060", fontWeight: 700 }}>TOTAL DE CLIENTES</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#1a1510" }}>{data.total}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#9a8060", fontWeight: 700 }}>RECEITA TOTAL</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#b8891a" }}>{fmt(data.totalRevenue)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#9a8060", fontWeight: 700 }}>MÉDIA POR CLIENTE</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#1a1510" }}>{fmt(data.avgSpent)}</div>
          </div>
        </div>
      </div>

      {/* Sorter */}
      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(140,100,20,0.05)", display: "flex", gap: "0.5rem" }}>
        {[
          { label: "Maior Gasto", val: "spent" as const },
          { label: "Mais Pedidos", val: "orders" as const },
          { label: "Mais Recente", val: "recent" as const },
        ].map(s => (
          <button key={s.val} onClick={() => setSort(s.val)}
            style={{ padding: "0.5rem 1rem", borderRadius: "0.625rem", border: sort === s.val ? "2px solid #b8891a" : "1px solid #ddd", backgroundColor: sort === s.val ? "rgba(184,137,26,0.1)" : "#fff", color: "#5a4a2a", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#FAF6EE" }}>
              {["Nome", "Email", "Celular", "Idade", "Pedidos", "Gasto Total", "Último Pedido"].map(h => (
                <th key={h} style={{ padding: "0.75rem", textAlign: "left", color: "#9a8060", fontWeight: 700, borderBottom: "1px solid rgba(140,100,20,0.1)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => (
              <tr key={c.id} style={{ borderBottom: "1px solid rgba(140,100,20,0.05)" }}>
                <td style={{ padding: "0.75rem", fontWeight: 600, color: "#1a1510" }}>{c.name}</td>
                <td style={{ padding: "0.75rem", color: "#7a5a10", fontSize: "0.75rem" }}>{c.email}</td>
                <td style={{ padding: "0.75rem", color: "#7a5a10" }}>{c.phone}</td>
                <td style={{ padding: "0.75rem", color: "#9a8060" }}>{c.age ? `${c.age} anos` : "—"}</td>
                <td style={{ padding: "0.75rem", fontWeight: 700, color: "#b8891a" }}>{c.totalOrders}</td>
                <td style={{ padding: "0.75rem", fontWeight: 700, color: "#1a1510" }}>{fmt(c.totalSpent)}</td>
                <td style={{ padding: "0.75rem", fontSize: "0.75rem", color: "#9a8060" }}>
                  {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString("pt-BR") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
