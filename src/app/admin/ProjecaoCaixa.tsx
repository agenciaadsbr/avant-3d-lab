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

interface Pedido {
  id: string;
  clientName: string;
  total: number;
  amountPaid: number;
  dueDate: string;
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProjecaoCaixa() {
  const [months, setMonths] = useState<Month[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [pedidosModal, setPedidosModal] = useState<Pedido[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    fetch("/api/admin/projecao-caixa")
      .then(r => r.json())
      .then(d => { setMonths(d.months); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSelectMonth = async (month: string) => {
    setSelectedMonth(month);
    setLoadingModal(true);
    const res = await fetch(`/api/admin/projecao-caixa/pedidos?month=${month}`);
    if (res.ok) {
      const data = await res.json();
      setPedidosModal(data.pedidos);
    }
    setLoadingModal(false);
  };

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
                <tr key={m.month} onClick={() => m.total > 0 && handleSelectMonth(m.month)} style={{ borderBottom: "1px solid rgba(140,100,20,0.05)", backgroundColor: m.total > 0 ? "rgba(184,137,26,0.04)" : "transparent", cursor: m.total > 0 ? "pointer" : "default" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: m.total > 0 ? "#b8891a" : "#1a1510" }}>{m.label}</td>
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

      {/* Modal de Detalhes */}
      {selectedMonth && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "2rem", maxWidth: "500px", width: "90%", maxHeight: "70vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#1a1510", fontWeight: 900, fontSize: "1.2rem", margin: 0 }}>
                {months.find(m => m.month === selectedMonth)?.label}
              </h3>
              <button onClick={() => setSelectedMonth(null)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#9a8060" }}>×</button>
            </div>

            {loadingModal ? (
              <p style={{ color: "#9a8060", textAlign: "center" }}>Carregando...</p>
            ) : pedidosModal.length === 0 ? (
              <p style={{ color: "#9a8060", textAlign: "center" }}>Nenhum pedido neste mês</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {pedidosModal.map(p => (
                  <div key={p.id} style={{ backgroundColor: "#FAF6EE", padding: "1rem", borderRadius: "0.75rem", borderLeft: "4px solid #b8891a" }}>
                    <div style={{ fontWeight: 700, color: "#1a1510", marginBottom: "0.3rem" }}>{p.clientName}</div>
                    <div style={{ fontSize: "0.85rem", color: "#9a8060", marginBottom: "0.5rem" }}>Pedido: {p.id.slice(0, 8)}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontWeight: 600 }}>
                      <span style={{ color: "#5a4a2a" }}>Total: {fmt(p.total)}</span>
                      <span style={{ color: "#5a4a2a" }}>Pago: {fmt(p.amountPaid)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontWeight: 700 }}>
                      <span style={{ color: "#1a1510" }}>Saldo:</span>
                      <span style={{ color: "#b8891a" }}>{fmt(p.total - p.amountPaid)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
