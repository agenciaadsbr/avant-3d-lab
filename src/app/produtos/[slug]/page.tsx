"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useCart } from "@/store/cart";
import { formatCurrency, parseJson } from "@/lib/utils";
import { ShoppingBag, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAt: number | null;
  images: string;
  sizes: string;
  colors: string;
  category: { name: string; slug: string };
};

export default function ProductPage() {
  const params = useParams();
  const { addItem, openCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/produtos/${params.slug}`)
      .then((r) => {
        if (!r.ok) { setNotFoundState(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setProduct(data);
        const sizes = parseJson<string[]>(data.sizes, []);
        const colors = parseJson<string[]>(data.colors, []);
        if (sizes[0]) setSelectedSize(sizes[0]);
        if (colors[0]) setSelectedColor(colors[0]);
        setLoading(false);
      });
  }, [params.slug]);

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(180,140,30,0.2)", borderTopColor: "#c9a227", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (notFoundState || !product) return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "#555" }}>
      <p>Produto não encontrado.</p>
      <Link href="/produtos" style={{ color: "#c9a227", textDecoration: "none", fontWeight: 700 }}>← Ver todos os produtos</Link>
    </div>
  );

  const images = parseJson<string[]>(product.images, []);
  const sizes = parseJson<string[]>(product.sizes, []);
  const colors = parseJson<string[]>(product.colors, []);
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : null;

  const handleAddToCart = () => {
    addItem({ productId: product.id, name: product.name, price: product.price, image: images[0] || "", size: selectedSize || "Único", color: selectedColor || "Padrão", quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    openCart();
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>
      <Link href="/produtos" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#7a6a4a", fontSize: "0.875rem", textDecoration: "none", marginBottom: "1.5rem" }}>
        <ArrowLeft size={15} /> Voltar
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2.5rem" }}>
        {/* Images */}
        <div>
          <div style={{ borderRadius: "1rem", overflow: "hidden", backgroundColor: "#1a1a1a", aspectRatio: "3/4", border: "1px solid rgba(180,140,30,0.1)" }}>
            {images[selectedImage] ? (
              <img src={images[selectedImage]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#333", fontSize: "0.8rem" }}>
                Sem foto
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  style={{ width: 60, height: 60, borderRadius: "0.5rem", overflow: "hidden", border: `2px solid ${selectedImage === i ? "#c9a227" : "transparent"}`, cursor: "pointer", padding: 0, backgroundColor: "#1a1a1a" }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p style={{ color: "#b8891a", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{product.category.name}</p>
          <h1 style={{ color: "#f0ece0", fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 900, marginTop: "0.4rem", lineHeight: 1.2 }}>{product.name}</h1>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "1.75rem", fontWeight: 900, color: "#c9a227" }}>{formatCurrency(product.price)}</span>
            {product.compareAt && (
              <>
                <span style={{ fontSize: "1rem", color: "#444", textDecoration: "line-through" }}>{formatCurrency(product.compareAt)}</span>
                <span style={{ backgroundColor: "rgba(180,140,30,0.15)", color: "#c9a227", fontSize: "0.75rem", fontWeight: 900, padding: "0.2rem 0.6rem", borderRadius: "999px" }}>-{discount}%</span>
              </>
            )}
          </div>

          {/* Sizes */}
          {sizes.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <p style={{ color: "#9a8a6a", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.6rem" }}>
                TAMANHO: <span style={{ color: "#c9a227" }}>{selectedSize}</span>
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: `2px solid ${selectedSize === size ? "#c9a227" : "rgba(180,140,30,0.2)"}`, backgroundColor: selectedSize === size ? "#c9a227" : "transparent", color: selectedSize === size ? "#0a0a0a" : "#d0c8b0", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {colors.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ color: "#9a8a6a", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.6rem" }}>
                COR: <span style={{ color: "#c9a227" }}>{selectedColor}</span>
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {colors.map((color) => (
                  <button key={color} onClick={() => setSelectedColor(color)}
                    style={{ padding: "0.4rem 0.875rem", borderRadius: "0.5rem", border: `2px solid ${selectedColor === color ? "#c9a227" : "rgba(180,140,30,0.2)"}`, backgroundColor: selectedColor === color ? "rgba(180,140,30,0.1)" : "transparent", color: selectedColor === color ? "#c9a227" : "#9a8a6a", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart */}
          <button onClick={handleAddToCart}
            style={{ width: "100%", marginTop: "2rem", padding: "1rem", backgroundColor: added ? "#2a6a2a" : "#c9a227", color: added ? "#a0f0a0" : "#0a0a0a", fontWeight: 900, fontSize: "1rem", border: "none", borderRadius: "0.875rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "background-color 0.3s" }}>
            {added ? <><Check size={18} /> Adicionado ao carrinho!</> : <><ShoppingBag size={18} /> Adicionar ao Carrinho</>}
          </button>

          {/* Description */}
          {product.description && (
            <div style={{ marginTop: "1.5rem", padding: "1.25rem", backgroundColor: "#1a1a1a", borderRadius: "0.875rem", border: "1px solid rgba(180,140,30,0.1)" }}>
              <h3 style={{ color: "#c9a227", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Descrição</h3>
              <p style={{ color: "#9a8a6a", fontSize: "0.875rem", lineHeight: 1.7 }}>{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
