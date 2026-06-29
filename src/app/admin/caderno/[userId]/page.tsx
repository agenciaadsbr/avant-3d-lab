import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import CadernoDetalheClient from "./CadernoDetalheClient";

export const dynamic = 'force-dynamic';

export default async function CadernoDetalhePage({ params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const { userId } = await params;

  const [user, orders] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, phone: true } }),
    prisma.order.findMany({
      where: { userId, status: { not: "cancelled" } },
      include: { items: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect("/admin/caderno");

  return <CadernoDetalheClient user={user} orders={orders as any} />;
}
