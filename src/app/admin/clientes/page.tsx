import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientesClient from "./ClientesClient";

export const dynamic = 'force-dynamic';

export default async function ClientesPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const clientes = await prisma.user.findMany({
    where: { role: "customer" },
    select: {
      id: true, name: true, email: true, phone: true, createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { name: "asc" },
  });

  return <ClientesClient clientes={clientes as any} />;
}
