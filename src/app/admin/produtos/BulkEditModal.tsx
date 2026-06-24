"use client";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

interface BulkEditModalProps {
  selected: string[];
  products: Product[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkEditModal({ selected, products, onClose, onSuccess }: BulkEditModalProps) {
  const [action, setAction] = useState<"price" | "active" | "category">("active");
  const [newPrice, setNewPrice] = useState("");
  const [newActive, setNewActive] = useState("true");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedProducts = products.filter(p => selected.includes(p.id));

  const handleApply = async () => {
    if (action === "price" && !newPrice) {
      setError("Insira o novo preço");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/produtos/bulk-edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selected,
          action,
          value: action === "price" ? parseFloat(newPrice) : action === "active" ? newActive === "true" : null,
        }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar");

      onSuccess();
      onClose();
    } catch (e) {
      setError((e as Error).message || "Erro ao processar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "1.25rem", maxWidth: 500, width: "100%", padding: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#1a1510", margin: "0 0 1rem" }}>Editar {selected.length} Produtos</h2>

        {error && (
          <div style={{ backgroundColor: "#fee8e8", border: "1px solid #fcc", borderRadius: "0.625rem", color: "#c04040", padding: "0.75rem", marginBottom: "1rem", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: 700, color: "#5a4a2a", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
            Ação
          </label>
          <select value={action} onChange={(e) => setAction(e.target.value as any)}
            style={{ width: "100%", padding: "0.75rem", borderRadius: "0.625rem", border: "1px solid #ddd", fontSize: "1rem" }}>
            <option value="active">Ativar/Desativar</option>
            <option value="price">Mudar Preço</option>
          </select>
        </div>

        {action === "price" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontWeight: 700, color: "#5a4a2a", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              Novo Preço (R$)
            </label>
            <input type="number" min="0" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
              placeholder="0.00"
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.625rem", border: "1px solid #ddd", fontSize: "1rem" }} />
          </div>
        )}

        {action === "active" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontWeight: 700, color: "#5a4a2a", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              Status
            </label>
            <select value={newActive} onChange={(e) => setNewActive(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.625rem", border: "1px solid #ddd", fontSize: "1rem" }}>
              <option value="true">Ativar (visível)</option>
              <option value="false">Desativar (oculto)</option>
            </select>
          </div>
        )}

        <div style={{ backgroundColor: "#FAF6EE", borderRadius: "0.875rem", padding: "1rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#5a4a2a" }}>
          <p style={{ fontWeight: 700, margin: "0 0 0.5rem" }}>Produtos afetados ({selectedProducts.length}):</p>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {selectedProducts.slice(0, 5).map(p => (
              <p key={p.id} style={{ margin: "0.3rem 0", fontSize: "0.8rem" }}>• {p.name}</p>
            ))}
            {selectedProducts.length > 5 && <p style={{ margin: "0.3rem 0", fontSize: "0.8rem", fontStyle: "italic" }}>... e mais {selectedProducts.length - 5}</p>}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
          <button onClick={onClose} disabled={loading}
            style={{ padding: "0.75rem", borderRadius: "0.625rem", border: "1px solid #ddd", backgroundColor: "#fff", color: "#5a4a2a", fontWeight: 700, cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={handleApply} disabled={loading}
            style={{ padding: "0.75rem", borderRadius: "0.625rem", border: "none", backgroundColor: loading ? "#d4b870" : "#b8891a", color: "#fff", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Processando..." : "Aplicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
