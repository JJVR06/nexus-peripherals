"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import {
  createProduct,
  deleteProduct,
  listCategories,
  listProducts,
  updateProduct,
} from "@/lib/repository";
import { ProductImage } from "@/components/ProductImage";
import { Modal } from "@/components/admin/Modal";
import { ProductForm } from "@/components/admin/ProductForm";
import { formatPHP } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = () => listProducts().then(setProducts);

  useEffect(() => {
    refresh();
    listCategories().then(setCategories);
  }, []);

  const filtered = useMemo(() => {
    if (!products) return null;
    return products.filter((p) => {
      if (cat && p.categorySlug !== cat) return false;
      if (query) {
        const hay = `${p.name} ${p.brand}`.toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [products, query, cat]);

  const handleSave = async (data: Omit<Product, "id">) => {
    setBusy(true);
    if (editing) await updateProduct(editing.id, data);
    else await createProduct(data);
    await refresh();
    setBusy(false);
    setEditing(null);
    setCreating(false);
  };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Delete "${p.brand} ${p.name}"? This cannot be undone.`)) return;
    await deleteProduct(p.id);
    refresh();
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black">Products</h1>
          <p className="text-sm text-muted">
            {products ? `${products.length} products` : "Loading…"}
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn btn-primary">
          <Plus size={16} /> Add product
        </button>
      </header>

      {/* toolbar */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input className="input !pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" />
        </div>
        <select className="input max-w-52" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="" className="bg-surface">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug} className="bg-surface">{c.name}</option>
          ))}
        </select>
      </div>

      {/* table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="p-3 font-semibold">Product</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Price</th>
                <th className="p-3 font-semibold">Stock</th>
                <th className="p-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!filtered ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted">No products found.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border-soft last:border-0 hover:bg-surface-2/50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <ProductImage
                          swatch={p.swatch}
                          categorySlug={p.categorySlug}
                          brand={p.brand}
                          name={p.name}
                          images={p.images}
                          className="h-11 w-11 shrink-0 rounded-lg"
                          iconClassName="h-5 w-5"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.name}</p>
                          <p className="text-xs text-muted">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 capitalize text-muted">{p.categorySlug}</td>
                    <td className="p-3">
                      <span className="font-semibold">{formatPHP(p.price)}</span>
                      {p.compareAtPrice && (
                        <span className="ml-1 text-xs text-faint line-through">{formatPHP(p.compareAtPrice)}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={p.stock <= 0 ? "text-danger" : p.stock <= 10 ? "text-warning" : "text-success"}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => setEditing(p)} className="btn btn-ghost h-9 w-9 !px-0" aria-label="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(p)} className="btn btn-ghost h-9 w-9 !px-0 text-danger" aria-label="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(creating || editing) && (
        <Modal
          wide
          title={editing ? "Edit product" : "Add product"}
          onClose={() => {
            if (busy) return;
            setEditing(null);
            setCreating(false);
          }}
        >
          <ProductForm
            product={editing ?? undefined}
            categories={categories}
            onSave={handleSave}
            onCancel={() => {
              setEditing(null);
              setCreating(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
