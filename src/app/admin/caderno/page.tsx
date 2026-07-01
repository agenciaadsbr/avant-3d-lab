import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CadernoClient from "./CadernoClient";

export const dynamic = 'force-dynamic';

export default async function CadernoPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  // Busca pedidos em aberto com amountPaid para calcular saldo real
  const pedidosAbertos = await prisma.order.findMany({
    where: { paymentMethod: "caderno", paymentStatus: { not: "paid" }, status: { not: "cancelled" } },
    select: { userId: true, total: true, amountPaid: true, createdAt: true, dueDate: true },
    orderBy: { createdAt: "desc" },
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Agrupa por cliente calculando saldo real, última compra e atraso
  const porCliente: Record<string, { totalDevido: number; count: number; ultimaCompra: Date; maiorAtraso: number; temVencimento: boolean }> = {};
  for (const p of pedidosAbertos) {
    if (!porCliente[p.userId]) porCliente[p.userId] = { totalDevido: 0, count: 0, ultimaCompra: p.createdAt, maiorAtraso: 0, temVencimento: false };
    porCliente[p.userId].totalDevido += p.total - p.amountPaid;
    porCliente[p.userId].count += 1;
    if (p.createdAt > porCliente[p.userId].ultimaCompra) porCliente[p.userId].ultimaCompra = p.createdAt;
    if (p.dueDate) {
      porCliente[p.userId].temVencimento = true;
      const atraso = Math.floor((hoje.getTime() - new Date(p.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      if (atraso > porCliente[p.userId].maiorAtraso) porCliente[p.userId].maiorAtraso = atraso;
    }
  }

  const clientIds = Object.keys(porCliente);
  const clients = await prisma.user.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true, email: true, phone: true },
  });

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>
      <div style={{ marginBottom: "2rem" }}>
        <a href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</a>
        <h1 style={{ color: "#1a1510", fontSize: "1.75rem", fontWeight: 900, marginTop: "0.2rem" }}>📒 Caderno</h1>
        <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.2rem" }}>Consolidar e parcelar pagamentos</p>
      </div>

      <CadernoClient clientsData={clientIds.map(id => ({
        userId: id,
        client: clientMap[id],
        totalDevido: porCliente[id].totalDevido,
        pedidosCount: porCliente[id].count,
        ultimaCompra: porCliente[id].ultimaCompra.toISOString(),
        maiorAtraso: porCliente[id].maiorAtraso,
        temVencimento: porCliente[id].temVencimento,
      })).sort((a, b) => b.maiorAtraso - a.maiorAtraso || b.totalDevido - a.totalDevido)} />
    </div>
  );
}
