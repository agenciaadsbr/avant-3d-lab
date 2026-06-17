"use client";

import { useState, useRef } from "react";
import { Upload, Download, CheckCircle, AlertCircle, Loader } from "lucide-react";

type Category = { id: string; name: string; slug: string };
type RowResult = { row: number; name: string; status: "ok" | "erro"; message?: string };

export default function ExcelImport({ categories }: { categories: Category[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RowResult[] | null>(null);
  const [summary, setSummary] = useState<{ ok: number; erro: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert("Use um arquivo .xlsx, .xls ou .csv");
      return;
    }
    setFile(f);
    setResults(null);
    setSummary(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/importar", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { alert(data.error || "Erro ao importar."); return; }

    setResults(data.results);
    setSummary({ ok: data.results.filter((r: RowResult) => r.status === "ok").length, erro: data.results.filter((r: RowResult) => r.status === "erro").length });
  };

  const downloadTemplate = () => {
    const csv = [
      ["data de entrada", "Codigo", "Produto", "Tamanho", "Categoria", "Qtd Estoque", "Preco unitario", "Total estoque", "Preco venda", "fornecedor"],
      ["17/06/2026", "AF001", "Legging Sculpt Preta", "PP,P,M,G,GG", "Leggings", "30", "80.00", "2400.00", "149.90", "Fornecedor X"],
      ["17/06/2026", "AF002", "Top Nadador Rosa", "PP,P,M,G", "Tops", "20", "45.00", "900.00", "89.90", "Fornecedor Y"],
    ].map(row => row.join(";")).join("\n");

    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-produtos-access-fit.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Categorias aviso */}
      {categories.length === 0 && (
        <div style={{ backgroundColor: "#fff8e8", border: "1px solid rgba(180,130,20,0.3)", borderRadius: "0.875rem", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <AlertCircle size={18} style={{ color: "#b8891a", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ color: "#7a5010", fontWeight: 700, fontSize: "0.875rem" }}>Crie as categorias primeiro!</p>
            <p style={{ color: "#9a7030", fontSize: "0.8rem", marginTop: "0.2rem" }}>
              Antes de importar, vá em <a href="/admin/categorias" style={{ color: "#b8891a", fontWeight: 700 }}>Categorias</a> e crie (ex: Leggings, Tops, Conjuntos, Shorts).
            </p>
          </div>
        </div>
      )}

      {/* Categorias existentes */}
      {categories.length > 0 && (
        <div style={{ backgroundColor: "#f0f8f0", border: "1px solid rgba(40,140,40,0.2)", borderRadius: "0.875rem", padding: "0.875rem 1.25rem", marginBottom: "1.5rem" }}>
          <p style={{ color: "#2a6a2a", fontSize: "0.8rem", fontWeight: 600 }}>
            ✓ Categorias disponíveis: {categories.map(c => c.name).join(", ")}
          </p>
        </div>
      )}

      {/* Instruções */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.15)", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <h2 style={{ color: "#1a1510", fontWeight: 700, fontSize: "1rem", marginBottom: "1rem" }}>Como usar</h2>
        <ol style={{ color: "#5a4a2a", fontSize: "0.875rem", lineHeight: 2, paddingLeft: "1.25rem" }}>
          <li>Baixe o modelo de planilha abaixo</li>
          <li>Preencha com seus produtos (uma linha por produto)</li>
          <li>Salve como <strong>.xlsx</strong> ou <strong>.csv</strong></li>
          <li>Faça o upload aqui</li>
        </ol>

        <div style={{ marginTop: "1rem", backgroundColor: "#FAF6EE", borderRadius: "0.75rem", padding: "0.875rem 1rem", fontSize: "0.8rem", color: "#7a5a20" }}>
          <p style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Colunas da planilha:</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.25rem" }}>
            {[
              { col: "Produto *", desc: "Nome do produto" },
              { col: "Categoria *", desc: "Deve existir no admin" },
              { col: "Preco venda *", desc: "Ex: 149.90" },
              { col: "Qtd Estoque", desc: "Número inteiro" },
              { col: "Tamanho", desc: "Ex: PP,P,M,G,GG" },
              { col: "Codigo", desc: "Código interno do produto" },
              { col: "Preco unitario", desc: "Preço de custo" },
              { col: "Total estoque", desc: "Calculado automaticamente" },
              { col: "fornecedor", desc: "Nome do fornecedor" },
              { col: "data de entrada", desc: "Ex: 17/06/2026" },
            ].map(item => (
              <div key={item.col} style={{ display: "flex", gap: "0.4rem" }}>
                <code style={{ color: "#b8891a", fontWeight: 700, fontSize: "0.78rem" }}>{item.col}</code>
                <span style={{ color: "#9a8060", fontSize: "0.78rem" }}>— {item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={downloadTemplate}
          style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.25)", color: "#b8891a", fontWeight: 700, fontSize: "0.875rem", padding: "0.6rem 1.25rem", borderRadius: "0.625rem", cursor: "pointer" }}>
          <Download size={15} /> Baixar Modelo (.csv)
        </button>
      </div>

      {/* Upload area */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.15)", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          style={{ border: `2px dashed ${file ? "rgba(40,140,40,0.4)" : "rgba(140,100,20,0.25)"}`, borderRadius: "0.875rem", padding: "2.5rem 1rem", textAlign: "center", cursor: "pointer", backgroundColor: file ? "#f0f8f0" : "#FAF6EE", transition: "all 0.2s" }}>
          <Upload size={32} style={{ color: file ? "#2a8a2a" : "#b8891a", margin: "0 auto 0.75rem" }} />
          {file ? (
            <>
              <p style={{ color: "#2a6a2a", fontWeight: 700, fontSize: "0.95rem" }}>✓ {file.name}</p>
              <p style={{ color: "#5a8a5a", fontSize: "0.8rem", marginTop: "0.3rem" }}>
                {(file.size / 1024).toFixed(1)} KB · Clique para trocar
              </p>
            </>
          ) : (
            <>
              <p style={{ color: "#5a4a2a", fontWeight: 600, fontSize: "0.95rem" }}>Arraste o arquivo aqui ou clique para selecionar</p>
              <p style={{ color: "#9a8060", fontSize: "0.8rem", marginTop: "0.3rem" }}>Aceita .xlsx, .xls ou .csv</p>
            </>
          )}
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>

        {file && (
          <button onClick={handleImport} disabled={loading || categories.length === 0}
            style={{ width: "100%", marginTop: "1rem", padding: "0.875rem", backgroundColor: loading ? "#9a7030" : "#b8891a", color: "#fff", fontWeight: 900, border: "none", borderRadius: "0.75rem", cursor: loading ? "not-allowed" : "pointer", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            {loading ? <><Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> Importando...</> : <><Upload size={16} /> Importar Produtos</>}
          </button>
        )}
      </div>

      {/* Results */}
      {summary && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{ backgroundColor: "#f0f8f0", border: "1px solid rgba(40,140,40,0.2)", borderRadius: "0.875rem", padding: "1rem", textAlign: "center" }}>
              <p style={{ color: "#2a8a2a", fontSize: "1.75rem", fontWeight: 900 }}>{summary.ok}</p>
              <p style={{ color: "#4a8a4a", fontSize: "0.8rem", fontWeight: 600 }}>importados com sucesso</p>
            </div>
            <div style={{ backgroundColor: summary.erro > 0 ? "#fff0f0" : "#f8f8f8", border: `1px solid ${summary.erro > 0 ? "rgba(200,60,60,0.2)" : "rgba(140,140,140,0.15)"}`, borderRadius: "0.875rem", padding: "1rem", textAlign: "center" }}>
              <p style={{ color: summary.erro > 0 ? "#c04040" : "#888", fontSize: "1.75rem", fontWeight: 900 }}>{summary.erro}</p>
              <p style={{ color: summary.erro > 0 ? "#c06060" : "#888", fontSize: "0.8rem", fontWeight: 600 }}>com erro</p>
            </div>
          </div>

          {results && results.length > 0 && (
            <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.15)", borderRadius: "1rem", overflow: "hidden" }}>
              <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid rgba(140,100,20,0.1)", backgroundColor: "#FAF6EE" }}>
                <p style={{ color: "#1a1510", fontWeight: 700, fontSize: "0.9rem" }}>Resultado linha a linha</p>
              </div>
              <ul style={{ listStyle: "none", maxHeight: 320, overflowY: "auto" }}>
                {results.map((r, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.7rem 1.25rem", borderBottom: "1px solid rgba(140,100,20,0.06)" }}>
                    {r.status === "ok"
                      ? <CheckCircle size={16} style={{ color: "#2a8a2a", flexShrink: 0 }} />
                      : <AlertCircle size={16} style={{ color: "#c04040", flexShrink: 0 }} />}
                    <span style={{ color: "#666", fontSize: "0.75rem", width: 40, flexShrink: 0 }}>L{r.row}</span>
                    <span style={{ color: "#1a1510", fontSize: "0.875rem", flex: 1 }}>{r.name}</span>
                    {r.message && <span style={{ color: "#c04040", fontSize: "0.75rem" }}>{r.message}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.ok > 0 && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <a href="/admin/produtos" style={{ color: "#b8891a", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
                Ver produtos importados →
              </a>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
