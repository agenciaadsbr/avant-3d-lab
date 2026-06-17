import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ExcelImport from "@/components/admin/ExcelImport";

export default async function ImportarPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <a href="/admin" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Admin</a>
        <h1 style={{ color: "#1a1510", fontSize: "1.5rem", fontWeight: 900, marginTop: "0.4rem" }}>Importar Estoque via Excel</h1>
        <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Suba sua planilha e cadastre todos os produtos de uma vez.
        </p>
      </div>
      <ExcelImport categories={categories} />
    </div>
  );
}
