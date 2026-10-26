"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Category, Product, Spec } from "@/lib/types";
import { slugify } from "@/lib/utils";

type Draft = Omit<Product, "id">;

export function ProductForm({
  product,
  categories,
  onSave,
  onCancel,
}: {
  product?: Product;
  categories: Category[];
  onSave: (data: Draft) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [categorySlug, setCategorySlug] = useState(
    product?.categorySlug ?? categories[0]?.slug ?? "",
  );
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice ? String(product.compareAtPrice) : "",
  );
  const [stock, setStock] = useState(String(product?.stock ?? ""));
  const [rating, setRating] = useState(String(product?.rating ?? "4.5"));
  const [reviewCount, setReviewCount] = useState(String(product?.reviewCount ?? "0"));
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [tags, setTags] = useState((product?.tags ?? []).join(", "));
  const [imageUrl, setImageUrl] = useState(product?.images?.[0] ?? "");
  const [featured, setFeatured] = useState(!!product?.featured);
  const [isNew, setIsNew] = useState(!!product?.isNew);
  const [bestSeller, setBestSeller] = useState(!!product?.bestSeller);
  const [color1, setColor1] = useState(product?.swatch?.[0] ?? "#27e6ff");
  const [color2, setColor2] = useState(product?.swatch?.[1] ?? "#1b3550");
  const [specs, setSpecs] = useState<Spec[]>(
    product?.specs?.length ? product.specs : [{ label: "", value: "" }],
  );
  const [error, setError] = useState("");

  const setSpec = (i: number, key: keyof Spec, val: string) =>
    setSpecs((s) => s.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !brand.trim()) return setError("Name and brand are required.");
    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (!priceNum || priceNum <= 0) return setError("Enter a valid price.");
    if (Number.isNaN(stockNum) || stockNum < 0) return setError("Enter a valid stock quantity.");

    const draft: Draft = {
      slug: product?.slug ?? slugify(`${brand}-${name}`),
      name: name.trim(),
      brand: brand.trim(),
      categorySlug,
      price: priceNum,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      rating: Math.min(5, Math.max(0, Number(rating) || 0)),
      reviewCount: Number(reviewCount) || 0,
      stock: stockNum,
      featured,
      isNew,
      bestSeller,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      shortDescription: shortDescription.trim(),
      description: description.trim() || shortDescription.trim(),
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      images: imageUrl.trim() ? [imageUrl.trim()] : [],
      swatch: [color1, color2],
    };
    onSave(draft);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <L label="Product name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Huntsman V3 Pro" /></L>
        <L label="Brand"><input className="input" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Razer" /></L>
        <L label="Category">
          <select className="input" value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.slug} className="bg-surface">{c.name}</option>
            ))}
          </select>
        </L>
        <L label="Tags (comma separated)"><input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="wireless, tkl" /></L>
        <L label="Price (₱)"><input className="input" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="9995" /></L>
        <L label="Compare-at price (₱, optional)"><input className="input" type="number" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="11995" /></L>
        <L label="Stock"><input className="input" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="25" /></L>
        <L label="Rating (0–5)"><input className="input" type="number" step="0.1" value={rating} onChange={(e) => setRating(e.target.value)} /></L>
        <L label="Review count"><input className="input" type="number" value={reviewCount} onChange={(e) => setReviewCount(e.target.value)} /></L>
        <L label="Image URL (optional)"><input className="input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" /></L>
      </div>

      <L label="Short description"><input className="input" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="One-line summary" /></L>
      <L label="Full description"><textarea className="input min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Longer marketing description…" /></L>

      {/* swatch + flags */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="label mb-1 block">Placeholder colors</span>
          <div className="flex items-center gap-3">
            <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent" />
            <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent" />
            <div className="h-9 flex-1 rounded-lg border border-border" style={{ background: `linear-gradient(120deg, ${color1}, ${color2})` }} />
          </div>
        </div>
        <div>
          <span className="label mb-1 block">Flags</span>
          <div className="flex flex-wrap gap-4 pt-1.5 text-sm">
            <Check label="Featured" checked={featured} onChange={setFeatured} />
            <Check label="New" checked={isNew} onChange={setIsNew} />
            <Check label="Best seller" checked={bestSeller} onChange={setBestSeller} />
          </div>
        </div>
      </div>

      {/* specs */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="label">Specifications</span>
          <button type="button" onClick={() => setSpecs((s) => [...s, { label: "", value: "" }])} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <Plus size={13} /> Add spec
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input className="input" value={s.label} onChange={(e) => setSpec(i, "label", e.target.value)} placeholder="Label (e.g. Switches)" />
              <input className="input" value={s.value} onChange={(e) => setSpec(i, "value", e.target.value)} placeholder="Value" />
              <button type="button" onClick={() => setSpecs((rows) => rows.filter((_, idx) => idx !== i))} className="btn btn-ghost h-auto w-10 shrink-0 !px-0 text-danger" aria-label="Remove spec">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <button type="button" onClick={onCancel} className="btn btn-ghost">Cancel</button>
        <button type="submit" className="btn btn-primary">{product ? "Save changes" : "Create product"}</button>
      </div>
    </form>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
      {label}
    </label>
  );
}
