export function isSaleEligible(createdAt: Date): boolean {
  const daysSinceCreation = Math.floor(
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSinceCreation >= 60;
}

export function calculateSalePrice(price: number): number {
  return Math.round(price * 0.8 * 100) / 100; // 20% de desconto
}

export function getSaleInfo(product: { price: number; createdAt: Date }) {
  if (!isSaleEligible(product.createdAt)) {
    return null;
  }
  return {
    salePrice: calculateSalePrice(product.price),
    discount: 20,
  };
}
