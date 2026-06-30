"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Item {
  id: string;
  name: string;
  stock: number;
  sold: number;
  daysActive: number;
  velocidade: string;
  rotatividade: number;
}

interface Data {
  products: Item[];
  components: Item[];
  all: Item[];
}

export default function GiroEstoquePage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "products" | "components">("all");

  useEffect(() => {
    fetch("/api/admin/giro-estoque")
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
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</Link>
        <h1 style={{ color: "#1a1510", fontSize: "2rem", fontWeight: 900, marginTop: "0.5rem" }}>🔄 Giro de Estoque</h1>
        <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.5rem" }}>Quais peças vendem mais rápido</p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", marginBottom: "1.5rem", borderBottom: "2px solid rgba(140,100,20,0.1)", paddingBottom: "0.75rem" }}>
          {[
            { label: "Tudo", value: "all" as const },
            { label: "Produtos", value: "products" as const },
            { label: "Componentes", value: "components" as const },
          ].map(t => (
            <button key={t.value} onClick={() => setTab(t.value)}
              style={{ padding: "0.5rem 1rem", border: "none", backgroundColor: "transparent", color: tab === t.value ? "#b8891a" : "#9a8060", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", borderBottom: tab === t.value ? "3px solid #b8891a" : "3px solid transparent", marginBottom: "-0.75rem" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tabela */}
        <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(140,100,20,0.1)", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", gap: "1rem", fontWeight: 700, color: "#5a4a2a", fontSize: "0.8rem", textTransform: "uppercase" }}>
            <div>Peça</div>
            <div style={{ textAlign: "right" }}>Estoque</div>
            <div style={{ textAlign: "right" }}>Vendido</div>
            <div style={{ textAlign: "right" }}>Dias</div>
            <div style={{ textAlign: "right" }}>Velocidade</div>
            <div style={{ textAlign: "right" }}>Giro</div>
          </div>
          {data?.[tab].map((item, i, arr) => (
            <div key={i} style={{ padding: "1rem 1.5rem", borderBottom: i < (arr.length - 1) ? "1px solid rgba(140,100,20,0.05)" : "none", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", gap: "1rem", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 700, color: "#1a1510", fontSize: "0.9rem" }}>{item.name}</p>
              </div>
              <div style={{ textAlign: "right", fontWeight: 700, color: "#1a1510" }}>{item.stock} un</div>
              <div style={{ textAlign: "right", fontWeight: 700, color: "#1a1510" }}>{item.sold} un</div>
              <div style={{ textAlign: "right", fontSize: "0.9rem", color: "#9a8060" }}>{item.daysActive}d</div>
              <div style={{ textAlign: "right", fontWeight: 700, color: "#b8891a", fontSize: "1.1rem" }}>{item.velocidade} un/dia</div>
              <div style={{ textAlign: "right", fontWeight: 700, color: item.rotatividade > 50 ? "#2e7d32" : item.rotatividade > 20 ? "#f57c00" : "#c04040", fontSize: "1.1rem" }}>
                {item.rotatividade}%
              </div>
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", fontSize: "0.8rem", color: "#9a8060" }}>
          <p style={{ fontWeight: 700, marginBottom: "0.5rem" }}>📊 Métricas:</p>
          <ul style={{ marginLeft: "1.5rem", lineHeight: 1.8 }}>
            <li><strong>Velocidade:</strong> quantas unidades vendem por dia</li>
            <li><strong>Giro:</strong> % vendido vs estoque (verde = alto, vermelho = baixo)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
