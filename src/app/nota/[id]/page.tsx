import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import NotaPublicaClient from "./NotaPublicaClient";

export default async function NotaPublicaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, phone: true } },
      address: true,
      items: {
        include: { product: { select: { name: true } } },
      },
      installments: { orderBy: { number: "asc" } },
    },
  });

  if (!order) notFound();

  return <NotaPublicaClient order={JSON.parse(JSON.stringify(order))} />;
}
