import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CadernoClient from "./CadernoClient";

export const dynamic = 'force-dynamic';

export default async function CadernoPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const clientsWithDebts = await prisma.order.groupBy({
    by: ["userId"],
    where: { paymentMethod: "caderno", paymentStatus: { not: "paid" }, status: { not: "cancelled" } },
    _sum: { total: true },
    _count: { id: true },
  });

  const clientIds = clientsWithDebts.map(c => c.userId);
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

      <CadernoClient clientsData={clientsWithDebts.map(c => ({
        userId: c.userId,
        client: clientMap[c.userId],
        totalDevido: c._sum.total || 0,
        pedidosCount: c._count.id
      }))} />
    </div>
  );
}
