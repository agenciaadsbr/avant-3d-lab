import { prisma } from "@/lib/prisma";

export function parseSizeStock(json: string | null | undefined): Record<string, number> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

// Decrementa o estoque de um produto ao registrar uma venda.
// Se o produto tiver estoque por tamanho configurado e o item informar o tamanho,
// desconta daquele tamanho especificamente (pode ficar negativo = vendido além do previsto,
// mesma convenção usada para componentes de conjunto). Senão, desconta do total (comportamento legado).
export async function decrementProductStock(productId: string, quantity: number, size?: string | null) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { sizeStock: true } });
  const sizeStock = parseSizeStock(product?.sizeStock);
  const hasSizeStock = Object.keys(sizeStock).length > 0;

  if (hasSizeStock && size && size in sizeStock) {
    sizeStock[size] = (sizeStock[size] || 0) - quantity;
    const total = Object.values(sizeStock).reduce((a, b) => a + b, 0);
    await prisma.product.update({
      where: { id: productId },
      data: { sizeStock: JSON.stringify(sizeStock), stock: total },
    });
  } else {
    await prisma.product.updateMany({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });
  }
}

// Restaura o estoque de um produto ao cancelar/excluir um pedido. Inverso de decrementProductStock.
export async function restoreProductStock(productId: string, quantity: number, size?: string | null) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { sizeStock: true } });
  const sizeStock = parseSizeStock(product?.sizeStock);
  const hasSizeStock = Object.keys(sizeStock).length > 0;

  if (hasSizeStock && size && size in sizeStock) {
    sizeStock[size] = (sizeStock[size] || 0) + quantity;
    const total = Object.values(sizeStock).reduce((a, b) => a + b, 0);
    await prisma.product.update({
      where: { id: productId },
      data: { sizeStock: JSON.stringify(sizeStock), stock: total },
    });
  } else {
    await prisma.product.updateMany({
      where: { id: productId },
      data: { stock: { increment: quantity } },
    });
  }
}
