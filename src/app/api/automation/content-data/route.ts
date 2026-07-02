export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.AUTOMATION_API_KEY) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const now = new Date();
  const sete_dias_atras = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Busca todos os produtos ativos
  const produtos = await prisma.product.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      category: true,
      stock: true,
      images: true,
      slug: true,
    },
  });

  // Busca todos os itens vendidos nos últimos 7 dias (pedidos não cancelados)
  const itens7d = await prisma.orderItem.findMany({
    where: {
      order: {
        status: { not: "cancelled" },
        createdAt: { gte: sete_dias_atras },
      },
    },
    select: { productId: true, quantity: true },
  });

  // Busca a última venda de cada produto
  const ultimasVendas = await prisma.orderItem.findMany({
    where: {
      order: { status: { not: "cancelled" } },
      productId: { in: produtos.map(p => p.id) },
    },
    select: { productId: true, order: { select: { createdAt: true } } },
    orderBy: { order: { createdAt: "desc" } },
    distinct: ["productId"],
  });

  const ultimaVendaMap = new Map(
    ultimasVendas.map(i => [i.productId, i.order.createdAt])
  );

  const vendas7dMap = new Map<string, number>();
  for (const item of itens7d) {
    vendas7dMap.set(item.productId, (vendas7dMap.get(item.productId) || 0) + item.quantity);
  }

  const resultado = produtos.map(p => {
    const ultimaVenda = ultimaVendaMap.get(p.id);
    const diasSemVenda = ultimaVenda
      ? Math.floor((now.getTime() - ultimaVenda.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    let imagens: string[] = [];
    if (Array.isArray(p.images)) {
      imagens = p.images as string[];
    } else if (typeof p.images === "string") {
      try { imagens = JSON.parse(p.images); } catch {}
    }

    return {
      sku: p.slug || p.id,
      nome: p.name,
      categoria: p.category || "sem-categoria",
      estoque_atual: p.stock,
      vendas_7d: vendas7dMap.get(p.id) || 0,
      dias_sem_venda: diasSemVenda,
      imagem_url: imagens[0] || null,
    };
  });

  return NextResponse.json({ produtos: resultado });
}
