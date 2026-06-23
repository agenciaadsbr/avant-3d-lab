"use client";
import { useEffect, useState } from "react";

interface Month {
  month: string;
  label: string;
  total: number;
  caderno: number;
  pix: number;
  cartao: number;
  count: number;
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProjecaoCaixa() {
  const [months, setMonths] = useState<Month[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/projecao-caixa")
      .then(r => r.json())
      .then(d => { setMonths(d.months); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando...</div>;

  const comRecebimento = months.filter(m => m.total > 0);

  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden", marginBottom: "2rem" }}>
      <div style={{ padding: "1rem 1.25rem", backgroundColor: "#FAF6EE", borderBottom: "1px solid rgba(140,100,20,0.08)" }}>
        <h2 style={{ color: "#1a1510", fontWeight: 800, fontSize: "0.95rem", margin: 0 }}>📊 Projeção de Fluxo de Caixa</h2>
        <p style={{ color: "#9a8060", fontSize: "0.75rem", margin: "0.3rem 0 0" }}>Próximos 12 meses (Caderno + Pix + Cartão)</p>
      </div>

      {comRecebimento.length === 0 ? (
        <div style={{ padding: "2rem 1.25rem", textAlign: "center", color: "#9a8060" }}>
          Sem pagamentos agendados nos próximos 12 meses
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#FAF6EE", borderBottom: "1px solid rgba(140,100,20,0.1)" }}>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 700, color: "#5a4a2a" }}>Mês</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 700, color: "#5a4a2a" }}>Total</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 700, color: "#5a4a2a" }}>📒 Caderno</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 700, color: "#5a4a2a" }}>Pix</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 700, color: "#5a4a2a" }}>💳 Cartão</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: 700, color: "#5a4a2a" }}>Qtd</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m, idx) => (
                <tr key={m.month} style={{ borderBottom: "1px solid rgba(140,100,20,0.05)", backgroundColor: m.total > 0 ? "rgba(184,137,26,0.04)" : "transparent" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#1a1510" }}>{m.label}</td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 700, color: m.total > 0 ? "#b8891a" : "#9a8060" }}>
                    {fmt(m.total)}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: m.caderno > 0 ? "#1a1510" : "#d0d0d0", fontWeight: m.caderno > 0 ? 600 : 400 }}>
                    {m.caderno > 0 ? fmt(m.caderno) : "—"}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: m.pix > 0 ? "#1a1510" : "#d0d0d0", fontWeight: m.pix > 0 ? 600 : 400 }}>
                    {m.pix > 0 ? fmt(m.pix) : "—"}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: m.cartao > 0 ? "#1a1510" : "#d0d0d0", fontWeight: m.cartao > 0 ? 600 : 400 }}>
                    {m.cartao > 0 ? fmt(m.cartao) : "—"}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", color: "#9a8060", fontSize: "0.75rem" }}>
                    {m.count > 0 ? m.count : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
