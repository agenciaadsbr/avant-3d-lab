"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

function fmt(n: number) { return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

const inp = { padding: "0.6rem 0.875rem", border: "1px solid rgba(140,100,20,0.25)", borderRadius: "0.625rem", fontSize: "0.875rem", backgroundColor: "#FAF6EE", outline: "none", width: "100%", boxSizing: "border-box" as const };
const label = { fontSize: "0.75rem", color: "#9a8060", fontWeight: 700, display: "block" as const, marginBottom: "0.3rem" };

type Props = {
  gastosMarketing: any[]; totalMarketing: number;
  campanhas: any[]; cupons: any[];
  topClientes: any[]; anivEste: any[]; anivProximo: any[];
  inativos: any[]; tryOnEmAndamento: number; tryOnTotal: number;
  mesAtual: string; mesProximo: string;
};

const TABS = [
  { key: "visao", label: "📊 Visão Geral" },
  { key: "campanhas", label: "📣 Campanhas" },
  { key: "top", label: "🏆 Top Clientes" },
  { key: "aniversarios", label: "🎂 Aniversários" },
  { key: "cupons", label: "🎟️ Cupons" },
  { key: "inativos", label: "😴 Inativos" },
  { key: "tryon", label: "👗 Home Try-On" },
];

const CHANNELS = ["instagram","whatsapp","email","tiktok","indicação","outro"];

export default function MarketingClient({ gastosMarketing, totalMarketing, campanhas: campanhasInit, cupons: cuponsInit, topClientes, anivEste, anivProximo, inativos, tryOnEmAndamento, tryOnTotal, mesAtual, mesProximo }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState("visao");
  const [campanhas, setCampanhas] = useState(campanhasInit);
  const [cupons, setCupons] = useState(cuponsInit);
  const [saving, setSaving] = useState(false);

  // Campanha form
  const [showCampForm, setShowCampForm] = useState(false);
  const [campForm, setCampForm] = useState({ name: "", channel: "instagram", startDate: "", endDate: "", budget: "", result: "", notes: "" });

  // Cupom form
  const [showCupForm, setShowCupForm] = useState(false);
  const [cupForm, setCupForm] = useState({ code: "", discount: "", type: "percent", maxUses: "", expiresAt: "" });

  const saveCampanha = async () => {
    if (!campForm.name || !campForm.startDate) return;
    setSaving(true);
    const res = await fetch("/api/admin/campanhas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(campForm) });
    if (res.ok) { const d = await res.json(); setCampanhas(p => [d, ...p]); setShowCampForm(false); setCampForm({ name: "", channel: "instagram", startDate: "", endDate: "", budget: "", result: "", notes: "" }); }
    setSaving(false);
  };

  const saveCupom = async () => {
    if (!cupForm.code || !cupForm.discount) return;
    setSaving(true);
    const res = await fetch("/api/admin/cupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cupForm) });
    if (res.ok) { const d = await res.json(); setCupons(p => [d, ...p]); setShowCupForm(false); setCupForm({ code: "", discount: "", type: "percent", maxUses: "", expiresAt: "" }); }
    setSaving(false);
  };

  const toggleCupom = async (id: string, active: boolean) => {
    const res = await fetch(`/api/admin/cupons/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
    if (res.ok) setCupons(p => p.map(c => c.id === id ? { ...c, active: !active } : c));
  };

  const deleteCupom = async (id: string) => {
    if (!confirm("Excluir cupom?")) return;
    await fetch(`/api/admin/cupons/${id}`, { method: "DELETE" });
    setCupons(p => p.filter(c => c.id !== id));
  };

  const whatsappLista = (clientes: any[], msg: string) => {
    const lista = clientes.filter(c => c.phone).map(c => {
      const phone = c.phone.replace(/\D/g, "");
      const ddi = phone.startsWith("55") ? phone : `55${phone}`;
      return `https://wa.me/${ddi}?text=${encodeURIComponent(msg.replace("{nome}", c.name?.split(" ")[0] || ""))}`;
    });
    if (lista.length === 0) return alert("Nenhum cliente com telefone cadastrado.");
    lista.forEach((url, i) => setTimeout(() => window.open(url, "_blank"), i * 300));
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#1a1510" }}>📣 Marketing</h1>
        <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.2rem" }}>Campanhas, clientes e estratégias</p>
      </div>

      {/* Abas */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", overflowX: "auto", borderBottom: "2px solid rgba(140,100,20,0.1)" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: "0.55rem 1rem", border: "none", borderBottom: `3px solid ${tab === t.key ? "#b8891a" : "transparent"}`, backgroundColor: "transparent", fontWeight: 700, fontSize: "0.82rem", color: tab === t.key ? "#b8891a" : "#9a8060", cursor: "pointer", whiteSpace: "nowrap", marginBottom: "-2px" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* VISÃO GERAL */}
      {tab === "visao" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
            {[
              { emoji: "💸", label: "Gasto em marketing", value: fmt(totalMarketing), sub: `${gastosMarketing.length} lançamentos` },
              { emoji: "📣", label: "Campanhas", value: campanhas.length, sub: `${campanhas.filter(c => c.active).length} ativas` },
              { emoji: "🎟️", label: "Cupons ativos", value: cupons.filter(c => c.active).length, sub: `${cupons.length} total` },
              { emoji: "😴", label: "Clientes inativos", value: inativos.length, sub: "sem compra há 60+ dias" },
            ].map(k => (
              <div key={k.label} style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1rem 1.25rem" }}>
                <div style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>{k.emoji}</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#1a1510" }}>{k.value}</div>
                <div style={{ fontSize: "0.72rem", color: "#9a8060", marginTop: "0.15rem", fontWeight: 700 }}>{k.label}</div>
                <div style={{ fontSize: "0.65rem", color: "#b8a080" }}>{k.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.25rem" }}>
            <h3 style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a1510", marginBottom: "1rem" }}>💸 Últimos gastos com marketing</h3>
            {gastosMarketing.length === 0 ? <p style={{ color: "#b8a080", fontSize: "0.875rem" }}>Nenhum gasto com marketing ainda.</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead><tr style={{ borderBottom: "1px solid rgba(140,100,20,0.1)" }}>
                  {["Data","Descrição","Fornecedor","Valor"].map(h => <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", color: "#9a8060", fontSize: "0.72rem", fontWeight: 700 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {gastosMarketing.slice(0, 10).map(g => (
                    <tr key={g.id} style={{ borderBottom: "1px solid rgba(140,100,20,0.05)" }}>
                      <td style={{ padding: "0.5rem 0.75rem", color: "#9a8060", fontSize: "0.8rem" }}>{new Date(g.date).toLocaleDateString("pt-BR")}</td>
                      <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>{g.description}</td>
                      <td style={{ padding: "0.5rem 0.75rem", color: "#7a6030", fontSize: "0.8rem" }}>{g.supplier?.name || "—"}</td>
                      <td style={{ padding: "0.5rem 0.75rem", fontWeight: 700, color: "#c04040" }}>-{fmt(g.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* CAMPANHAS */}
      {tab === "campanhas" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <p style={{ color: "#9a8060", fontSize: "0.875rem" }}>{campanhas.length} campanhas registradas</p>
            <button onClick={() => setShowCampForm(v => !v)} style={{ backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.625rem", padding: "0.5rem 1rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
              + Nova Campanha
            </button>
          </div>
          {showCampForm && (
            <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.15)", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem" }}>
              <p style={{ fontWeight: 800, color: "#1a1510", marginBottom: "1rem" }}>Nova Campanha</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div><label style={label}>Nome *</label><input style={inp} placeholder="Ex: Lançamento Coleção Inverno" value={campForm.name} onChange={e => setCampForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><label style={label}>Canal</label>
                  <select style={inp} value={campForm.channel} onChange={e => setCampForm(f => ({ ...f, channel: e.target.value }))}>
                    {CHANNELS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={label}>Início *</label><input type="date" style={inp} value={campForm.startDate} onChange={e => setCampForm(f => ({ ...f, startDate: e.target.value }))} /></div>
                <div><label style={label}>Fim</label><input type="date" style={inp} value={campForm.endDate} onChange={e => setCampForm(f => ({ ...f, endDate: e.target.value }))} /></div>
                <div><label style={label}>Orçamento (R$)</label><input type="number" style={inp} placeholder="0,00" value={campForm.budget} onChange={e => setCampForm(f => ({ ...f, budget: e.target.value }))} /></div>
                <div><label style={label}>Resultado</label><input style={inp} placeholder="Ex: 15 vendas, R$2.000" value={campForm.result} onChange={e => setCampForm(f => ({ ...f, result: e.target.value }))} /></div>
                <div style={{ gridColumn: "1/-1" }}><label style={label}>Observações</label><textarea rows={2} style={{ ...inp, resize: "vertical" }} value={campForm.notes} onChange={e => setCampForm(f => ({ ...f, notes: e.target.value }))} /></div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.875rem" }}>
                <button onClick={saveCampanha} disabled={saving} style={{ backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.625rem", padding: "0.5rem 1.25rem", fontWeight: 700, cursor: "pointer" }}>{saving ? "..." : "Salvar"}</button>
                <button onClick={() => setShowCampForm(false)} style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.2)", color: "#9a8060", borderRadius: "0.625rem", padding: "0.5rem 0.875rem", fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
              </div>
            </div>
          )}
          {campanhas.length === 0 ? (
            <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", padding: "3rem", textAlign: "center", color: "#b8a080" }}>
              <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📣</p>
              <p>Nenhuma campanha ainda. Crie a primeira!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {campanhas.map(c => (
                <div key={c.id} style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.3rem" }}>
                      <span style={{ fontWeight: 700, color: "#1a1510" }}>{c.name}</span>
                      <span style={{ backgroundColor: "#FAF6EE", color: "#7a6030", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 999 }}>{c.channel}</span>
                      <span style={{ backgroundColor: c.active ? "#e8f8e8" : "#fee8e8", color: c.active ? "#1a8a2a" : "#c04040", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 999 }}>{c.active ? "Ativa" : "Encerrada"}</span>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "#9a8060" }}>
                      {new Date(c.startDate).toLocaleDateString("pt-BR")}{c.endDate ? ` → ${new Date(c.endDate).toLocaleDateString("pt-BR")}` : ""}
                      {c.budget ? ` · Orçamento: ${fmt(c.budget)}` : ""}
                    </p>
                    {c.result && <p style={{ fontSize: "0.8rem", color: "#5a4a2a", marginTop: "0.25rem" }}>📊 {c.result}</p>}
                    {c.notes && <p style={{ fontSize: "0.75rem", color: "#9a8060", fontStyle: "italic" }}>📝 {c.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TOP CLIENTES */}
      {tab === "top" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ color: "#9a8060", fontSize: "0.875rem" }}>Top 15 clientes por valor gasto</p>
            <button onClick={() => whatsappLista(topClientes, "Olá {nome}! 🌟 Você é uma das nossas clientes especiais da Access Fit! Temos novidades incríveis esperando por você. Dá uma olhada: https://access-fit-xi.vercel.app")}
              style={{ backgroundColor: "#25D366", color: "#fff", border: "none", borderRadius: "0.625rem", padding: "0.5rem 1rem", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
              📲 Enviar mensagem para todas
            </button>
          </div>
          <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead><tr style={{ backgroundColor: "#FAF6EE" }}>
                {["#","Cliente","Pedidos","Total gasto",""].map(h => <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#9a8060", fontSize: "0.72rem", fontWeight: 700, borderBottom: "1px solid rgba(140,100,20,0.1)" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {topClientes.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid rgba(140,100,20,0.05)" }}>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 900, color: i < 3 ? "#b8891a" : "#9a8060" }}>#{i + 1}</td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#1a1510" }}>{c.name}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#5a4a2a" }}>{c.numPedidos}</td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#b8891a" }}>{fmt(c.totalGasto)}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {c.phone && (
                        <a href={`https://wa.me/55${c.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                          style={{ backgroundColor: "#25D366", color: "#fff", fontWeight: 700, fontSize: "0.72rem", padding: "0.3rem 0.625rem", borderRadius: "0.4rem", textDecoration: "none" }}>
                          💬 WhatsApp
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANIVERSÁRIOS */}
      {tab === "aniversarios" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {[
            { titulo: `🎂 Aniversariantes de ${mesAtual}`, lista: anivEste },
            { titulo: `🎁 Aniversariantes de ${mesProximo}`, lista: anivProximo },
          ].map(({ titulo, lista }) => (
            <div key={titulo} style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
              <div style={{ backgroundColor: "#FAF6EE", padding: "0.875rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a1510" }}>{titulo}</h3>
                {lista.length > 0 && (
                  <button onClick={() => whatsappLista(lista, `Olá {nome}! 🎂🌟 A equipe Access Fit deseja a você um feliz aniversário! Que seu dia seja incrível! Temos uma surpresa especial para você. Venha nos visitar! 💛`)}
                    style={{ backgroundColor: "#25D366", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.35rem 0.75rem", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>
                    📲 Parabenizar todas
                  </button>
                )}
              </div>
              {lista.length === 0 ? (
                <p style={{ padding: "1.5rem", color: "#b8a080", fontSize: "0.875rem", textAlign: "center" }}>
                  Nenhum aniversariante. Cadastre datas de nascimento nos perfis dos clientes.
                </p>
              ) : (
                <div>
                  {lista.map((c: any) => (
                    <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1.25rem", borderBottom: "1px solid rgba(140,100,20,0.05)" }}>
                      <div>
                        <p style={{ fontWeight: 700, color: "#1a1510", fontSize: "0.875rem" }}>{c.name}</p>
                        <p style={{ fontSize: "0.72rem", color: "#9a8060" }}>
                          {c.birthDate ? `Dia ${new Date(c.birthDate).getDate()}` : "—"}
                        </p>
                      </div>
                      {c.phone && (
                        <a href={`https://wa.me/55${c.phone.replace(/\D/g,"")}?text=${encodeURIComponent(`Olá ${c.name?.split(" ")[0]}! 🎂 A equipe Access Fit deseja a você um feliz aniversário! 💛`)}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ backgroundColor: "#25D366", color: "#fff", fontWeight: 700, fontSize: "0.72rem", padding: "0.3rem 0.625rem", borderRadius: "0.4rem", textDecoration: "none" }}>
                          💬 Parabenizar
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div style={{ backgroundColor: "#fff8e1", border: "1px solid rgba(184,137,26,0.2)", borderRadius: "1rem", padding: "1rem 1.25rem" }}>
            <p style={{ fontSize: "0.8rem", color: "#856404" }}>
              💡 Para ver aniversariantes aqui, cadastre a <strong>data de nascimento</strong> no perfil de cada cliente em <a href="/admin/clientes" style={{ color: "#b8891a" }}>/admin/clientes</a>.
            </p>
          </div>
        </div>
      )}

      {/* CUPONS */}
      {tab === "cupons" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
            <p style={{ color: "#9a8060", fontSize: "0.875rem" }}>{cupons.length} cupons cadastrados · {cupons.filter(c => c.active).length} ativos</p>
            <button onClick={() => setShowCupForm(v => !v)} style={{ backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.625rem", padding: "0.5rem 1rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
              + Novo Cupom
            </button>
          </div>
          {showCupForm && (
            <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.15)", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem" }}>
              <p style={{ fontWeight: 800, color: "#1a1510", marginBottom: "1rem" }}>Novo Cupom</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div><label style={label}>Código *</label><input style={inp} placeholder="EX: BEMVINDA10" value={cupForm.code} onChange={e => setCupForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} /></div>
                <div><label style={label}>Tipo</label>
                  <select style={inp} value={cupForm.type} onChange={e => setCupForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="percent">% Porcentagem</option>
                    <option value="fixed">R$ Valor fixo</option>
                  </select>
                </div>
                <div><label style={label}>Desconto {cupForm.type === "percent" ? "(%)" : "(R$)"} *</label><input type="number" style={inp} placeholder={cupForm.type === "percent" ? "10" : "30"} value={cupForm.discount} onChange={e => setCupForm(f => ({ ...f, discount: e.target.value }))} /></div>
                <div><label style={label}>Limite de usos</label><input type="number" style={inp} placeholder="Sem limite" value={cupForm.maxUses} onChange={e => setCupForm(f => ({ ...f, maxUses: e.target.value }))} /></div>
                <div><label style={label}>Validade</label><input type="date" style={inp} value={cupForm.expiresAt} onChange={e => setCupForm(f => ({ ...f, expiresAt: e.target.value }))} /></div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.875rem" }}>
                <button onClick={saveCupom} disabled={saving} style={{ backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.625rem", padding: "0.5rem 1.25rem", fontWeight: 700, cursor: "pointer" }}>{saving ? "..." : "Criar cupom"}</button>
                <button onClick={() => setShowCupForm(false)} style={{ backgroundColor: "#FAF6EE", border: "1px solid rgba(140,100,20,0.2)", color: "#9a8060", borderRadius: "0.625rem", padding: "0.5rem 0.875rem", fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
              </div>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {cupons.map(c => (
              <div key={c.id} style={{ backgroundColor: "#fff", border: `1px solid ${c.active ? "rgba(140,100,20,0.1)" : "rgba(192,64,64,0.15)"}`, borderRadius: "1rem", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", opacity: c.active ? 1 : 0.65 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: "1rem", color: "#1a1510", backgroundColor: "#FAF6EE", padding: "0.25rem 0.75rem", borderRadius: "0.4rem" }}>{c.code}</span>
                    <span style={{ fontWeight: 700, color: "#b8891a" }}>{c.type === "percent" ? `${c.discount}% off` : `R$${c.discount} off`}</span>
                    <span style={{ backgroundColor: c.active ? "#e8f8e8" : "#fee8e8", color: c.active ? "#1a8a2a" : "#c04040", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 999 }}>{c.active ? "Ativo" : "Inativo"}</span>
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "#9a8060", marginTop: "0.25rem" }}>
                    {c.usedCount} uso{c.usedCount !== 1 ? "s" : ""}{c.maxUses ? ` de ${c.maxUses}` : ""}
                    {c.expiresAt ? ` · Expira ${new Date(c.expiresAt).toLocaleDateString("pt-BR")}` : ""}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button onClick={() => toggleCupom(c.id, c.active)} style={{ backgroundColor: c.active ? "#fee8e8" : "#e8f8e8", border: "none", borderRadius: "0.4rem", padding: "0.35rem 0.75rem", fontWeight: 700, fontSize: "0.75rem", color: c.active ? "#c04040" : "#1a8a2a", cursor: "pointer" }}>
                    {c.active ? "Desativar" : "Ativar"}
                  </button>
                  <button onClick={() => deleteCupom(c.id)} style={{ backgroundColor: "#fee8e8", border: "none", borderRadius: "0.4rem", padding: "0.35rem 0.5rem", color: "#c04040", cursor: "pointer" }}>🗑️</button>
                </div>
              </div>
            ))}
            {cupons.length === 0 && <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", padding: "3rem", textAlign: "center", color: "#b8a080" }}>Nenhum cupom ainda.</div>}
          </div>
        </div>
      )}

      {/* CLIENTES INATIVOS */}
      {tab === "inativos" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ color: "#9a8060", fontSize: "0.875rem" }}>{inativos.length} clientes sem compra há 60+ dias</p>
            <button onClick={() => whatsappLista(inativos, "Olá {nome}! 😊 Sentimos sua falta na Access Fit! Temos novidades incríveis esperando por você. Que tal dar uma olhada? 👗✨")}
              style={{ backgroundColor: "#25D366", color: "#fff", border: "none", borderRadius: "0.625rem", padding: "0.5rem 1rem", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
              📲 Reativar todas
            </button>
          </div>
          <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
            {inativos.length === 0 ? <p style={{ padding: "2rem", textAlign: "center", color: "#b8a080" }}>Nenhum cliente inativo. 🎉</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead><tr style={{ backgroundColor: "#FAF6EE" }}>
                  {["Cliente","Última compra","Dias sem comprar",""].map(h => <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#9a8060", fontSize: "0.72rem", fontWeight: 700, borderBottom: "1px solid rgba(140,100,20,0.1)" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {inativos.map((c: any, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(140,100,20,0.05)" }}>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#1a1510" }}>{c.name}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#9a8060", fontSize: "0.8rem" }}>{new Date(c.ultimaCompra).toLocaleDateString("pt-BR")}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span style={{ backgroundColor: c.diasSemCompra > 90 ? "#fee8e8" : "#fff8e1", color: c.diasSemCompra > 90 ? "#c04040" : "#856404", fontWeight: 700, fontSize: "0.8rem", padding: "0.2rem 0.5rem", borderRadius: 999 }}>
                          {c.diasSemCompra}d
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {c.phone && (
                          <a href={`https://wa.me/55${c.phone.replace(/\D/g,"")}?text=${encodeURIComponent(`Olá ${c.name?.split(" ")[0]}! 😊 Sentimos sua falta na Access Fit! Temos novidades incríveis. Venha conferir! 👗`)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ backgroundColor: "#25D366", color: "#fff", fontWeight: 700, fontSize: "0.72rem", padding: "0.3rem 0.625rem", borderRadius: "0.4rem", textDecoration: "none" }}>
                            💬
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* HOME TRY-ON */}
      {tab === "tryon" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <div style={{ backgroundColor: "#fce8ff", border: "1px solid rgba(138,26,184,0.2)", borderRadius: "1rem", padding: "1.5rem" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#5a0a7a", marginBottom: "0.5rem" }}>👗 EM ANDAMENTO</p>
            <p style={{ fontSize: "2rem", fontWeight: 900, color: "#8a1ab8" }}>{tryOnEmAndamento}</p>
            <p style={{ fontSize: "0.8rem", color: "#9a8060", marginTop: "0.25rem" }}>peças na rua agora</p>
            <a href="/admin/pedidos?status=try-on" style={{ display: "inline-block", marginTop: "1rem", color: "#8a1ab8", fontWeight: 700, fontSize: "0.82rem", textDecoration: "none", backgroundColor: "#fff", padding: "0.4rem 0.875rem", borderRadius: "0.5rem" }}>
              Ver pedidos →
            </a>
          </div>
          <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.5rem" }}>
            <h3 style={{ fontWeight: 800, fontSize: "0.95rem", color: "#1a1510", marginBottom: "1.25rem" }}>📊 Como funciona</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { label: "Taxa de conversão", desc: "Disponível após mais registros via sistema", color: "#b8a080" },
                { label: "Taxa de devolução", desc: "Disponível após mais registros via sistema", color: "#b8a080" },
                { label: "Taxa da logística", desc: "R$ 30,00 cobrado na devolução", color: "#5a4a2a" },
                { label: "Prazo máximo", desc: "48 horas para retorno", color: "#5a4a2a" },
              ].map(k => (
                <div key={k.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(140,100,20,0.06)" }}>
                  <span style={{ fontSize: "0.82rem", color: "#7a6030" }}>{k.label}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: k.color }}>{k.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
