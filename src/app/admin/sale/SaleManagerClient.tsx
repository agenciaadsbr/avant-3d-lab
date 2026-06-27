"use client";

import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  saleDiscount: number | null;
  onSale: boolean;
  createdAt: string;
  stock: number;
  category: { name: string };
}

interface Props {
  upcomingSaleProducts: Product[];
  activeSaleProducts: Product[];
}

export default function SaleManagerClient({
  upcomingSaleProducts,
  activeSaleProducts,
}: Props) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "active">("upcoming");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const daysUntilSale = (createdAt: string) => {
    const created = new Date(createdAt);
    const today = new Date();
    const days = Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 60 - days);
  };

  const calculateSalePrice = (price: number, discount: number) => {
    return (price * (100 - discount) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleToggleSale = async (productId: string, currentOnSale: boolean) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onSale: !currentOnSale }),
      });
      if (res.ok) {
        setMessage(currentOnSale ? "❌ Removido de SALE" : "✅ Autorizado para SALE");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage("❌ Erro ao atualizar");
      }
    } catch (err) {
      setMessage("❌ Erro ao atualizar");
    }
    setLoading(false);
  };

  const handleUpdateDiscount = async (
    productId: string,
    discount: number
  ) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saleDiscount: discount || null }),
      });
      if (res.ok) {
        setMessage("✅ Desconto atualizado");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage("❌ Erro ao atualizar");
      }
    } catch (err) {
      setMessage("❌ Erro ao atualizar");
    }
    setLoading(false);
  };

  const renderProducts = (products: Product[]) => {
    if (products.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9a8060" }}>
          <p style={{ fontSize: "1rem", fontWeight: 600 }}>
            {activeTab === "upcoming"
              ? "Nenhuma peça próxima de entrar em SALE nos próximos 60 dias"
              : "Nenhuma peça autorizada para SALE"}
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {products.map((product) => {
          const discount = product.saleDiscount || 20;
          const daysLeft =
            activeTab === "upcoming"
              ? daysUntilSale(product.createdAt)
              : undefined;
          return (
            <div
              key={product.id}
              style={{
                backgroundColor: "#fff",
                border: "1px solid rgba(140,100,20,0.15)",
                borderRadius: "0.875rem",
                padding: "1.25rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              {/* Produto */}
              <div>
                <p style={{ fontWeight: 700, color: "#1a1510", marginBottom: "0.2rem" }}>
                  {product.name.length > 40
                    ? product.name.slice(0, 40) + "..."
                    : product.name}
                </p>
                <p style={{ fontSize: "0.75rem", color: "#9a8060" }}>
                  {product.category.name} • Estoque: {product.stock}
                </p>
              </div>

              {/* Datas */}
              <div>
                <p style={{ fontSize: "0.75rem", color: "#9a8060", marginBottom: "0.2rem" }}>
                  Criado em
                </p>
                <p style={{ fontWeight: 600, color: "#1a1510" }}>
                  {formatDate(product.createdAt)}
                </p>
                {daysLeft !== undefined && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: daysLeft === 0 ? "#e74c3c" : "#b8891a",
                      fontWeight: 700,
                    }}
                  >
                    {daysLeft === 0
                      ? "🔥 ENTRA HOJE!"
                      : `${daysLeft} dias`}
                  </p>
                )}
              </div>

              {/* Preço Original */}
              <div>
                <p style={{ fontSize: "0.75rem", color: "#9a8060", marginBottom: "0.2rem" }}>
                  Preço Original
                </p>
                <p style={{ fontWeight: 700, color: "#b8891a", fontSize: "1rem" }}>
                  R$ {product.price.toFixed(2)}
                </p>
              </div>

              {/* Desconto + Preço com Desconto */}
              <div>
                <p style={{ fontSize: "0.75rem", color: "#9a8060", marginBottom: "0.2rem" }}>
                  Desconto & Preço
                </p>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => {
                      const newDiscount = Math.max(
                        0,
                        Math.min(100, parseInt(e.target.value) || 0)
                      );
                      handleUpdateDiscount(product.id, newDiscount);
                    }}
                    disabled={loading}
                    style={{
                      width: "50px",
                      padding: "0.4rem",
                      border: "1px solid rgba(140,100,20,0.2)",
                      borderRadius: "0.4rem",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                    }}
                  />
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#e74c3c",
                      fontSize: "0.9rem",
                    }}
                  >
                    %
                  </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "#e74c3c", fontWeight: 700 }}>
                  {calculateSalePrice(product.price, discount)}
                </p>
              </div>

              {/* Botão Autorizar */}
              <button
                onClick={() => handleToggleSale(product.id, product.onSale)}
                disabled={loading}
                style={{
                  padding: "0.6rem 1rem",
                  backgroundColor: product.onSale ? "#fee8e8" : "#e8f5e9",
                  color: product.onSale ? "#c04040" : "#2e7d32",
                  border: `1px solid ${
                    product.onSale
                      ? "rgba(192,64,64,0.3)"
                      : "rgba(46,125,50,0.3)"
                  }`,
                  borderRadius: "0.625rem",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {product.onSale ? "🗑️ Remover" : "✅ Autorizar"}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {message && (
        <div
          style={{
            backgroundColor: message.includes("✅") ? "#e8f5e9" : "#fee8e8",
            color: message.includes("✅") ? "#2e7d32" : "#c04040",
            padding: "1rem",
            borderRadius: "0.75rem",
            marginBottom: "1.5rem",
            textAlign: "center",
            fontWeight: 600,
            border: `1px solid ${
              message.includes("✅")
                ? "rgba(46,125,50,0.2)"
                : "rgba(192,64,64,0.2)"
            }`,
          }}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid rgba(140,100,20,0.1)" }}>
        <button
          onClick={() => setActiveTab("upcoming")}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: activeTab === "upcoming" ? "transparent" : "transparent",
            color: activeTab === "upcoming" ? "#b8891a" : "#9a8060",
            border: "none",
            borderBottom: activeTab === "upcoming" ? "3px solid #b8891a" : "none",
            fontWeight: activeTab === "upcoming" ? 700 : 600,
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          📅 Próximos de SALE ({upcomingSaleProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: activeTab === "active" ? "transparent" : "transparent",
            color: activeTab === "active" ? "#b8891a" : "#9a8060",
            border: "none",
            borderBottom: activeTab === "active" ? "3px solid #b8891a" : "none",
            fontWeight: activeTab === "active" ? 700 : 600,
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          🔥 Em SALE Agora ({activeSaleProducts.length})
        </button>
      </div>

      {/* Produtos */}
      {activeTab === "upcoming"
        ? renderProducts(upcomingSaleProducts)
        : renderProducts(activeSaleProducts)}
    </div>
  );
}
