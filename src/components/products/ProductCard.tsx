"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { formatCurrency, parseJson } from "@/lib/utils";
import { useCart } from "@/store/cart";

type Product = {
  id: string; name: string; slug: string; price: number;
  compareAt: number | null; images: string; sizes: string;
  colors: string; category: { name: string };
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const images = parseJson<string[]>(product.images, []);
  const sizes  = parseJson<string[]>(product.sizes, []);
  const colors = parseJson<string[]>(product.colors, []);
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ productId: product.id, name: product.name, price: product.price, image: images[0] || "", size: sizes[0] || "Único", color: colors[0] || "Padrão", quantity: 1 });
    openCart();
  };

  return (
    <Link href={`/produtos/${product.slug}`} style={{ textDecoration: "none", display: "block" }} className="product-card-link">
      <div style={{ position: "relative", overflow: "hidden", borderRadius: "0.875rem", aspectRatio: "3/4", backgroundColor: "#F0E8D0", border: "1px solid rgba(140,100,20,0.12)", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }} className="product-card-img">
        {images[0] ? (
          <img src={images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "1rem" }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="17" stroke="#c9a227" strokeWidth="1" opacity="0.4"/><path d="M12 24 C12 18 15 13 18 13 C21 13 24 18 24 24" stroke="#c9a227" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/></svg>
            <span style={{ color: "#c9a227", fontSize: "0.65rem", fontWeight: 600, textAlign: "center", opacity: 0.6 }}>{product.name}</span>
          </div>
        )}

        {discount && (
          <div style={{ position: "absolute", top: 8, left: 8, backgroundColor: "#b8891a", color: "#fff", fontSize: "0.68rem", fontWeight: 900, padding: "3px 8px", borderRadius: "999px", lineHeight: 1.5, whiteSpace: "nowrap" }}>
            -{discount}%
          </div>
        )}

        <button onClick={handleAddToCart} className="product-card-btn"
          style={{ position: "absolute", bottom: 8, left: 8, right: 8, backgroundColor: "rgba(250,246,238,0.95)", color: "#b8891a", fontWeight: 700, padding: "0.55rem", borderRadius: "0.625rem", border: "1px solid rgba(140,100,20,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", fontSize: "0.8rem", cursor: "pointer", opacity: 0, transition: "opacity 0.2s" }}>
          <ShoppingBag size={13} /> Adicionar
        </button>
      </div>

      <div style={{ marginTop: "0.625rem", padding: "0 2px" }}>
        <p style={{ fontSize: "0.7rem", color: "#b8891a", fontWeight: 600 }}>{product.category.name}</p>
        <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1a1510", marginTop: "2px", overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical" as const, WebkitLineClamp: 2 }}>
          {product.name}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.375rem" }}>
          <span style={{ fontSize: "1rem", fontWeight: 900, color: "#b8891a" }}>{formatCurrency(product.price)}</span>
          {product.compareAt && <span style={{ fontSize: "0.8rem", color: "#9a8060", textDecoration: "line-through" }}>{formatCurrency(product.compareAt)}</span>}
        </div>
      </div>

      <style>{`.product-card-link:hover .product-card-btn { opacity: 1 !important; } .product-card-link:hover .product-card-img { box-shadow: 0 6px 20px rgba(140,100,20,0.15) !important; }`}</style>
    </Link>
  );
}
