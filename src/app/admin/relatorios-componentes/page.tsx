"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ComponentSale {
  componentName: string;
  productName: string;
  quantity: number;
  revenue: number;
  orders: number;
}

interface ReportData {
  componentSales: ComponentSale[];
  totalRevenue: number;
  totalQuantity: number;
}

export default function RelatoriosComponentesPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/relatorios/componentes")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FAF6EE" }}>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(184,137,26,0.2)", borderTopColor: "#b8891a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ backgroundColor: "#FAF6EE", minHeight: "100vh", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</Link>
          <h1 style={{ color: "#1a1510", fontSize: "2rem", fontWeight: 900, marginTop: "0.5rem" }}>📊 Relatórios de Componentes</h1>
          <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.5rem" }}>Acompanhe as vendas de cada peça dos conjuntos</p>
        </div>

        {!data || data.componentSales.length === 0 ? (
          <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "2rem", textAlign: "center", color: "#9a8060" }}>
            Nenhuma venda de componentes ainda
          </div>
        ) : (
          <>
            {/* Resumo */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(140,100,20,0.1)" }}>
                <p style={{ color: "#9a8060", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>Receita Total</p>
                <p style={{ fontSize: "1.75rem", fontWeight: 900, color: "#b8891a", marginTop: "0.5rem" }}>
                  R$ {(data.totalRevenue || 0).toFixed(2)}
                </p>
              </div>
              <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(140,100,20,0.1)" }}>
                <p style={{ color: "#9a8060", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>Peças Vendidas</p>
                <p style={{ fontSize: "1.75rem", fontWeight: 900, color: "#b8891a", marginTop: "0.5rem" }}>
                  {data.totalQuantity || 0}
                </p>
              </div>
              <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(140,100,20,0.1)" }}>
                <p style={{ color: "#9a8060", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>Componentes Únicos</p>
                <p style={{ fontSize: "1.75rem", fontWeight: 900, color: "#b8891a", marginTop: "0.5rem" }}>
                  {data.componentSales.length}
                </p>
              </div>
            </div>

            {/* Tabela */}
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", overflow: "hidden" }}>
              <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(140,100,20,0.1)", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "1rem", fontWeight: 700, color: "#5a4a2a", fontSize: "0.8rem", textTransform: "uppercase" }}>
                <div>Componente</div>
                <div style={{ textAlign: "right" }}>Peças</div>
                <div style={{ textAlign: "right" }}>Pedidos</div>
                <div style={{ textAlign: "right" }}>Faturamento</div>
                <div style={{ textAlign: "right" }}>Ticket Médio</div>
              </div>
              {data.componentSales.map((sale, i) => (
                <div key={i} style={{ padding: "1rem 1.5rem", borderBottom: i < data.componentSales.length - 1 ? "1px solid rgba(140,100,20,0.05)" : "none", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "1rem", alignItems: "center" }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "#1a1510", fontSize: "0.9rem" }}>{sale.componentName}</p>
                    <p style={{ fontSize: "0.75rem", color: "#9a8060", marginTop: "0.2rem" }}>{sale.productName}</p>
                  </div>
                  <div style={{ textAlign: "right", fontWeight: 700, color: "#1a1510" }}>{sale.quantity}</div>
                  <div style={{ textAlign: "right", fontWeight: 700, color: "#1a1510" }}>{sale.orders}</div>
                  <div style={{ textAlign: "right", fontWeight: 700, color: "#b8891a" }}>R$ {(sale.revenue || 0).toFixed(2)}</div>
                  <div style={{ textAlign: "right", fontSize: "0.9rem", color: "#9a8060" }}>R$ {((sale.revenue || 0) / (sale.orders || 1)).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
