"use client";
import { useAdmin } from "@/store/admin";
import { formatCurrency } from "@/lib/utils";

interface KPI {
  emoji: string;
  label: string;
  value: string;
  sub?: string;
  subOk?: boolean;
  hideWhen?: "profit";
}

export default function DashboardKPIs({ kpis }: { kpis: KPI[] }) {
  const { hideProfit } = useAdmin();
  const filtered = kpis.filter(k => !(hideProfit && k.hideWhen === "profit"));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
      {filtered.map(k => (
        <div key={k.label} style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "0.875rem", padding: "0.875rem 1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>{k.emoji}</div>
          <div style={{ color: "#1a1510", fontSize: "1.15rem", fontWeight: 900, lineHeight: 1 }}>{k.value}</div>
          <div style={{ color: "#9a8060", fontSize: "0.7rem", fontWeight: 700, marginTop: "0.25rem" }}>{k.label}</div>
          {k.sub && <div style={{ color: (k as any).subOk === false ? "#c04040" : "#9a8060", fontSize: "0.65rem", marginTop: "0.15rem" }}>{k.sub}</div>}
        </div>
      ))}
    </div>
  );
}
