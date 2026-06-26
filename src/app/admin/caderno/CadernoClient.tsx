"use client";
import { useState, useMemo } from "react";

type ClientData = {
  userId: string;
  client: { id: string; name: string | null; email: string };
  totalDevido: number;
  pedidosCount: number;
};

type Pedido = {
  id: string;
  total: number;
  dueDate: string | null;
};

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CadernoClient({ clientsData }: { clientsData: ClientData[] }) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [parcelas, setParcelas] = useState("3");
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [consolidando, setConsolidando] = useState(false);

  const selectedClient = clientsData.find(c => c.userId === selectedClientId);

  const loadClientPedidos = async (clientId: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/caderno/pedidos?clientId=${clientId}`);
    if (res.ok) {
      const data = await res.json();
      setPedidos(data.pedidos);
    }
    setLoading(false);
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    loadClientPedidos(clientId);
  };

  const totalDevido = pedidos.reduce((s, p) => s + p.total, 0);
  const numParcelas = parseInt(parcelas) || 1;
  const valorParcela = totalDevido / numParcelas;

  const projecao = Array.from({ length: numParcelas }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + i + 1);
    const mes = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    const isLast = i === numParcelas - 1;
    const valor = isLast ? totalDevido - valorParcela * (numParcelas - 1) : valorParcela;
    return { mes, valor, mes_key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` };
  });

  const handleConsolidar = async () => {
    if (!selectedClientId) return;
    setConsolidando(true);
    const res = await fetch(`/api/admin/caderno/consolidar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClientId, parcelas: numParcelas }),
    });
    if (res.ok) {
      alert("✅ Pagamentos consolidados!");
      loadClientPedidos(selectedClientId);
    } else {
      alert("❌ Erro ao consolidar");
    }
    setConsolidando(false);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {clientsData.map(c => (
          <div key={c.userId} onClick={() => handleSelectClient(c.userId)} style={{ backgroundColor: selectedClientId === c.userId ? "#b8891a" : "#fff", border: `2px solid ${selectedClientId === c.userId ? "#b8891a" : "rgba(140,100,20,0.1)"}`, borderRadius: "1rem", padding: "1.25rem", cursor: "pointer", transition: "all 0.3s" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: selectedClientId === c.userId ? "#fff" : "#1a1510", marginBottom: "0.5rem" }}>{c.client.name || "—"}</div>
            <div style={{ color: selectedClientId === c.userId ? "rgba(255,255,255,0.8)" : "#9a8060", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{c.pedidosCount} pedido{c.pedidosCount > 1 ? "s" : ""}</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 900, color: selectedClientId === c.userId ? "#fff" : "#b8891a" }}>{fmt(c.totalDevido)}</div>
          </div>
        ))}
      </div>

      {selectedClient && (
        <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "2rem", border: "1px solid rgba(140,100,20,0.1)" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#1a1510", marginBottom: "1.5rem" }}>📋 {selectedClient.client.name}</h2>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#5a4a2a", marginBottom: "1rem", textTransform: "uppercase" }}>Pedidos em Aberto</h3>
            {loading ? (
              <p style={{ color: "#9a8060" }}>Carregando...</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {pedidos.map(p => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", backgroundColor: "#FAF6EE", borderRadius: "0.5rem" }}>
                    <span style={{ color: "#5a4a2a", fontWeight: 600 }}>Pedido {p.id.slice(0, 8)}</span>
                    <span style={{ color: "#b8891a", fontWeight: 700 }}>{fmt(p.total)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "#b8891a", borderRadius: "0.5rem", color: "#fff", fontWeight: 900, fontSize: "1.1rem" }}>
                  <span>Total</span>
                  <span>{fmt(totalDevido)}</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#5a4a2a", marginBottom: "1rem", textTransform: "uppercase" }}>Parcelar em</h3>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input type="number" min="1" max="12" value={parcelas} onChange={e => setParcelas(e.target.value)} style={{ width: "80px", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(140,100,20,0.2)", fontSize: "1rem", fontWeight: 700 }} />
              <span style={{ color: "#5a4a2a", fontWeight: 600 }}>vezes</span>
              <span style={{ color: "#b8891a", fontWeight: 700 }}>({fmt(valorParcela)}/mês)</span>
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#5a4a2a", marginBottom: "1rem", textTransform: "uppercase" }}>📊 Projeção</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
              {projecao.map((p, i) => (
                <div key={i} style={{ backgroundColor: "#FAF6EE", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
                  <div style={{ color: "#9a8060", fontSize: "0.8rem", marginBottom: "0.5rem", textTransform: "capitalize" }}>{p.mes}</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#b8891a" }}>{fmt(p.valor)}</div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleConsolidar} disabled={consolidando} style={{ backgroundColor: "#b8891a", color: "#fff", padding: "1rem 2rem", borderRadius: "0.75rem", border: "none", fontSize: "1rem", fontWeight: 900, cursor: consolidando ? "not-allowed" : "pointer", opacity: consolidando ? 0.6 : 1, width: "100%" }}>
            {consolidando ? "Consolidando..." : "✅ Consolidar Pagamentos"}
          </button>
        </div>
      )}
    </div>
  );
}
