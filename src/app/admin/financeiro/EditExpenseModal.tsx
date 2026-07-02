"use client";

import { useState } from "react";

type EditExpenseModalProps = {
  expense: any;
  onClose: () => void;
  onSave: () => void;
};

const PAYMENTS = [
  { value: "pix", label: "Pix" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "boleto", label: "Boleto" },
];

export default function EditExpenseModal({ expense, onClose, onSave }: EditExpenseModalProps) {
  const [paymentMethod, setPaymentMethod] = useState(expense.paymentMethod);
  const [installments, setInstallments] = useState(expense.installments || 1);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/despesas/${expense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: expense.date,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          paymentMethod,
          dueDate: expense.dueDate,
          installments: paymentMethod === "cartao_credito" ? installments : 1,
          supplierId: expense.supplierId,
          notes: expense.notes,
        }),
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        alert("Erro ao atualizar despesa");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar despesa");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "2rem",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem", fontWeight: 700 }}>
          Ajustar Despesa
        </h2>

        <div style={{ marginBottom: "1rem" }}>
          <p style={{ fontSize: "0.9rem", color: "#666", margin: "0 0 0.5rem 0" }}>
            <strong>Descrição:</strong> {expense.description}
          </p>
          <p style={{ fontSize: "0.9rem", color: "#666", margin: "0 0 0.5rem 0" }}>
            <strong>Valor:</strong> R$ {expense.amount.toFixed(2)}
          </p>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Forma de Pagamento
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "0.9rem",
              boxSizing: "border-box",
            }}
          >
            {PAYMENTS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {paymentMethod === "cartao_credito" && (
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Número de Parcelas
            </label>
            <select
              value={installments}
              onChange={(e) => setInstallments(parseInt(e.target.value))}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "0.9rem",
                boxSizing: "border-box",
              }}
            >
              {[1, 2, 3, 4, 5, 6, 10, 12].map((i) => (
                <option key={i} value={i}>
                  {i}x de R$ {(expense.amount / i).toFixed(2)}
                </option>
              ))}
            </select>
            <p style={{ fontSize: "0.8rem", color: "#999", margin: "0.5rem 0 0 0" }}>
              Total: R$ {expense.amount.toFixed(2)}
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              flex: 1,
              padding: "0.75rem",
              backgroundColor: "#f0f0f0",
              border: "none",
              borderRadius: "4px",
              fontWeight: 600,
              cursor: "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              padding: "0.75rem",
              backgroundColor: "#b8891a",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
