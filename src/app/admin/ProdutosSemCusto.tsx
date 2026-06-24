"use client";
import { useEffect, useState } from "react";

interface Produto {
  id: string;
  name: string;
  quantity: number;
  count: number;
  priceRange: { min: number; max: number };
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProdutosSemCusto() {
  const [products, setProducts] = useState<Produto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/produtos-sem-custo")
      .then(r => r.json())
      .then(d => {
        setProducts(d.products);
        setTotal(d.total);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (products.length === 0) return null;

  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid rgba(255,100,100,0.3)", borderRadius: "1rem", overflow: "hidden", marginBottom: "1.5rem", background: "linear-gradient(135deg, #fee8e8 0%, #fff5f5 100%)" }}>
      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,100,100,0.2)" }}>
        <h3 style={{ color: "#c04040", fontWeight: 800, fontSize: "0.9rem", margin: 0 }}>⚠️ {products.length} Produtos sem Custo</h3>
        <p style={{ color: "#b87070", fontSize: "0.75rem", margin: "0.3rem 0 0" }}>{total} itens vendidos sem custo registrado</p>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ backgroundColor: "rgba(255,100,100,0.08)", borderBottom: "1px solid rgba(255,100,100,0.15)" }}>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 700, color: "#c04040" }}>Produto</th>
              <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 700, color: "#c04040" }}>Qtd</th>
              <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 700, color: "#c04040" }}>Pedidos</th>
              <th style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 700, color: "#c04040" }}>Preço</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,100,100,0.1)" }}>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#1a1510" }}>
                  <Link href={`/admin/produtos/${p.id}`} style={{ color: "#c04040", textDecoration: "none", fontWeight: 600 }}>
                    {p.name}
                  </Link>
                </td>
                <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 700, color: "#c04040" }}>
                  {p.quantity}
                </td>
                <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "#9a8060" }}>
                  {p.count}
                </td>
                <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "#1a1510", fontSize: "0.75rem" }}>
                  {fmt(p.priceRange.min)} {p.priceRange.min !== p.priceRange.max && `a ${fmt(p.priceRange.max)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Link({ href, children, ...props }: any) {
  return <a href={href} {...props}>{children}</a>;
}
