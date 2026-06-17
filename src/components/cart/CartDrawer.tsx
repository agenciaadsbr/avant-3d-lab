"use client";

import { useCart } from "@/store/cart";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCart();
  if (!isOpen) return null;

  return (
    <>
      <div onClick={closeCart} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(3px)", zIndex: 40 }} />
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: "100%", maxWidth: 380, backgroundColor: "#FAF6EE", zIndex: 50, display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(140,100,20,0.15)", boxShadow: "-8px 0 40px rgba(0,0,0,0.1)" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: "1px solid rgba(140,100,20,0.1)", backgroundColor: "#F0E8D0" }}>
          <h2 style={{ color: "#1a1510", fontWeight: 700, fontSize: "1rem" }}>
            Carrinho <span style={{ color: "#b8891a" }}>({items.length})</span>
          </h2>
          <button onClick={closeCart} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "#9a8060", display: "flex" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem" }}>
          {items.length === 0 ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.875rem", color: "#9a8060" }}>
              <ShoppingBag size={44} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: "0.9rem" }}>Seu carrinho está vazio</p>
              <button onClick={closeCart} style={{ color: "#b8891a", background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 700 }}>
                Explorar coleção
              </button>
            </div>
          ) : (
            <ul style={{ display: "flex", flexDirection: "column", gap: "1rem", listStyle: "none" }}>
              {items.map((item) => (
                <li key={item.id} style={{ display: "flex", gap: "0.875rem", paddingBottom: "1rem", borderBottom: "1px solid rgba(140,100,20,0.08)" }}>
                  <div style={{ width: 68, height: 68, backgroundColor: "#EDE4CC", borderRadius: "0.625rem", overflow: "hidden", flexShrink: 0, border: "1px solid rgba(140,100,20,0.1)" }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#1a1510", fontSize: "0.875rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                    <p style={{ color: "#9a8060", fontSize: "0.75rem", marginTop: 2 }}>{item.size} · {item.color}</p>
                    <p style={{ color: "#b8891a", fontWeight: 700, fontSize: "0.9rem", marginTop: 4 }}>{formatCurrency(item.price)}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid rgba(140,100,20,0.2)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9a8060" }}>
                        <Minus size={11} />
                      </button>
                      <span style={{ color: "#1a1510", fontWeight: 700, fontSize: "0.875rem", minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid rgba(140,100,20,0.2)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9a8060" }}>
                        <Plus size={11} />
                      </button>
                      <button onClick={() => removeItem(item.id)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#c09080", display: "flex", padding: 4 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(140,100,20,0.12)", padding: "1.25rem", backgroundColor: "#F0E8D0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <span style={{ color: "#7a6030", fontSize: "0.875rem" }}>Subtotal</span>
              <span style={{ color: "#b8891a", fontWeight: 900, fontSize: "1.15rem" }}>{formatCurrency(total())}</span>
            </div>
            <p style={{ color: "#9a8060", fontSize: "0.75rem", marginBottom: "1rem" }}>Frete calculado no checkout</p>
            <Link href="/checkout" onClick={closeCart} style={{ display: "block", width: "100%", backgroundColor: "#b8891a", color: "#fff", textAlign: "center", fontWeight: 900, padding: "0.875rem", borderRadius: "0.75rem", textDecoration: "none", fontSize: "0.95rem", boxShadow: "0 4px 14px rgba(140,100,20,0.25)" }}>
              Finalizar Compra
            </Link>
            <button onClick={closeCart} style={{ display: "block", width: "100%", textAlign: "center", color: "#9a8060", background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", marginTop: "0.75rem", padding: "0.4rem" }}>
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
