"use client";

import Link from "next/link";
import { formatCurrency, parseJson } from "@/lib/utils";
import { useCart } from "@/store/cart";

type Product = {
  id: string; name: string; slug: string; price: number;
  compareAt: number | null; images: string; sizes: string;
  colors: string; stock: number; createdAt?: string;
  category: { name: string };
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const images = parseJson<string[]>(product.images, []);
  const sizes  = parseJson<string[]>(product.sizes, []);
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : null;
  const isNew = product.createdAt ? (Date.now() - new Date(product.createdAt).getTime()) < 1000 * 60 * 60 * 24 * 30 : false;
  const outOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    window.location.href = `/produtos/${product.slug}`;
  };

  return (
    <Link href={`/produtos/${product.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{ borderRadius: "1rem", overflow: "hidden", backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.1)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", transition: "transform 0.2s, box-shadow 0.2s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; }}>

        {/* Foto */}
        <div style={{ position: "relative", aspectRatio: "3/4", backgroundColor: "#F0E8D0", overflow: "hidden" }}>
          {images[0] ? (
            <img src={images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="20" fill="rgba(184,137,26,0.08)"/><path d="M14 28C14 21 17 15 20 15C23 15 26 21 26 28" stroke="#b8891a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/><circle cx="20" cy="11" r="3" stroke="#b8891a" strokeWidth="1.5" opacity="0.5"/></svg>
              <span style={{ color: "#b8891a", fontSize: "0.7rem", fontWeight: 600, opacity: 0.6, textAlign: "center", padding: "0 0.5rem" }}>Foto em breve</span>
            </div>
          )}

          <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", gap: "4px" }}>
            {isNew && !outOfStock && (
              <span style={{ backgroundColor: "#b8891a", color: "#fff", fontSize: "0.65rem", fontWeight: 900, padding: "3px 10px", borderRadius: "999px" }}>Novo</span>
            )}
            {discount && !outOfStock && (
              <span style={{ backgroundColor: "#1a1510", color: "#b8891a", fontSize: "0.65rem", fontWeight: 900, padding: "3px 10px", borderRadius: "999px" }}>-{discount}%</span>
            )}
            {outOfStock && (
              <span style={{ backgroundColor: "rgba(0,0,0,0.55)", color: "#fff", fontSize: "0.65rem", fontWeight: 900, padding: "3px 10px", borderRadius: "999px" }}>Esgotado</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "0.875rem" }}>
          <p style={{ fontSize: "0.68rem", color: "#b8891a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>
            {product.category.name}
          </p>
          <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1a1510", lineHeight: 1.3, marginBottom: "0.5rem", overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical" as const, WebkitLineClamp: 2, minHeight: "2.4em" }}>
            {product.name}
          </p>

          {sizes.length > 0 && (
            <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", marginBottom: "0.625rem" }}>
              {sizes.slice(0, 5).map(s => (
                <span key={s} style={{ fontSize: "0.6rem", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", backgroundColor: "#FAF6EE", color: "#9a8060", border: "1px solid rgba(140,100,20,0.15)" }}>{s}</span>
              ))}
              {sizes.length > 5 && <span style={{ fontSize: "0.6rem", color: "#b8891a", fontWeight: 700 }}>+{sizes.length - 5}</span>}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "#b8891a" }}>{formatCurrency(product.price)}</span>
            {product.compareAt && (
              <span style={{ fontSize: "0.78rem", color: "#b8a080", textDecoration: "line-through" }}>{formatCurrency(product.compareAt)}</span>
            )}
          </div>

          <button onClick={handleAddToCart} disabled={outOfStock}
            style={{ width: "100%", padding: "0.6rem", backgroundColor: outOfStock ? "#e8e0d0" : "#1a1510", color: outOfStock ? "#9a8060" : "#FAF6EE", fontWeight: 800, fontSize: "0.8rem", border: "none", borderRadius: "0.625rem", cursor: outOfStock ? "not-allowed" : "pointer", letterSpacing: "0.03em" }}>
            {outOfStock ? "Esgotado" : "Ver produto"}
          </button>
        </div>
      </div>
    </Link>
  );
}
