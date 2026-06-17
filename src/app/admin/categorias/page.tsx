import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function CategoriasPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <a href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</a>
        <h1 style={{ color: "#1a1510", fontSize: "1.5rem", fontWeight: 900, marginTop: "0.4rem" }}>Categorias</h1>
        <p style={{ color: "#9a8060", fontSize: "0.85rem", marginTop: "0.2rem" }}>
          Crie as categorias antes de cadastrar os produtos.
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
