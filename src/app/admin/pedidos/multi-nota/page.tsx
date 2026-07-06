import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import NotaMultiPedidoClient from "./NotaMultiPedidoClient";

export default async function NotaMultiPedidoPage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/login");

  const { ids } = await searchParams;
  const idList = (ids || "").split(",").map(s => s.trim()).filter(Boolean);
  if (idList.length < 2) notFound();

  const orders = await prisma.order.findMany({
    where: { id: { in: idList } },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: { product: { select: { name: true, images: true } } },
      },
      installments: { orderBy: { number: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (orders.length < 2) notFound();
  const sameCustomer = orders.every(o => o.user.id === orders[0].user.id);
  if (!sameCustomer) {
    return (
      <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "#c04040" }}>
        Os pedidos selecionados pertencem a clientes diferentes. Selecione pedidos de um único cliente.
      </div>
    );
  }

  return <NotaMultiPedidoClient orders={JSON.parse(JSON.stringify(orders))} />;
}
