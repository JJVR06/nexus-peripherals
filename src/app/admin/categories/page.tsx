"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Category } from "@/lib/types";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/lib/repository";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Modal } from "@/components/admin/Modal";
import { slugify } from "@/lib/utils";

const ICONS = [
  "Keyboard",
  "Mouse",
  "Headphones",
  "Monitor",
  "Square",
  "Gamepad2",
  "Mic",
  "Webcam",
  "Armchair",
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = () => listCategories().then(setCategories);
  useEffect(() => { refresh(); }, []);

  const handleDelete = async (c: Category) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    await deleteCategory(c.id);
    refresh();
  };

  const handleSave = async (data: Omit<Category, "id">) => {
    if (editing) await updateCategory(editing.id, data);
    else await createCategory(data);
    await refresh();
    setEditing(null);
    setCreating(false);
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black">Categories</h1>
          <p className="text-sm text-muted">{categories ? `${categories.length} categories` : "Loading…"}</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn btn-primary">
          <Plus size={16} /> Add category
        </button>
      </header>

      {!categories ? (
        <div className="panel p-10 text-center text-muted">Loading…</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="card flex items-center gap-3 p-4">
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-border"
                style={{ color: c.accent, background: `${c.accent}18` }}
              >
                <CategoryIcon name={c.icon} size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold">{c.name}</p>
                <p className="truncate text-xs text-muted">{c.tagline}</p>
                <p className="truncate text-[0.7rem] text-faint">/{c.slug}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => setEditing(c)} className="btn btn-ghost h-8 w-8 !px-0" aria-label="Edit">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(c)} className="btn btn-ghost h-8 w-8 !px-0 text-danger" aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <Modal
          title={editing ? "Edit category" : "Add category"}
          onClose={() => { setEditing(null); setCreating(false); }}
        >
          <CategoryForm
            category={editing ?? undefined}
            onSave={handleSave}
            onCancel={() => { setEditing(null); setCreating(false); }}
          />
        </Modal>
      )}
    </div>
  );
}

function CategoryForm({
  category,
  onSave,
  onCancel,
}: {
  category?: Category;
  onSave: (data: Omit<Category, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [tagline, setTagline] = useState(category?.tagline ?? "");
  const [icon, setIcon] = useState(category?.icon ?? ICONS[0]);
  const [accent, setAccent] = useState(category?.accent ?? "#27e6ff");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required.");
    onSave({
      name: name.trim(),
      slug: (slug.trim() || slugify(name)),
      tagline: tagline.trim(),
      icon,
      accent,
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="block">
        <span className="label mb-1 block">Name</span>
        <input className="input" value={name} onChange={(e) => { setName(e.target.value); if (!category) setSlug(slugify(e.target.value)); }} placeholder="Keyboards" />
      </label>
      <label className="block">
        <span className="label mb-1 block">Slug</span>
        <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="keyboards" />
      </label>
      <label className="block">
        <span className="label mb-1 block">Tagline</span>
        <input className="input" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Mechanical & optical" />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="label mb-1 block">Icon</span>
          <select className="input" value={icon} onChange={(e) => setIcon(e.target.value)}>
            {ICONS.map((i) => <option key={i} value={i} className="bg-surface">{i}</option>)}
          </select>
        </label>
        <div>
          <span className="label mb-1 block">Accent</span>
          <div className="flex items-center gap-2">
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent" />
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-border" style={{ color: accent, background: `${accent}18` }}>
              <CategoryIcon name={icon} size={18} />
            </span>
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <button type="button" onClick={onCancel} className="btn btn-ghost">Cancel</button>
        <button type="submit" className="btn btn-primary">{category ? "Save changes" : "Create category"}</button>
      </div>
    </form>
  );
}
