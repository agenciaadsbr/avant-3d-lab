"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Produto {
  id: string;
  name: string;
  slug: string;
  price: number;
  costPrice: number | null;
  stock: number;
}

export default function ProdutosSemCustoPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/produtos/sem-custo")
      .then(r => r.json())
      .then(d => setProdutos(d.produtos))
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
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</Link>
        <h1 style={{ color: "#1a1510", fontSize: "2rem", fontWeight: 900, marginTop: "1rem" }}>⚠️ Produtos Sem Custo</h1>
        <p style={{ color: "#6a4a10", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
          {produtos.length} produto(s) sem custo preenchido. Isso afeta os cálculos de margem no Analytics!
        </p>

        {produtos.length === 0 ? (
          <div style={{ backgroundColor: "#e8f5e9", border: "1px solid rgba(76,175,80,0.3)", borderRadius: "1rem", padding: "2rem", textAlign: "center", color: "#2e7d32" }}>
            ✅ Todos os produtos têm custo preenchido!
          </div>
        ) : (
          <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#fee8e8" }}>
                  <th style={{ textAlign: "left", padding: "1rem", fontWeight: 700, color: "#c04040", borderBottom: "1px solid rgba(192,64,64,0.1)", fontSize: "0.85rem" }}>Produto</th>
                  <th style={{ textAlign: "right", padding: "1rem", fontWeight: 700, color: "#c04040", borderBottom: "1px solid rgba(192,64,64,0.1)", fontSize: "0.85rem" }}>Preço</th>
                  <th style={{ textAlign: "right", padding: "1rem", fontWeight: 700, color: "#c04040", borderBottom: "1px solid rgba(192,64,64,0.1)", fontSize: "0.85rem" }}>Custo</th>
                  <th style={{ textAlign: "right", padding: "1rem", fontWeight: 700, color: "#c04040", borderBottom: "1px solid rgba(192,64,64,0.1)", fontSize: "0.85rem" }}>Estoque</th>
                  <th style={{ textAlign: "center", padding: "1rem", fontWeight: 700, color: "#c04040", borderBottom: "1px solid rgba(192,64,64,0.1)", fontSize: "0.85rem" }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < produtos.length - 1 ? "1px solid rgba(140,100,20,0.05)" : "none" }}>
                    <td style={{ padding: "1rem", fontWeight: 600, color: "#1a1510" }}>
                      {p.name}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right", color: "#1a1510" }}>
                      R$ {p.price.toFixed(2)}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right", color: "#c04040", fontWeight: 700 }}>
                      {p.costPrice ? `R$ ${p.costPrice.toFixed(2)}` : "❌ Vazio"}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right", color: "#6a4a10" }}>
                      {p.stock} un
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <Link
                        href={`/admin/produtos/${p.slug}`}
                        style={{
                          backgroundColor: "#b8891a",
                          color: "#fff",
                          padding: "0.5rem 1rem",
                          borderRadius: "0.5rem",
                          textDecoration: "none",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          display: "inline-block"
                        }}
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: "2rem", backgroundColor: "#fffbf0", border: "1px solid rgba(184,137,26,0.2)", borderRadius: "1rem", padding: "1.5rem", color: "#6a4a10", fontSize: "0.9rem" }}>
          <strong>💡 Como Corrigir:</strong>
          <ol style={{ marginTop: "0.5rem", paddingLeft: "1.5rem", lineHeight: 1.8 }}>
            <li>Clique em "Editar" para cada produto</li>
            <li>Preencha o campo <strong>"Custo"</strong> com o valor que você pagou pelo produto</li>
            <li>Salve</li>
            <li>Após preencher todos, volta aqui para confirmar ✅</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
