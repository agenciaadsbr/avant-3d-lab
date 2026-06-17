"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { slugify } from "@/lib/utils";

type Category = { id: string; name: string; slug: string; _count: { products: number } };

const inp = {
  padding: "0.6rem 0.875rem",
  backgroundColor: "#fff",
  border: "1px solid rgba(140,100,20,0.2)",
  borderRadius: "0.625rem",
  color: "#1a1510",
  fontSize: "0.9rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box" as const,
};

export default function CategoryManager({ categories: initial }: { categories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), slug: slugify(newName.trim()) }),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error); return; }
    const cat = await res.json();
    setCategories([...categories, { ...cat, _count: { products: 0 } }].sort((a, b) => a.name.localeCompare(b.name)));
    setNewName("");
    router.refresh();
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    const res = await fetch(`/api/admin/categorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), slug: slugify(editName.trim()) }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setCategories(categories.map(c => c.id === id ? { ...updated, _count: c._count } : c));
    setEditId(null);
    router.refresh();
  };

  const handleDelete = async (id: string, count: number) => {
    if (count > 0) { setError(`Não é possível excluir: há ${count} produto(s) nesta categoria.`); return; }
    if (!confirm("Excluir esta categoria?")) return;
    await fetch(`/api/admin/categorias/${id}`, { method: "DELETE" });
    setCategories(categories.filter(c => c.id !== id));
    router.refresh();
  };

  return (
    <div>
      {/* Create */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.15)", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <h2 style={{ color: "#1a1510", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.875rem" }}>Nova Categoria</h2>
        {error && <p style={{ color: "#c04040", fontSize: "0.8rem", marginBottom: "0.75rem", backgroundColor: "#fff0f0", padding: "0.5rem 0.75rem", borderRadius: "0.5rem" }}>{error}</p>}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            placeholder="Ex: Leggings, Tops, Conjuntos..."
            style={inp}
          />
          <button
            onClick={handleCreate}
            disabled={loading || !newName.trim()}
            style={{ backgroundColor: "#b8891a", color: "#fff", fontWeight: 700, border: "none", borderRadius: "0.625rem", padding: "0 1.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", whiteSpace: "nowrap", opacity: loading || !newName.trim() ? 0.6 : 1 }}>
            <Plus size={16} /> Criar
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ backgroundColor: "#fff", border: "1px solid rgba(140,100,20,0.15)", borderRadius: "1rem", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {categories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#9a8060" }}>
            <p>Nenhuma categoria ainda.</p>
            <p style={{ fontSize: "0.8rem", marginTop: "0.4rem" }}>Crie a primeira acima.</p>
          </div>
        ) : (
          <ul style={{ listStyle: "none" }}>
            {categories.map((cat, i) => (
              <li key={cat.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1.25rem", borderBottom: i < categories.length - 1 ? "1px solid rgba(140,100,20,0.08)" : "none" }}>

                {editId === cat.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleEdit(cat.id); if (e.key === "Escape") setEditId(null); }}
                      autoFocus
                      style={{ ...inp, flex: 1 }}
                    />
                    <button onClick={() => handleEdit(cat.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#2a8a2a", padding: 6 }}><Check size={16} /></button>
                    <button onClick={() => setEditId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9a8060", padding: 6 }}><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "#1a1510", fontWeight: 700, fontSize: "0.95rem" }}>{cat.name}</p>
                      <p style={{ color: "#9a8060", fontSize: "0.75rem", marginTop: "1px" }}>
                        /{cat.slug} · {cat._count.products} produto{cat._count.products !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button onClick={() => { setEditId(cat.id); setEditName(cat.name); setError(""); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#9a8060", padding: 6 }}
                      title="Editar">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(cat.id, cat._count.products)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#c08080", padding: 6 }}
                      title="Excluir">
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p style={{ color: "#9a8060", fontSize: "0.78rem", marginTop: "1rem", textAlign: "center" }}>
        💡 Dica: crie todas as categorias antes de importar produtos pelo Excel.
      </p>
    </div>
  );
}
