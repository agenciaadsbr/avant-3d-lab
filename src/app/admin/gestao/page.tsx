"use client";
import { useEffect, useState } from "react";
import { ROLE_LABELS, AdminRole } from "@/lib/permissions";

type AdminUser = { id: string; name: string | null; email: string; adminRole: string | null; createdAt: string };

function fmt(r: string | null) {
  return ROLE_LABELS[(r as AdminRole) || "admin"] || r || "Administrador";
}

export default function GestaoPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "vendedor">("vendedor");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/gestao").then(r => r.json()).then(d => { setAdmins(d.admins || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!email.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/gestao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), adminRole: role }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg({ text: `Acesso concedido para ${email}`, ok: true });
      setEmail("");
      load();
    } else {
      setMsg({ text: data.error || "Erro ao salvar", ok: false });
    }
    setSaving(false);
    setTimeout(() => setMsg(null), 4000);
  };

  const handleChangeRole = async (id: string, newRole: string) => {
    const admin = admins.find(a => a.id === id);
    if (!admin) return;
    await fetch("/api/admin/gestao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: admin.email, adminRole: newRole }),
    });
    load();
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remover acesso admin deste usuário?")) return;
    setRemovingId(id);
    const res = await fetch("/api/admin/gestao", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    else load();
    setRemovingId(null);
  };

  const roleColors: Record<string, { bg: string; color: string }> = {
    admin:    { bg: "#fff8e1", color: "#b8891a" },
    vendedor: { bg: "#e8f4fd", color: "#1a6a9a" },
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>
      <a href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</a>
      <h1 style={{ color: "#1a1510", fontSize: "1.75rem", fontWeight: 900, marginTop: "0.2rem" }}>⚙️ Gestão de Acesso</h1>
      <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.2rem", marginBottom: "2rem" }}>
        Controle quem acessa o painel administrativo e com qual perfil
      </p>

      {/* Perfis */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { role: "admin", label: "Administrador", desc: "Acesso total ao painel — financeiro, analytics, marketing, gestão de usuários e tudo mais.", color: "#b8891a" },
          { role: "vendedor", label: "Vendedor", desc: "Acesso limitado — pode criar pedidos, gerenciar produtos, caderno e clientes. Não vê dados financeiros.", color: "#1a6a9a" },
        ].map(p => (
          <div key={p.role} style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ backgroundColor: roleColors[p.role]?.bg, color: roleColors[p.role]?.color, fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 999 }}>{p.label}</span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#5a4a2a", lineHeight: 1.5 }}>{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Adicionar usuário */}
      <div style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(140,100,20,0.1)", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#1a1510", marginBottom: "1rem" }}>Conceder acesso</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.75rem", alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#5a4a2a", marginBottom: "0.3rem" }}>E-mail do usuário</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(140,100,20,0.2)", fontSize: "0.9rem", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#5a4a2a", marginBottom: "0.3rem" }}>Perfil</label>
            <select value={role} onChange={e => setRole(e.target.value as any)}
              style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(140,100,20,0.2)", fontSize: "0.9rem", fontWeight: 700, backgroundColor: "#fff" }}>
              <option value="vendedor">Vendedor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button onClick={handleAdd} disabled={saving || !email.trim()}
            style={{ padding: "0.75rem 1.25rem", backgroundColor: "#b8891a", color: "#fff", border: "none", borderRadius: "0.5rem", fontWeight: 700, cursor: "pointer", opacity: (!email.trim() || saving) ? 0.5 : 1 }}>
            {saving ? "..." : "Conceder"}
          </button>
        </div>
        {msg && (
          <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.75rem", backgroundColor: msg.ok ? "#e8f8e8" : "#fee8e8", borderRadius: "0.5rem", fontSize: "0.85rem", color: msg.ok ? "#1a7a2a" : "#c04040", fontWeight: 600 }}>
            {msg.text}
          </div>
        )}
        <p style={{ fontSize: "0.75rem", color: "#9a8060", marginTop: "0.75rem" }}>
          Se o e-mail já tiver conta na Access Fit, o acesso será concedido imediatamente. Caso contrário, um acesso será criado e o usuário pode definir senha pelo fluxo de login.
        </p>
      </div>

      {/* Lista de admins */}
      <div style={{ backgroundColor: "#fff", borderRadius: "1rem", border: "1px solid rgba(140,100,20,0.1)", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.5rem", backgroundColor: "#FAF6EE", borderBottom: "1px solid rgba(140,100,20,0.08)" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1a1510", margin: 0 }}>
            Usuários com acesso ao painel ({admins.length})
          </h2>
        </div>

        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#9a8060" }}>Carregando...</div>
        ) : admins.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#9a8060" }}>Nenhum usuário</div>
        ) : admins.map((a, i) => {
          const rc = roleColors[a.adminRole || "admin"] || roleColors.admin;
          return (
            <div key={a.id} style={{ padding: "1rem 1.5rem", borderBottom: i < admins.length - 1 ? "1px solid rgba(140,100,20,0.06)" : "none", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "#1a1510", fontSize: "0.95rem" }}>{a.name || "—"}</div>
                <div style={{ fontSize: "0.8rem", color: "#9a8060" }}>{a.email}</div>
              </div>
              <select
                value={a.adminRole || "admin"}
                onChange={e => handleChangeRole(a.id, e.target.value)}
                style={{ padding: "0.4rem 0.75rem", borderRadius: "0.5rem", border: `1px solid ${rc.color}`, backgroundColor: rc.bg, color: rc.color, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
              >
                <option value="admin">Administrador</option>
                <option value="vendedor">Vendedor</option>
              </select>
              <button onClick={() => handleRemove(a.id)} disabled={removingId === a.id}
                style={{ padding: "0.4rem 0.75rem", backgroundColor: "#fff", border: "1px solid rgba(192,64,64,0.3)", color: "#c04040", borderRadius: "0.5rem", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                {removingId === a.id ? "..." : "Remover"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
