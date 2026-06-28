import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const { id } = await params;
  const [product, categories, allProducts, kitItems] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany(),
    prisma.product.findMany({ where: { active: true }, select: { id: true, name: true, price: true } }),
    prisma.kitItem.findMany({ where: { kitId: id }, include: { product: true } }),
  ]);

  if (!product) notFound();

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem", backgroundColor: "#FAF6EE", minHeight: "100vh" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <a href="/admin/produtos" style={{ color: "#b8891a", fontSize: "0.875rem", textDecoration: "none" }}>← Produtos</a>
        <h1 style={{ color: "#1a1510", fontSize: "1.6rem", fontWeight: 900, marginTop: "0.3rem" }}>Editar Produto</h1>
        <p style={{ color: "#9a8060", fontSize: "0.875rem", marginTop: "0.2rem" }}>{product.name}</p>
      </div>
      <ProductForm categories={categories} product={product} allProducts={allProducts} kitItems={kitItems} />
    </div>
  );
}
