"use client";
import { useState } from "react";

export default function ImportarDadosPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [rolling, setRolling] = useState(false);

  const resetCompleto = async () => {
    if (!confirm("ATENÇÃO: Isso apaga TODOS os produtos, pedidos e gastos. Clientes, categorias e fornecedores ficam. Confirma?")) return;
    setLoading(true);
    const res = await fetch("/api/admin/importar-dados/reset", { method: "POST" });
    const data = await res.json();
    setResult({ ...data, isReset: true });
    setLoading(false);
  };

  const limparCaderno = async () => {
    if (!confirm("Apagar todos os pedidos do caderno em aberto lançados manualmente?")) return;
    setLoading(true);
    const res = await fetch("/api/admin/importar-dados/limpar-caderno", { method: "POST" });
    const data = await res.json();
    setResult({ ...data, isClearCaderno: true });
    setLoading(false);
  };

  const rollback = async () => {
    if (!confirm("Desfazer a importação? Remove os pedidos e gastos criados agora.")) return;
    setRolling(true);
    const res = await fetch("/api/admin/importar-dados/rollback", { method: "POST" });
    const data = await res.json();
    setResult({ ...data, isRollback: true });
    setRolling(false);
  };

  const executar = async () => {
    if (!confirm("Confirma a importação? Isso vai criar produtos, vendas e gastos no sistema.")) return;
    setLoading(true);
    const res = await fetch("/api/admin/importar-dados", { method: "POST" });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "3rem auto", padding: "2rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>
      <a href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</a>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#1a1510", margin: "0.5rem 0 1.5rem" }}>Importar Dados das Planilhas</h1>

      {!result ? (
        <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.15)", borderRadius: "1rem", padding: "1.5rem" }}>
          <p style={{ color: "#5a4a2a", marginBottom: "0.75rem", lineHeight: 1.7 }}>Esta importação vai:</p>
          <ul style={{ color: "#5a4a2a", fontSize: "0.875rem", lineHeight: 2, paddingLeft: "1.25rem", marginBottom: "1.5rem" }}>
            <li>✅ Criar/atualizar <strong>54 produtos</strong> com SKU automático</li>
            <li>✅ Importar <strong>16 gastos</strong> da loja</li>
            <li>✅ Importar <strong>93 vendas</strong> históricas</li>
            <li>✅ Criar clientes novos automaticamente</li>
          </ul>
          <button onClick={resetCompleto} disabled={loading}
            style={{ backgroundColor: "#1a1510", color: "#fff", border: "none", borderRadius: "0.75rem", padding: "0.75rem 2rem", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: "0.75rem" }}>
            ⚠️ Reset completo (produtos, pedidos e gastos)
          </button>
          <button onClick={limparCaderno} disabled={loading}
            style={{ backgroundColor: "#fee8e8", border: "1px solid rgba(192,64,64,0.25)", color: "#c04040", borderRadius: "0.75rem", padding: "0.75rem 2rem", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: "0.75rem" }}>
            🗑️ Limpar pedidos do caderno (lançados manualmente)
          </button>
          <button onClick={executar} disabled={loading}
            style={{ backgroundColor: loading ? "#d4b870" : "#b8891a", color: "#fff", border: "none", borderRadius: "0.75rem", padding: "0.875rem 2rem", fontSize: "1rem", fontWeight: 900, cursor: loading ? "not-allowed" : "pointer", width: "100%" }}>
            {loading ? "⏳ Importando... aguarde" : "▶ Executar Importação"}
          </button>
        </div>
      ) : (
        <div style={{ backgroundColor: result.ok ? "#e8f8e8" : "#fee8e8", border: `1px solid ${result.ok ? "rgba(26,138,42,0.2)" : "rgba(192,64,64,0.2)"}`, borderRadius: "1rem", padding: "1.5rem" }}>
          <p style={{ fontWeight: 900, fontSize: "1.1rem", color: result.ok ? "#1a6a2a" : "#c04040", marginBottom: "1rem" }}>
            {result.ok ? "✅ Importação concluída!" : "❌ Erro na importação"}
          </p>
          {result.ok && !result.isRollback && (
            <>
              <ul style={{ color: "#3a5a3a", fontSize: "0.9rem", lineHeight: 2, paddingLeft: "1.25rem" }}>
                <li>📦 <strong>{result.products}</strong> produtos criados/atualizados</li>
                <li>💸 <strong>{result.expenses}</strong> gastos importados</li>
                <li>🛍️ <strong>{result.sales}</strong> vendas importadas</li>
                <li>👥 <strong>{result.clients}</strong> clientes novos criados</li>
              </ul>
              <button onClick={rollback} disabled={rolling}
                style={{ marginTop: "1rem", backgroundColor: "#fee8e8", border: "1px solid rgba(192,64,64,0.3)", color: "#c04040", borderRadius: "0.625rem", padding: "0.5rem 1rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
                {rolling ? "Desfazendo..." : "↩ Desfazer importação"}
              </button>
            </>
          )}
          {result.isReset && (
            <p style={{ color: "#1a6a2a", fontSize: "0.9rem" }}>
              ✅ Reset concluído! Produtos, pedidos e gastos apagados. Agora clique em <strong>"Executar Importação"</strong>.
            </p>
          )}
          {result.isClearCaderno && (
            <p style={{ color: "#1a6a2a", fontSize: "0.9rem" }}>
              🗑️ <strong>{result.deleted}</strong> pedidos do caderno removidos. Agora pode rodar a importação!
            </p>
          )}
          {result.isRollback && (
            <ul style={{ color: "#3a5a3a", fontSize: "0.9rem", lineHeight: 2, paddingLeft: "1.25rem" }}>
              <li>🗑️ <strong>{result.deletedOrders}</strong> pedidos removidos</li>
              <li>🗑️ <strong>{result.deletedExpenses}</strong> gastos removidos</li>
            </ul>
          )}
          {result.errors?.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ fontWeight: 700, color: "#c04040", marginBottom: "0.5rem" }}>Avisos:</p>
              {result.errors.map((e: string, i: number) => (
                <p key={i} style={{ fontSize: "0.8rem", color: "#c04040" }}>• {e}</p>
              ))}
            </div>
          )}
          {result.error && <p style={{ color: "#c04040", marginTop: "0.75rem", fontSize: "0.875rem" }}>{result.error}</p>}
          <a href="/admin" style={{ display: "inline-block", marginTop: "1.25rem", color: "#b8891a", fontWeight: 700, textDecoration: "none" }}>← Voltar ao painel</a>
        </div>
      )}
    </div>
  );
}
