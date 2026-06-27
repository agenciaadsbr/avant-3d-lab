import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SaleManagerClient from "./SaleManagerClient";

export const dynamic = "force-dynamic";

export default async function SaleManagerPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const today = new Date();
  const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
  const hundredTwentyDaysAgo = new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000);

  const [upcomingSaleProducts, activeSaleProducts] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        createdAt: { gte: sixtyDaysAgo, lte: today },
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: {
        active: true,
        onSale: true,
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div style={{ backgroundColor: "#FAF6EE", minHeight: "100vh", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <a href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</a>
          <h1 style={{ color: "#1a1510", fontSize: "2rem", fontWeight: 900, marginTop: "0.3rem" }}>🔥 Gerenciador de SALE</h1>
          <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.5rem" }}>Autorize descontos para peças antigas no estoque</p>
        </div>

        <SaleManagerClient
          upcomingSaleProducts={upcomingSaleProducts}
          activeSaleProducts={activeSaleProducts}
        />
      </div>
    </div>
  );
}
