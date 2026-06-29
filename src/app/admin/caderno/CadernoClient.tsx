"use client";
import { useState, useMemo } from "react";

type ClientData = {
  userId: string;
  client: { id: string; name: string | null; email: string; phone?: string | null };
  totalDevido: number;
  pedidosCount: number;
};

type PedidoItem = { quantity: number; price: number; size: string | null; componentName?: string | null; product?: { name: string } | null };

type Pedido = {
  id: string;
  total: number;
  amountPaid: number;
  saldoPendente: number;
  dueDate: string | null;
  items?: PedidoItem[];
};

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CadernoClient({ clientsData }: { clientsData: ClientData[] }) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [parcelas, setParcelas] = useState("3");
  const [primeiroVencimento, setPrimeiroVencimento] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  });
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

  const totalDevido = pedidos.reduce((s, p) => s + p.saldoPendente, 0);
  const numParcelas = parseInt(parcelas) || 1;
  const valorParcela = totalDevido / numParcelas;

  const projecao = Array.from({ length: numParcelas }, (_, i) => {
    const d = new Date(primeiroVencimento);
    d.setMonth(d.getMonth() + i);
    const mes = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    const dia = d.toLocaleDateString("pt-BR", { day: "2-digit" });
    const isLast = i === numParcelas - 1;
    const valor = isLast ? totalDevido - valorParcela * (numParcelas - 1) : valorParcela;
    return { mes, dia, valor, data: d.toISOString().split("T")[0], mes_key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` };
  });

  const enviarResumoWhatsApp = () => {
    const phone = selectedClient?.client.phone;
    if (!phone) return alert("Cliente sem telefone cadastrado. Cadastre em /admin/clientes.");
    const linhas = pedidos.flatMap(p =>
      (p.items || []).map(i => {
        const isVM = i.product?.name === "Venda Manual";
        const nome = isVM
          ? (i.size || "Item")
          : i.product?.name
            ? (i.componentName ? `${i.product.name} - ${i.componentName}` : i.product.name)
            : (i.size || "Item");
        return `- ${nome} x${i.quantity}  ${fmt(i.price * i.quantity)}`;
      })
    ).join("\n");
    const msg = [
      `Olá ${selectedClient?.client.name?.split(" ")[0]}!`,
      ``,
      `Segue o resumo das suas peças na *Access Fit*:`,
      ``,
      linhas || `Total: ${fmt(totalDevido)}`,
      ``,
      `*Total em aberto: ${fmt(totalDevido)}*`,
      ``,
      `Qualquer dúvida estamos à disposição!`,
    ].join("\n");
    const ddi = phone.replace(/\D/g, "").startsWith("55") ? phone.replace(/\D/g, "") : `55${phone.replace(/\D/g, "")}`;
    window.open(`https://wa.me/${ddi}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleConsolidar = async () => {
    if (!selectedClientId) return;
    setConsolidando(true);
    const res = await fetch(`/api/admin/caderno/consolidar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClientId, parcelas: numParcelas, primeiroVencimento }),
    });
    if (res.ok) {
      // Recarrega a página para atualizar Projeção de Caixa e Fluxo do Mês
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 1000);
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
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", backgroundColor: "#FAF6EE", borderRadius: "0.5rem", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#5a4a2a", fontWeight: 600 }}>Pedido {p.id.slice(0, 8)}</div>
                      <div style={{ color: "#9a8060", fontSize: "0.75rem", marginTop: "0.2rem" }}>Total: {fmt(p.total)} | Pago: {fmt(p.amountPaid)}</div>
                    </div>
                    <span style={{ color: "#b8891a", fontWeight: 700, minWidth: "100px", textAlign: "right" }}>Saldo: {fmt(p.saldoPendente)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", backgroundColor: "#b8891a", borderRadius: "0.5rem", color: "#fff", fontWeight: 900, fontSize: "1.1rem" }}>
                  <span>Total em Aberto</span>
                  <span>{fmt(totalDevido)}</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#5a4a2a", marginBottom: "1rem", textTransform: "uppercase" }}>Parcelamento</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#5a4a2a", marginBottom: "0.4rem" }}>Quantidade de Parcelas</label>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <input type="number" min="1" max="12" value={parcelas} onChange={e => setParcelas(e.target.value)} style={{ width: "100px", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(140,100,20,0.2)", fontSize: "1rem", fontWeight: 700 }} />
                  <span style={{ color: "#9a8060", fontWeight: 600 }}>vezes</span>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#5a4a2a", marginBottom: "0.4rem" }}>1º Vencimento</label>
                <input type="date" value={primeiroVencimento} onChange={e => setPrimeiroVencimento(e.target.value)} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(140,100,20,0.2)", fontSize: "1rem", fontWeight: 700 }} />
              </div>
            </div>
            <div style={{ color: "#b8891a", fontWeight: 700, fontSize: "0.95rem" }}>Valor/parcela: {fmt(valorParcela)}</div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#5a4a2a", marginBottom: "1rem", textTransform: "uppercase" }}>📊 Projeção</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
              {projecao.map((p, i) => (
                <div key={i} style={{ backgroundColor: "#FAF6EE", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
                  <div style={{ color: "#9a8060", fontSize: "0.75rem", marginBottom: "0.3rem" }}>Vencimento</div>
                  <div style={{ color: "#5a4a2a", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.5rem" }}>{p.dia} de {p.mes}</div>
                  <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#b8891a" }}>{fmt(p.valor)}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={enviarResumoWhatsApp} style={{ backgroundColor: "#25D366", color: "#fff", padding: "1rem 1.5rem", borderRadius: "0.75rem", border: "none", fontSize: "0.95rem", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Enviar resumo
            </button>
            <button onClick={handleConsolidar} disabled={consolidando} style={{ backgroundColor: "#b8891a", color: "#fff", padding: "1rem 2rem", borderRadius: "0.75rem", border: "none", fontSize: "1rem", fontWeight: 900, cursor: consolidando ? "not-allowed" : "pointer", opacity: consolidando ? 0.6 : 1, flex: 1 }}>
              {consolidando ? "Consolidando..." : "✅ Consolidar Pagamentos"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
