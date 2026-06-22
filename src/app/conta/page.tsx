import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando", confirmed: "Confirmado", shipped: "Enviado",
  delivered: "Entregue", cancelled: "Cancelado", "try-on": "Home Try-On",
};
const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#fff8e1", color: "#b8891a" },
  confirmed: { bg: "#e8f4fd", color: "#1a6a9a" },
  shipped:   { bg: "#f0e8ff", color: "#6a30b8" },
  delivered: { bg: "#e8f8e8", color: "#1a8a2a" },
  cancelled: { bg: "#fee8e8", color: "#c04040" },
  "try-on":  { bg: "#fce8ff", color: "#8a1ab8" },
};

export default async function ContaPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { name: true, email: true, phone: true, createdAt: true },
  });

  const orders = await prisma.order.findMany({
    where: { userId: (session.user as any).id },
    include: { items: { include: { product: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalGasto = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

  return (
    <div style={{ backgroundColor: "#FAF6EE", minHeight: "100vh", padding: "2rem 1.25rem" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#1a1510" }}>Minha Conta</h1>
          <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.2rem" }}>Olá, {user?.name?.split(" ")[0] || "cliente"}!</p>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.875rem", marginBottom: "1.5rem" }}>
          {[
            { emoji: "🛍️", label: "Pedidos", value: orders.length },
            { emoji: "💰", label: "Total gasto", value: formatCurrency(totalGasto) },
            { emoji: "✅", label: "Entregues", value: orders.filter(o => o.status === "delivered").length },
          ].map(k => (
            <div key={k.label} style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "0.875rem", padding: "1rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>{k.emoji}</div>
              <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "#1a1510" }}>{k.value}</div>
              <div style={{ fontSize: "0.7rem", color: "#9a8060", marginTop: "0.1rem" }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem", marginBottom: "1.5rem" }}>
          {[
            { emoji: "📦", label: "Meus Pedidos", desc: "Acompanhe seus pedidos", href: "/conta/pedidos" },
            { emoji: "👤", label: "Dados Pessoais", desc: "Nome, e-mail e telefone", href: "/conta/perfil" },
          ].map(m => (
            <Link key={m.href} href={m.href} style={{ textDecoration: "none", backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", padding: "1.25rem", display: "flex", gap: "0.875rem", alignItems: "center" }}>
              <span style={{ fontSize: "1.75rem" }}>{m.emoji}</span>
              <div>
                <p style={{ fontWeight: 700, color: "#1a1510", fontSize: "0.95rem" }}>{m.label}</p>
                <p style={{ fontSize: "0.75rem", color: "#9a8060", marginTop: "0.1rem" }}>{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Pedidos recentes */}
        <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", borderRadius: "1rem", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderBottom: "1px solid rgba(140,100,20,0.08)", backgroundColor: "#FAF6EE" }}>
            <h2 style={{ fontWeight: 800, color: "#1a1510", fontSize: "0.95rem" }}>Pedidos Recentes</h2>
            <Link href="/conta/pedidos" style={{ color: "#b8891a", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none" }}>Ver todos →</Link>
          </div>
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <p style={{ color: "#9a8060", marginBottom: "0.75rem" }}>Você ainda não fez nenhum pedido.</p>
              <Link href="/produtos" style={{ color: "#b8891a", fontWeight: 700, textDecoration: "none", fontSize: "0.875rem" }}>Ver coleção →</Link>
            </div>
          ) : orders.map(order => {
            const sc = STATUS_COLOR[order.status] || { bg: "#f0f0f0", color: "#666" };
            return (
              <div key={order.id} style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(140,100,20,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "0.72rem", color: "#9a8060" }}>#{order.id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
                  <p style={{ fontWeight: 700, color: "#1a1510", marginTop: "0.2rem" }}>{formatCurrency(order.total)}</p>
                  <p style={{ fontSize: "0.75rem", color: "#9a8060", marginTop: "0.1rem" }}>
                    {order.items[0]?.size || order.items[0]?.product.name || "—"}
                    {order.items.length > 1 && ` +${order.items.length - 1}`}
                  </p>
                </div>
                <span style={{ backgroundColor: sc.bg, color: sc.color, fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.625rem", borderRadius: "999px", whiteSpace: "nowrap" }}>
                  {STATUS_LABEL[order.status] || order.status}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/api/auth/signout" style={{ color: "#9a8060", fontSize: "0.8rem", textDecoration: "none" }}>Sair da conta</Link>
        </div>
      </div>
    </div>
  );
}
