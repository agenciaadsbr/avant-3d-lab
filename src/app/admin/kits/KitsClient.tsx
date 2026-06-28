"use client";

import { useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  category?: { name: string };
  kitItems?: Array<{ product: { id: string; name: string; price: number }; quantity: number }>;
}

interface Props {
  kits: Product[];
  allProducts: Array<{ id: string; name: string; price: number }>;
}

export default function KitsClient({ kits, allProducts }: Props) {
  const [selectedKit, setSelectedKit] = useState<string | null>(null);
  const [newProductId, setNewProductId] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const currentKit = kits.find(k => k.id === selectedKit);

  const handleAddItem = async () => {
    if (!selectedKit || !newProductId) {
      setMessage("❌ Selecione um kit e um produto");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/kits/${selectedKit}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: newProductId, quantity: newQuantity }),
      });

      if (res.ok) {
        setMessage("✅ Produto adicionado ao kit!");
        setNewProductId("");
        setNewQuantity(1);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const data = await res.json();
        setMessage(`❌ ${data.error || "Erro ao adicionar"}`);
      }
    } catch (err) {
      setMessage("❌ Erro ao adicionar produto");
    }

    setLoading(false);
  };

  const handleRemoveItem = async (productId: string) => {
    if (!selectedKit) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kits/${selectedKit}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        setMessage("✅ Produto removido!");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage("❌ Erro ao remover");
      }
    } catch (err) {
      setMessage("❌ Erro ao remover");
    }

    setLoading(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "2rem" }}>
      {/* Lista de Kits */}
      <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", padding: "1.5rem", height: "fit-content" }}>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1a1510", marginBottom: "1rem" }}>Kits ({kits.length})</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {kits.map(kit => (
            <button
              key={kit.id}
              onClick={() => setSelectedKit(kit.id)}
              style={{
                padding: "0.75rem",
                backgroundColor: selectedKit === kit.id ? "#b8891a" : "#FAF6EE",
                color: selectedKit === kit.id ? "#fff" : "#1a1510",
                border: "1px solid rgba(140,100,20,0.2)",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.85rem",
                textAlign: "left",
              }}
            >
              {kit.name}
            </button>
          ))}
        </div>
        <Link href="/admin/produtos?filter=isKit" style={{
          display: "block",
          marginTop: "1rem",
          padding: "0.75rem",
          backgroundColor: "#e8f5e9",
          color: "#2e7d32",
          border: "1px solid rgba(46,125,50,0.2)",
          borderRadius: "0.5rem",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "0.85rem",
          textAlign: "center",
        }}>
          ➕ Novo Kit
        </Link>
      </div>

      {/* Gerenciar Kit */}
      <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", padding: "1.5rem" }}>
        {message && (
          <div style={{
            backgroundColor: message.includes("✅") ? "#e8f5e9" : "#fee8e8",
            color: message.includes("✅") ? "#2e7d32" : "#c04040",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}>
            {message}
          </div>
        )}

        {currentKit ? (
          <>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1a1510", marginBottom: "1rem" }}>
              📦 {currentKit.name}
            </h2>

            {/* Itens do Kit */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#5a4a2a", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                Composição ({currentKit.kitItems?.length || 0} itens)
              </h3>
              {currentKit.kitItems && currentKit.kitItems.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {currentKit.kitItems.map(item => (
                    <div
                      key={item.product.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.75rem",
                        backgroundColor: "#FAF6EE",
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(140,100,20,0.1)",
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 600, color: "#1a1510", fontSize: "0.9rem" }}>
                          {item.product.name} <span style={{ color: "#9a8060" }}>x{item.quantity}</span>
                        </p>
                        <p style={{ fontSize: "0.8rem", color: "#9a8060" }}>
                          R$ {item.product.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        disabled={loading}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#fee8e8",
                          color: "#c04040",
                          border: "1px solid rgba(192,64,64,0.2)",
                          borderRadius: "0.4rem",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#9a8060", fontSize: "0.9rem" }}>Nenhum item no kit ainda</p>
              )}
            </div>

            {/* Adicionar Produto */}
            <div style={{ borderTop: "1px solid rgba(140,100,20,0.1)", paddingTop: "1.5rem" }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#5a4a2a", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                Adicionar Produto
              </h3>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <select
                  value={newProductId}
                  onChange={e => setNewProductId(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    padding: "0.75rem",
                    border: "1px solid rgba(140,100,20,0.2)",
                    borderRadius: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <option value="">Selecione um produto...</option>
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (R$ {p.price.toFixed(2)})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newQuantity}
                  onChange={e => setNewQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: "60px",
                    padding: "0.75rem",
                    border: "1px solid rgba(140,100,20,0.2)",
                    borderRadius: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                />

                <button
                  onClick={handleAddItem}
                  disabled={loading}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: loading ? "#d4a820" : "#b8891a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Adicionando..." : "✅ Adicionar"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <p style={{ color: "#9a8060", textAlign: "center", padding: "2rem" }}>
            Selecione um kit para gerenciar
          </p>
        )}
      </div>
    </div>
  );
}
