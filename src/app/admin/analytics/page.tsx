"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LucroData {
  faturamento: string;
  custo: string;
  lucro: string;
  margem: string;
}

interface Product {
  id: string;
  name: string;
  faturamento: number;
  custo: number;
  lucro: number;
  margem: number;
  quantidade: number;
  classe?: string;
  percentual?: string;
}

interface Predicao {
  id: string;
  name: string;
  stock: number;
  velocidade: string;
  diasRestantes: string | number;
  esgotadoEm: string;
}

interface Data {
  lucroReal: LucroData;
  margensPorProduto: Product[];
  analiseABC: Product[];
  previsaoEstoque: Predicao[];
}

function fmt(n: number | string) {
  return Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function firstOfMonth(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function lastOfMonth(offset = 0) {
  const d = new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + offset + 1, 0);
  return last.toISOString().split("T")[0];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"lucro" | "margem" | "abc" | "estoque" | "vendas">("lucro");
  const [from, setFrom] = useState(firstOfMonth(-2));
  const [to, setTo] = useState(lastOfMonth());

  const loadData = (f = from, t = to) => {
    setLoading(true);
    fetch(`/api/admin/analytics?from=${f}&to=${t}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  if (loading)
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FAF6EE" }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(184,137,26,0.2)", borderTopColor: "#b8891a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );

  return (
    <div style={{ backgroundColor: "#FAF6EE", minHeight: "100vh", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</Link>
        <h1 style={{ color: "#1a1510", fontSize: "2rem", fontWeight: 900, marginTop: "0.5rem" }}>📊 Analytics</h1>

        {/* Filtro de período */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#5a4a2a" }}>DE</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: "0.4rem 0.6rem", borderRadius: "0.5rem", border: "1px solid rgba(140,100,20,0.3)", fontSize: "0.85rem" }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#5a4a2a" }}>ATÉ</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: "0.4rem 0.6rem", borderRadius: "0.5rem", border: "1px solid rgba(140,100,20,0.3)", fontSize: "0.85rem" }} />
          </div>
          {[
            { label: "Este mês", f: firstOfMonth(0), t: lastOfMonth(0) },
            { label: "Últimos 3 meses", f: firstOfMonth(-2), t: lastOfMonth(0) },
            { label: "Últimos 6 meses", f: firstOfMonth(-5), t: lastOfMonth(0) },
          ].map(s => (
            <button key={s.label} onClick={() => { setFrom(s.f); setTo(s.t); loadData(s.f, s.t); }}
              style={{ padding: "0.4rem 0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(140,100,20,0.3)", backgroundColor: "#fff", color: "#b8891a", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
              {s.label}
            </button>
          ))}
          <button onClick={() => loadData()} style={{ padding: "0.4rem 1rem", borderRadius: "0.5rem", border: "none", backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
            Filtrar
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {[
            { id: "lucro", label: "💰 Lucro Real" },
            { id: "vendas", label: "🏆 Top Vendas" },
            { id: "margem", label: "📈 Margens" },
            { id: "abc", label: "🎯 ABC" },
            { id: "estoque", label: "⏰ Previsão" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              style={{ padding: "0.5rem 1rem", border: "none", backgroundColor: tab === t.id ? "#b8891a" : "#EDE4CC", color: tab === t.id ? "#fff" : "#6a4a10", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", borderRadius: "0.5rem" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* LUCRO REAL */}
        {tab === "lucro" && data && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(140,100,20,0.1)" }}>
              <p style={{ color: "#9a8060", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>Faturamento</p>
              <p style={{ fontSize: "1.75rem", fontWeight: 900, color: "#b8891a", marginTop: "0.5rem" }}>{fmt(data.lucroReal.faturamento)}</p>
            </div>
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(140,100,20,0.1)" }}>
              <p style={{ color: "#9a8060", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>Custo</p>
              <p style={{ fontSize: "1.75rem", fontWeight: 900, color: "#c04040", marginTop: "0.5rem" }}>{fmt(data.lucroReal.custo)}</p>
            </div>
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(140,100,20,0.1)" }}>
              <p style={{ color: "#9a8060", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>Lucro</p>
              <p style={{ fontSize: "1.75rem", fontWeight: 900, color: "#2e7d32", marginTop: "0.5rem" }}>{fmt(data.lucroReal.lucro)}</p>
            </div>
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(140,100,20,0.1)" }}>
              <p style={{ color: "#9a8060", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>Margem</p>
              <p style={{ fontSize: "1.75rem", fontWeight: 900, color: "#b8891a", marginTop: "0.5rem" }}>{data.lucroReal.margem}%</p>
            </div>
          </div>
        )}

        {/* TOP VENDAS */}
        {tab === "vendas" && data && (
          <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", overflow: "hidden" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(140,100,20,0.1)", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "1rem", fontWeight: 700, color: "#5a4a2a", fontSize: "0.8rem", textTransform: "uppercase" }}>
              <div>Produto</div>
              <div style={{ textAlign: "right" }}>Quantidade</div>
              <div style={{ textAlign: "right" }}>Faturamento</div>
              <div style={{ textAlign: "right" }}>Pedidos</div>
              <div style={{ textAlign: "right" }}>Ticket</div>
            </div>
            {data.margensPorProduto.slice(0, 30).map((p, i) => (
              <div key={i} style={{ padding: "1rem 1.5rem", borderBottom: i < 29 ? "1px solid rgba(140,100,20,0.05)" : "none", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "1rem", alignItems: "center" }}>
                <p style={{ fontWeight: 700, color: "#1a1510" }}>#{i + 1} {p.name}</p>
                <p style={{ textAlign: "right", fontWeight: 700, color: "#b8891a" }}>{p.quantidade} un</p>
                <p style={{ textAlign: "right", color: "#1a1510" }}>{fmt(p.faturamento)}</p>
                <p style={{ textAlign: "right", color: "#6a4a10" }}>{(p.quantidade > 0 ? Math.round(p.quantidade / (p.faturamento / 100)) : 0).toString()}</p>
                <p style={{ textAlign: "right", fontWeight: 700, color: "#2e7d32" }}>{fmt(p.faturamento / (p.quantidade || 1))}</p>
              </div>
            ))}
          </div>
        )}

        {/* MARGENS POR PRODUTO */}
        {tab === "margem" && data && (
          <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", overflow: "hidden" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(140,100,20,0.1)", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "1rem", fontWeight: 700, color: "#5a4a2a", fontSize: "0.8rem", textTransform: "uppercase" }}>
              <div>Produto</div>
              <div style={{ textAlign: "right" }}>Faturamento</div>
              <div style={{ textAlign: "right" }}>Custo</div>
              <div style={{ textAlign: "right" }}>Lucro</div>
              <div style={{ textAlign: "right" }}>Margem</div>
            </div>
            {data.margensPorProduto.slice(0, 20).map((p, i) => (
              <div key={i} style={{ padding: "1rem 1.5rem", borderBottom: i < 19 ? "1px solid rgba(140,100,20,0.05)" : "none", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "1rem", alignItems: "center" }}>
                <p style={{ fontWeight: 700, color: "#1a1510" }}>{p.name}</p>
                <p style={{ textAlign: "right", color: "#1a1510" }}>{fmt(p.faturamento)}</p>
                <p style={{ textAlign: "right", color: "#9a8060" }}>{fmt(p.custo)}</p>
                <p style={{ textAlign: "right", fontWeight: 700, color: "#2e7d32" }}>{fmt(p.lucro)}</p>
                <p style={{ textAlign: "right", fontWeight: 700, color: "#b8891a", fontSize: "1.1rem" }}>{p.margem.toFixed(1)}%</p>
              </div>
            ))}
          </div>
        )}

        {/* ANÁLISE ABC */}
        {tab === "abc" && data && (
          <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", overflow: "hidden" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(140,100,20,0.1)", display: "grid", gridTemplateColumns: "2fr 0.5fr 1fr 1fr", gap: "1rem", fontWeight: 700, color: "#5a4a2a", fontSize: "0.8rem", textTransform: "uppercase" }}>
              <div>Produto</div>
              <div style={{ textAlign: "center" }}>Classe</div>
              <div style={{ textAlign: "right" }}>Faturamento</div>
              <div style={{ textAlign: "right" }}>% do Total</div>
            </div>
            {data.analiseABC.map((p, i) => (
              <div key={i} style={{ padding: "1rem 1.5rem", borderBottom: i < data.analiseABC.length - 1 ? "1px solid rgba(140,100,20,0.05)" : "none", display: "grid", gridTemplateColumns: "2fr 0.5fr 1fr 1fr", gap: "1rem", alignItems: "center" }}>
                <p style={{ fontWeight: 700, color: "#1a1510" }}>{p.name}</p>
                <div style={{ textAlign: "center", fontWeight: 900, color: p.classe === "A" ? "#2e7d32" : p.classe === "B" ? "#f57c00" : "#c04040", fontSize: "1.1rem" }}>{p.classe}</div>
                <p style={{ textAlign: "right" }}>{fmt(p.faturamento)}</p>
                <p style={{ textAlign: "right", fontWeight: 700, color: "#b8891a" }}>{p.percentual}%</p>
              </div>
            ))}
          </div>
        )}

        {/* PREVISÃO ESTOQUE */}
        {tab === "estoque" && data && (
          <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", overflow: "hidden" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(140,100,20,0.1)", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "1rem", fontWeight: 700, color: "#5a4a2a", fontSize: "0.8rem", textTransform: "uppercase" }}>
              <div>Produto</div>
              <div style={{ textAlign: "right" }}>Estoque</div>
              <div style={{ textAlign: "right" }}>Vel./dia</div>
              <div style={{ textAlign: "right" }}>Dias</div>
              <div style={{ textAlign: "right" }}>Esgotado em</div>
            </div>
            {data.previsaoEstoque.slice(0, 20).map((p, i) => (
              <div key={i} style={{ padding: "1rem 1.5rem", borderBottom: i < 19 ? "1px solid rgba(140,100,20,0.05)" : "none", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "1rem", alignItems: "center" }}>
                <p style={{ fontWeight: 700, color: "#1a1510" }}>{p.name}</p>
                <p style={{ textAlign: "right" }}>{p.stock} un</p>
                <p style={{ textAlign: "right", color: "#9a8060" }}>{p.velocidade}</p>
                <p style={{ textAlign: "right", fontWeight: 700, color: typeof p.diasRestantes === 'number' && p.diasRestantes < 30 ? "#c04040" : "#2e7d32" }}>{p.diasRestantes}</p>
                <p style={{ textAlign: "right", fontSize: "0.85rem" }}>{p.esgotadoEm}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
