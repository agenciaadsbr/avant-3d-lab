import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import KitsClient from "./KitsClient";

export const dynamic = "force-dynamic";

export default async function KitsPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const kits = await prisma.product.findMany({
    where: { isKit: true },
    include: {
      category: true,
      kitItems: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const allProducts = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, name: true, price: true },
  });

  return (
    <div style={{ backgroundColor: "#FAF6EE", minHeight: "100vh", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <a href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</a>
          <h1 style={{ color: "#1a1510", fontSize: "2rem", fontWeight: 900, marginTop: "0.3rem" }}>📦 Gerenciar Kits</h1>
          <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.5rem" }}>Crie e gerencie composições de produtos</p>
        </div>

        <KitsClient kits={kits} allProducts={allProducts} />
      </div>
    </div>
  );
}
