import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientesClient from "./ClientesClientV2";

export const dynamic = 'force-dynamic';
// v3

export default async function ClientesPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const clientes = await prisma.user.findMany({
    where: { role: "customer" },
    select: {
      id: true, name: true, email: true, phone: true, createdAt: true,
      _count: { select: { orders: true } },
      orders: {
        where: { status: { not: "cancelled" } },
        select: { total: true, amountPaid: true, paymentStatus: true, createdAt: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Enriquecer com dados calculados
  const clientesEnriquecidos = clientes.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt.toISOString(),
    totalPedidos: c.orders.length, // já filtrado sem cancelados
    totalGasto: c.orders.reduce((s, o) => s + o.total, 0),
    totalPago: c.orders.reduce((s, o) => s + o.amountPaid, 0),
    saldoAberto: c.orders.reduce((s, o) => s + (o.total - o.amountPaid), 0),
    ultimaCompra: c.orders.length > 0
      ? c.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt.toISOString()
      : null,
  }));

  return <ClientesClient clientes={clientesEnriquecidos} />;
}
