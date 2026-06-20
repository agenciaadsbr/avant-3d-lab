"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/store/cart";
import { formatCurrency, parseJson } from "@/lib/utils";
import Link from "next/link";

type Product = {
  id: string; name: string; slug: string; description: string | null;
  price: number; compareAt: number | null; images: string;
  sizes: string; colors: string; stock: number;
  category: { name: string; slug: string };
};

export default function ProductPage() {
  const params = useParams();
  const { addItem, openCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/produtos/${params.slug}`)
      .then(r => { if (!r.ok) { setNotFoundState(true); setLoading(false); return null; } return r.json(); })
      .then(data => {
        if (!data) return;
        setProduct(data);
        const sizes = parseJson<string[]>(data.sizes, []);
        if (sizes[0]) setSelectedSize(sizes[0]);
        setLoading(false);
      });
  }, [params.slug]);

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FAF6EE" }}>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(184,137,26,0.2)", borderTopColor: "#b8891a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (notFoundState || !product) return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", backgroundColor: "#FAF6EE" }}>
      <p style={{ color: "#5a4a2a" }}>Produto não encontrado.</p>
      <Link href="/produtos" style={{ color: "#b8891a", textDecoration: "none", fontWeight: 700 }}>← Ver todos os produtos</Link>
    </div>
  );

  const images = parseJson<string[]>(product.images, []);
  const sizes = parseJson<string[]>(product.sizes, []);
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : null;
  const outOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    addItem({ productId: product.id, name: product.name, price: product.price, image: images[0] || "", size: selectedSize || "Único", color: "Padrão", quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
    openCart();
  };

  return (
    <div style={{ backgroundColor: "#FAF6EE", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid rgba(140,100,20,0.1)", padding: "0.875rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", fontSize: "0.78rem", color: "#9a8060" }}>
          <Link href="/" style={{ color: "#b8891a", textDecoration: "none" }}>Início</Link>
          <span style={{ margin: "0 0.4rem" }}>›</span>
          <Link href="/produtos" style={{ color: "#b8891a", textDecoration: "none" }}>Coleção</Link>
          <span style={{ margin: "0 0.4rem" }}>›</span>
          <Link href={`/produtos?categoria=${product.category.slug}`} style={{ color: "#b8891a", textDecoration: "none" }}>{product.category.name}</Link>
          <span style={{ margin: "0 0.4rem" }}>›</span>
          <span style={{ color: "#5a4a2a" }}>{product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem", alignItems: "flex-start" }}>

          {/* Galeria */}
          <div>
            <div style={{ borderRadius: "1.25rem", overflow: "hidden", backgroundColor: "#F0E8D0", aspectRatio: "3/4", border: "1px solid rgba(140,100,20,0.1)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              {images[selectedImage] ? (
                <img src={images[selectedImage]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#b8891a", fontSize: "0.875rem", opacity: 0.5 }}>
                  Foto em breve
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.875rem", flexWrap: "wrap" }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    style={{ width: 68, height: 68, borderRadius: "0.625rem", overflow: "hidden", border: `2px solid ${selectedImage === i ? "#b8891a" : "rgba(140,100,20,0.15)"}`, cursor: "pointer", padding: 0, backgroundColor: "#F0E8D0", flexShrink: 0 }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div>
            <p style={{ fontSize: "0.75rem", color: "#b8891a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {product.category.name}
            </p>
            <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 900, color: "#1a1510", marginTop: "0.4rem", lineHeight: 1.2 }}>
              {product.name}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "2rem", fontWeight: 900, color: "#b8891a" }}>{formatCurrency(product.price)}</span>
              {product.compareAt && (
                <>
                  <span style={{ fontSize: "1.1rem", color: "#b8a080", textDecoration: "line-through" }}>{formatCurrency(product.compareAt)}</span>
                  <span style={{ backgroundColor: "rgba(184,137,26,0.12)", color: "#b8891a", fontSize: "0.8rem", fontWeight: 900, padding: "0.2rem 0.7rem", borderRadius: "999px" }}>-{discount}%</span>
                </>
              )}
            </div>

            {outOfStock && (
              <div style={{ marginTop: "0.75rem", padding: "0.6rem 1rem", backgroundColor: "#fee8e8", borderRadius: "0.625rem", fontSize: "0.8rem", color: "#c04040", fontWeight: 700 }}>
                Produto esgotado no momento
              </div>
            )}

            {/* Tamanhos */}
            {sizes.length > 0 && (
              <div style={{ marginTop: "1.75rem" }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#5a4a2a", marginBottom: "0.625rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Tamanho: <span style={{ color: "#b8891a" }}>{selectedSize}</span>
                </p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      style={{ padding: "0.55rem 1.1rem", borderRadius: "0.625rem", border: `2px solid ${selectedSize === size ? "#b8891a" : "rgba(140,100,20,0.2)"}`, backgroundColor: selectedSize === size ? "#b8891a" : "#fff", color: selectedSize === size ? "#fff" : "#5a4a2a", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.15s" }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botão */}
            <button onClick={handleAddToCart} disabled={outOfStock}
              style={{ width: "100%", marginTop: "2rem", padding: "1rem 1.5rem", backgroundColor: added ? "#2a6a2a" : outOfStock ? "#e8e0d0" : "#1a1510", color: added ? "#fff" : outOfStock ? "#9a8060" : "#FAF6EE", fontWeight: 900, fontSize: "1rem", border: "none", borderRadius: "0.875rem", cursor: outOfStock ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "background-color 0.3s", letterSpacing: "0.03em", boxShadow: outOfStock ? "none" : "0 4px 14px rgba(26,21,16,0.25)" }}>
              {added ? "✓ Adicionado ao carrinho!" : outOfStock ? "Esgotado" : "🛍️ Adicionar ao Carrinho"}
            </button>

            {/* WhatsApp */}
            <a href={`https://wa.me/5547999999999?text=Olá! Tenho interesse no produto: ${product.name}`} target="_blank" rel="noopener noreferrer"
              style={{ width: "100%", marginTop: "0.75rem", padding: "0.875rem", backgroundColor: "#25D366", color: "#fff", fontWeight: 800, fontSize: "0.9rem", border: "none", borderRadius: "0.875rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", textDecoration: "none", letterSpacing: "0.02em" }}>
              📲 Perguntar pelo WhatsApp
            </a>

            {/* Descrição */}
            {product.description && (
              <div style={{ marginTop: "1.75rem", padding: "1.25rem", backgroundColor: "#fff", borderRadius: "0.875rem", border: "1px solid rgba(140,100,20,0.1)" }}>
                <h3 style={{ fontSize: "0.72rem", fontWeight: 800, color: "#b8891a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.625rem" }}>Descrição</h3>
                <p style={{ color: "#5a4a2a", fontSize: "0.875rem", lineHeight: 1.75 }}>{product.description}</p>
              </div>
            )}

            {/* Info */}
            <div style={{ marginTop: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { icon: "🚚", title: "Entrega", desc: "Enviamos para todo o Brasil" },
                { icon: "🔄", title: "Troca", desc: "Troca em até 7 dias" },
              ].map(item => (
                <div key={item.title} style={{ padding: "0.875rem", backgroundColor: "#fff", borderRadius: "0.75rem", border: "1px solid rgba(140,100,20,0.1)" }}>
                  <div style={{ fontSize: "1.25rem", marginBottom: "0.3rem" }}>{item.icon}</div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#1a1510" }}>{item.title}</p>
                  <p style={{ fontSize: "0.72rem", color: "#9a8060", marginTop: "0.1rem" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
