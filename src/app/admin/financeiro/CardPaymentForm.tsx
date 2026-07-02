"use client";

import { useState } from "react";

type CardPaymentFormProps = {
  onSuccess: () => void;
};

export default function CardPaymentForm({ onSuccess }: CardPaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/despesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          description,
          amount: parseFloat(amount),
          category: "cartao",
          paymentMethod: "pix",
        }),
      });

      if (response.ok) {
        setAmount("");
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
        onSuccess();
        alert("✅ Pagamento de cartão registrado!");
      } else {
        const errData = await response.json();
        setError(errData.error || "Erro ao registrar pagamento");
      }
    } catch (err) {
      setError("Erro ao registrar pagamento");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", marginBottom: "1.5rem" }}>
      <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 700, color: "#1a1510" }}>💳 Registrar Pagamento de Cartão</h3>

      {error && <p style={{ color: "#c04040", fontSize: "0.9rem", marginBottom: "1rem", backgroundColor: "#fee8e8", padding: "0.75rem", borderRadius: "4px" }}>❌ {error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem", color: "#5a4a2a" }}>
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid rgba(140,100,20,0.25)",
                borderRadius: "0.5rem",
                boxSizing: "border-box",
                backgroundColor: "#FAF6EE",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem", color: "#5a4a2a" }}>
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid rgba(140,100,20,0.25)",
                borderRadius: "0.5rem",
                boxSizing: "border-box",
                backgroundColor: "#FAF6EE",
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem", color: "#5a4a2a" }}>
            Descrição
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Pagamento Shoppe + Mercado Livre"
            style={{
              width: "100%",
              padding: "0.6rem",
              border: "1px solid rgba(140,100,20,0.25)",
              borderRadius: "0.5rem",
              boxSizing: "border-box",
              backgroundColor: "#FAF6EE",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#b8891a",
            color: "white",
            border: "none",
            borderRadius: "0.625rem",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Registrando..." : "✅ Registrar Pagamento"}
        </button>
      </form>
    </div>
  );
}
