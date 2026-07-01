import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import NotaPedidoClient from "./NotaPedidoClient";

export default async function NotaPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/login");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      address: true,
      items: {
        include: { product: { select: { name: true, images: true } } },
      },
      installments: { orderBy: { number: "asc" } },
    },
  });

  if (!order) notFound();

  return <NotaPedidoClient order={JSON.parse(JSON.stringify(order))} />;
}
