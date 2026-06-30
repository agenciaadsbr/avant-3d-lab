"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ClienteVIP {
  id: string;
  name: string;
  email: string;
  totalGasto: number;
  pedidos: number;
}

interface ClienteInativo {
  id: string;
  name: string;
  email: string;
  ultimaCompra: string | null;
  diasSemComprar: number;
}

interface MargemCategoria {
  categoria: string;
  faturamento: number;
  custo: number;
  lucro: number;
  margem: string;
  produtos: number;
}

interface Data {
  ticketMedio: string;
  previsaoCaixa: {
    caixa: string;
    despesasPorDia: string;
    diasRestantes: string | number;
  };
  cicloMedio: string;
  clientesVIP: ClienteVIP[];
  clientesInativos: ClienteInativo[];
  margensPorCategoria: MargemCategoria[];
}

function fmt(n: number | string) {
  const num = typeof n === "string" ? parseFloat(n) : n;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function MetricasPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/metricas")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FAF6EE" }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(184,137,26,0.2)", borderTopColor: "#b8891a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );

  return (
    <div style={{ backgroundColor: "#FAF6EE", minHeight: "100vh", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>
          ← Admin
        </Link>
        <h1 style={{ color: "#1a1510", fontSize: "2rem", fontWeight: 900, marginTop: "0.5rem" }}>📊 Métricas de Negócio</h1>

        {data && (
          <>
            {/* KPIs Principais */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "1.5rem", marginBottom: "2rem" }}>
              <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(140,100,20,0.1)" }}>
                <p style={{ color: "#9a8060", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Ticket Médio</p>
                <p style={{ fontSize: "1.75rem", fontWeight: 900, color: "#b8891a", marginTop: "0.5rem" }}>{fmt(data.ticketMedio)}</p>
              </div>
              <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(140,100,20,0.1)" }}>
                <p style={{ color: "#9a8060", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Ciclo de Caixa</p>
                <p style={{ fontSize: "1.75rem", fontWeight: 900, color: "#2196f3", marginTop: "0.5rem" }}>{data.cicloMedio} dias</p>
              </div>
              <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(140,100,20,0.1)" }}>
                <p style={{ color: "#9a8060", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Previsão Caixa</p>
                <p style={{ fontSize: "1.75rem", fontWeight: 900, color: data.previsaoCaixa.diasRestantes === "∞" ? "#4caf50" : (typeof data.previsaoCaixa.diasRestantes === "number" ? data.previsaoCaixa.diasRestantes : parseInt(String(data.previsaoCaixa.diasRestantes))) < 30 ? "#ff9800" : "#4caf50", marginTop: "0.5rem" }}>
                  {data.previsaoCaixa.diasRestantes} dias
                </p>
              </div>
            </div>

            {/* Seção de Clientes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
              {/* VIPs */}
              <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", overflow: "hidden" }}>
                <div style={{ padding: "1.25rem 1.75rem", borderBottom: "1px solid rgba(140,100,20,0.1)", backgroundColor: "#fef9f0" }}>
                  <h3 style={{ color: "#1a1510", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>👑 Clientes VIP (Top 5)</h3>
                </div>
                <div style={{ padding: "1.25rem 1.75rem" }}>
                  {data.clientesVIP.length === 0 ? (
                    <p style={{ color: "#9a8060", fontSize: "0.9rem", margin: 0 }}>Nenhum cliente VIP ainda.</p>
                  ) : (
                    data.clientesVIP.map((c, i) => (
                      <div key={c.id} style={{ paddingBottom: "1rem", borderBottom: i < data.clientesVIP.length - 1 ? "1px solid rgba(140,100,20,0.05)" : "none", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.4rem" }}>
                          <div>
                            <p style={{ fontWeight: 700, color: "#1a1510", fontSize: "0.9rem", margin: 0 }}>{c.name}</p>
                            <p style={{ fontSize: "0.75rem", color: "#9a8060", margin: "0.2rem 0 0 0" }}>{c.email}</p>
                          </div>
                          <p style={{ fontWeight: 700, color: "#b8891a", fontSize: "1rem", margin: 0 }}>{fmt(c.totalGasto)}</p>
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "#6a4a10", margin: 0 }}>📦 {c.pedidos} pedido(s)</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Inativos */}
              <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", overflow: "hidden" }}>
                <div style={{ padding: "1.25rem 1.75rem", borderBottom: "1px solid rgba(140,100,20,0.1)", backgroundColor: "#f5f5f5" }}>
                  <h3 style={{ color: "#1a1510", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>😴 Clientes Inativos (&gt; 60 dias)</h3>
                </div>
                <div style={{ padding: "1.25rem 1.75rem" }}>
                  {data.clientesInativos.length === 0 ? (
                    <p style={{ color: "#9a8060", fontSize: "0.9rem", margin: 0 }}>Ótimo! Nenhum cliente inativo.</p>
                  ) : (
                    data.clientesInativos.map((c, i) => (
                      <div key={c.id} style={{ paddingBottom: "1rem", borderBottom: i < data.clientesInativos.length - 1 ? "1px solid rgba(140,100,20,0.05)" : "none", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.4rem" }}>
                          <div>
                            <p style={{ fontWeight: 700, color: "#1a1510", fontSize: "0.9rem", margin: 0 }}>{c.name}</p>
                            <p style={{ fontSize: "0.75rem", color: "#9a8060", margin: "0.2rem 0 0 0" }}>{c.email}</p>
                          </div>
                          <p style={{ fontWeight: 700, color: "#c04040", fontSize: "0.9rem", margin: 0 }}>{c.diasSemComprar}d</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Margens por Categoria */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", overflow: "hidden" }}>
              <div style={{ padding: "1.25rem 1.75rem", borderBottom: "1px solid rgba(140,100,20,0.1)" }}>
                <h3 style={{ color: "#1a1510", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>📈 Margens por Categoria</h3>
              </div>
              <div style={{ overflow: "x" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f0e8ff" }}>
                      {["Categoria", "Faturamento", "Custo", "Lucro", "Margem", "Produtos"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#6a30b8", fontWeight: 700, fontSize: "0.75rem", borderBottom: "1px solid rgba(140,100,20,0.1)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.margensPorCategoria.map((cat, i) => (
                      <tr key={cat.categoria} style={{ borderBottom: i < data.margensPorCategoria.length - 1 ? "1px solid rgba(140,100,20,0.05)" : "none" }}>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#1a1510" }}>{cat.categoria}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#1a1510" }}>{fmt(cat.faturamento)}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#9a8060" }}>{fmt(cat.custo)}</td>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#2e7d32" }}>{fmt(cat.lucro)}</td>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#b8891a", fontSize: "1rem" }}>{cat.margem}%</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#6a4a10" }}>{cat.produtos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Links úteis */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginTop: "2rem" }}>
              <Link href="/admin/devolucoes" style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1rem", textDecoration: "none", color: "#1a1510", textAlign: "center", fontWeight: 700, transition: "all 0.2s" }}>
                📦 Devoluções
              </Link>
              <Link href="/admin/analytics" style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1rem", textDecoration: "none", color: "#1a1510", textAlign: "center", fontWeight: 700, transition: "all 0.2s" }}>
                📊 Analytics
              </Link>
              <Link href="/admin/financeiro" style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1rem", textDecoration: "none", color: "#1a1510", textAlign: "center", fontWeight: 700, transition: "all 0.2s" }}>
                💰 Financeiro
              </Link>
              <Link href="/admin/giro-estoque" style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1rem", textDecoration: "none", color: "#1a1510", textAlign: "center", fontWeight: 700, transition: "all 0.2s" }}>
                🔄 Giro Estoque
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
