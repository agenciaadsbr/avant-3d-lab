import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export default async function NovoProdutoPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/");

  const [categories, allProducts] = await Promise.all([
    prisma.category.findMany(),
    prisma.product.findMany({ where: { active: true }, select: { id: true, name: true, price: true } }),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <a href="/admin/produtos" className="text-sm text-gray-500 hover:text-pink-600">
          ← Produtos
        </a>
        <h1 className="text-2xl font-black text-gray-900 mt-1">Novo Produto</h1>
      </div>
      <ProductForm categories={categories} allProducts={allProducts} />
    </div>
  );
}
