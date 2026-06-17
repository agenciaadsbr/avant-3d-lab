import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency, parseJson } from "@/lib/utils";

export default async function AdminProdutosPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const totalValor = products.reduce((a, p) => a + p.price * p.stock, 0);
  const totalUnidades = products.reduce((a, p) => a + p.stock, 0);
  const semEstoque = products.filter(p => p.stock === 0).length;
  const estoquebaixo = products.filter(p => p.stock > 0 && p.stock <= 5).length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <a href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</a>
          <h1 style={{ color: "#1a1510", fontSize: "1.75rem", fontWeight: 900, marginTop: "0.2rem" }}>Produtos</h1>
        </div>
        <a href="/admin/produtos/novo" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, fontSize: "0.875rem", padding: "0.6rem 1.25rem", borderRadius: "0.75rem", textDecoration: "none" }}>
          + Novo Produto
        </a>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.875rem", marginBottom: "1.5rem" }}>
        {[
          { emoji: "📦", label: "Total de Produtos", value: products.length },
          { emoji: "💰", label: "Valor em Estoque", value: formatCurrency(totalValor) },
          { emoji: "🔢", label: "Total de Unidades", value: totalUnidades },
          { emoji: "⚠️", label: "Estoque Baixo (≤5)", value: estoquebaixo, warn: estoquebaixo > 0 },
          { emoji: "❌", label: "Sem Estoque", value: semEstoque, warn: semEstoque > 0 },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: "#fff", border: `1px solid ${(s as any).warn ? "rgba(192,64,64,0.25)" : "rgba(140,100,20,0.1)"}`, borderRadius: "0.875rem", padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "1.25rem", marginBottom: "0.4rem" }}>{s.emoji}</div>
            <div style={{ color: "#1a1510", fontSize: "1.4rem", fontWeight: 900 }}>{s.value}</div>
            <div style={{ color: "#9a8060", fontSize: "0.75rem", marginTop: "0.2rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#FAF6EE" }}>
                {["Produto", "Categoria", "Preço", "Estoque", "Valor Est.", "Status", ""].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0.875rem 1rem", color: "#9a8060", fontWeight: 700, fontSize: "0.75rem", borderBottom: "1px solid rgba(140,100,20,0.1)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const images = parseJson<string[]>(p.images, []);
                const estoqueColor = p.stock === 0 ? "#c04040" : p.stock <= 5 ? "#b8891a" : "#2a8a2a";
                const estoqueBg = p.stock === 0 ? "#fee8e8" : p.stock <= 5 ? "#fff8e1" : "#e8f8e8";
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid rgba(140,100,20,0.06)" }}>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: 40, height: 40, backgroundColor: "#F0E8D0", borderRadius: "0.5rem", overflow: "hidden", flexShrink: 0 }}>
                          {images[0] && <img src={images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                        </div>
                        <span style={{ color: "#1a1510", fontWeight: 600, fontSize: "0.875rem" }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#7a6030", fontSize: "0.8rem" }}>{p.category.name}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#1a1510", fontWeight: 700, whiteSpace: "nowrap" }}>{formatCurrency(p.price)}</td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{ backgroundColor: estoqueBg, color: estoqueColor, fontWeight: 700, fontSize: "0.8rem", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>
                        {p.stock} un
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#5a4a2a", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {formatCurrency(p.price * p.stock)}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{ backgroundColor: p.active ? "#e8f8e8" : "#f0f0f0", color: p.active ? "#2a8a2a" : "#888", fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.625rem", borderRadius: "999px" }}>
                        {p.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <a href={`/admin/produtos/${p.id}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", backgroundColor: "#FAF6EE", border: "1px solid rgba(184,137,26,0.3)", color: "#b8891a", fontSize: "0.75rem", fontWeight: 700, padding: "0.35rem 0.75rem", borderRadius: "0.5rem", textDecoration: "none", whiteSpace: "nowrap" }}>
                        ✏️ Editar
                      </a>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#b8a080" }}>
                    Nenhum produto cadastrado. <a href="/admin/importar" style={{ color: "#b8891a", fontWeight: 700 }}>Importar Excel</a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
