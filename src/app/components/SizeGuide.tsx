"use client";

import { useState } from "react";

type SizeStats = {
  size: string;
  count: number;
  percentage: number;
};

type RecommendationResult = {
  recommendedSize: string;
  stats: SizeStats[];
  similarClientsCount: number;
};

export default function SizeGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bustSize, setBustSize] = useState("");
  const [waistSize, setWaistSize] = useState("");
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/tamanho/recomendacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: parseInt(height),
          weight: parseInt(weight),
          bustSize: bustSize ? parseInt(bustSize) : null,
          waistSize: waistSize ? parseInt(waistSize) : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Erro ao processar");
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Erro na requisição");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "2rem", padding: "0 1rem" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "1rem",
          backgroundColor: isOpen ? "#f0e6d2" : "#FAF6EE",
          border: "2px solid #b8891a",
          color: "#5a4a2a",
          fontSize: "1rem",
          fontWeight: 700,
          cursor: "pointer",
          borderRadius: "8px",
          textAlign: "left",
        }}
      >
        {isOpen ? "▼ Fechar" : "▶ Guia de Tamanho Inteligente"}
      </button>

      {isOpen && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1.5rem",
            backgroundColor: "#FAF6EE",
            borderRadius: "8px",
            border: "1px solid #e0d4c0",
          }}
        >
          <form onSubmit={handleGetRecommendation}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "#5a4a2a" }}>
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Ex: 165"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d4c5b0",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "#5a4a2a" }}>
                  Peso (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ex: 62"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d4c5b0",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "#5a4a2a" }}>
                  Busto (cm) - Opcional
                </label>
                <input
                  type="number"
                  value={bustSize}
                  onChange={(e) => setBustSize(e.target.value)}
                  placeholder="Ex: 87"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d4c5b0",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "#5a4a2a" }}>
                  Cintura (cm) - Opcional
                </label>
                <input
                  type="number"
                  value={waistSize}
                  onChange={(e) => setWaistSize(e.target.value)}
                  placeholder="Ex: 72"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d4c5b0",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: loading ? "#d4c5b0" : "#b8891a",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Analisando..." : "Ver Recomendação"}
            </button>

            {error && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", backgroundColor: "#ffe0e0", color: "#d32f2f", borderRadius: "4px", fontSize: "0.9rem" }}>
                {error}
              </div>
            )}
          </form>

          {result && (
            <div style={{ marginTop: "2rem" }}>
              <div style={{ marginBottom: "1.5rem", padding: "1.5rem", backgroundColor: "white", borderRadius: "8px", border: "2px solid #b8891a" }}>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#7a6a4a", marginBottom: "0.5rem" }}>Tamanho Recomendado:</p>
                <p style={{ margin: 0, fontSize: "2.5rem", fontWeight: 700, color: "#b8891a" }}>{result.recommendedSize}</p>
              </div>

              {result.similarClientsCount > 0 && (
                <div>
                  <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#5a4a2a", marginBottom: "1rem" }}>
                    Baseado em {result.similarClientsCount} clientes com medidas similares:
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                    {result.stats.map((stat) => (
                      <div
                        key={stat.size}
                        style={{
                          padding: "1rem",
                          backgroundColor: stat.size === result.recommendedSize ? "#f0e6d2" : "white",
                          border: `2px solid ${stat.size === result.recommendedSize ? "#b8891a" : "#d4c5b0"}`,
                          borderRadius: "8px",
                          textAlign: "center",
                        }}
                      >
                        <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#5a4a2a", marginBottom: "0.5rem" }}>
                          Tamanho {stat.size}
                        </p>
                        <div style={{ width: "100%", height: "8px", backgroundColor: "#e0d4c0", borderRadius: "4px", overflow: "hidden", marginBottom: "0.5rem" }}>
                          <div
                            style={{
                              height: "100%",
                              backgroundColor: "#b8891a",
                              width: `${stat.percentage}%`,
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                        <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#b8891a" }}>{stat.percentage}%</p>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#7a6a4a", marginTop: "0.25rem" }}>({stat.count} clientes)</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
