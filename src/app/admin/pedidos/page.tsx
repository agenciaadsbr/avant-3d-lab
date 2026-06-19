import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PedidosClient from "./PedidosClient";

export const dynamic = 'force-dynamic';

export default async function PedidosPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: { include: { product: { select: { id: true, name: true } } } },
      installments: { orderBy: { number: "asc" } },
    },
  });

  return <PedidosClient orders={orders as any} />;
}
