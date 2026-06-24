export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const users = await prisma.user.findMany({
    where: { role: "customer" },
    include: { orders: { where: { status: { not: "cancelled" } } } },
    orderBy: { createdAt: "desc" },
  });

  const clients = users.map(u => {
    const orders = u.orders;
    const totalSpent = orders.reduce((s, o) => s + o.total, 0);
    const birthDate = u.birthDate ? new Date(u.birthDate) : null;
    const age = birthDate ? new Date().getFullYear() - birthDate.getFullYear() : null;

    return {
      id: u.id,
      name: u.name || "—",
      email: u.email,
      phone: u.phone || "—",
      birthDate: u.birthDate ? u.birthDate.toISOString().split("T")[0] : "—",
      age,
      totalOrders: orders.length,
      totalSpent,
      lastOrder: orders.length > 0 ? orders[0].createdAt : null,
      joinedAt: u.createdAt,
    };
  });

  return NextResponse.json({
    clients,
    total: clients.length,
    totalRevenue: clients.reduce((s, c) => s + c.totalSpent, 0),
    avgSpent: clients.length > 0 ? clients.reduce((s, c) => s + c.totalSpent, 0) / clients.length : 0,
  });
}
