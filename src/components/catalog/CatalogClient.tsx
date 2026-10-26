"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  SlidersHorizontal,
  Star,
  Tag,
  X,
} from "lucide-react";
import type { Product, SortKey } from "@/lib/types";
import { useCategories, useProducts } from "@/lib/hooks";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/Skeleton";
import { cn, discountPct } from "@/lib/utils";

const PRICE_RANGES: Record<string, { label: string; min?: number; max?: number }> = {
  all: { label: "Any price" },
  u3: { label: "Under ₱3,000", max: 3000 },
  "3-8": { label: "₱3,000 – ₱8,000", min: 3000, max: 8000 },
  "8-20": { label: "₱8,000 – ₱20,000", min: 8000, max: 20000 },
  "20p": { label: "₱20,000 & up", min: 20000 },
};

const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "rating", label: "Top rated" },
  { key: "newest", label: "Newest" },
];

export function CatalogClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const products = useProducts();
  const categories = useCategories();
  const [mobileFilters, setMobileFilters] = useState(false);

  const q = sp.get("q") ?? "";
  const category = sp.get("category") ?? "";
  const brands = (sp.get("brands") ?? "").split(",").filter(Boolean);
  const priceKey = sp.get("price") ?? "all";
  const minRating = Number(sp.get("rating") ?? 0);
  const dealsOnly = sp.get("deals") === "1";
  const sort = (sp.get("sort") ?? "featured") as SortKey;

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(sp.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    router.push(`/products?${next.toString()}`, { scroll: false });
  };

  const toggleBrand = (brand: string) => {
    const next = brands.includes(brand)
      ? brands.filter((b) => b !== brand)
      : [...brands, brand];
    setParam("brands", next.join(","));
  };

  const allBrands = useMemo(
    () =>
      products
        ? Array.from(new Set(products.map((p) => p.brand))).sort()
        : [],
    [products],
  );

  const filtered = useMemo(() => {
    if (!products) return null;
    const range = PRICE_RANGES[priceKey] ?? PRICE_RANGES.all;
    let list = products.filter((p) => {
      if (category && p.categorySlug !== category) return false;
      if (brands.length && !brands.includes(p.brand)) return false;
      if (range.min !== undefined && p.price < range.min) return false;
      if (range.max !== undefined && p.price > range.max) return false;
      if (minRating && p.rating < minRating) return false;
      if (dealsOnly && discountPct(p.price, p.compareAtPrice) === 0) return false;
      if (q) {
        const hay = `${p.name} ${p.brand} ${p.categorySlug} ${p.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    list = sortProducts(list, sort);
    return list;
  }, [products, category, brands, priceKey, minRating, dealsOnly, q, sort]);

  const activeCategory = categories?.find((c) => c.slug === category);
  const hasFilters =
    !!category || brands.length > 0 || priceKey !== "all" || minRating > 0 || dealsOnly || !!q;

  const title = q
    ? `Results for “${q}”`
    : activeCategory
      ? activeCategory.name
      : dealsOnly
        ? "Deals"
        : "All products";

  return (
    <div className="container-nexus py-8">
      <div className="mb-6">
        <nav className="mb-2 text-xs text-muted">
          <span>Home</span> <span className="text-faint">/</span>{" "}
          <span className="text-fg">{title}</span>
        </nav>
        <h1 className="font-display text-3xl font-black">{title}</h1>
        {activeCategory && (
          <p className="mt-1 text-sm text-muted">{activeCategory.tagline}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* desktop sidebar */}
        <aside className="hidden lg:block">
          <FiltersPanel
            categories={categories}
            allBrands={allBrands}
            category={category}
            brands={brands}
            priceKey={priceKey}
            minRating={minRating}
            dealsOnly={dealsOnly}
            setParam={setParam}
            toggleBrand={toggleBrand}
          />
        </aside>

        <div>
          {/* toolbar */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              className="btn btn-ghost gap-2 lg:hidden"
              onClick={() => setMobileFilters(true)}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <span className="text-sm text-muted">
              {filtered ? `${filtered.length} product${filtered.length === 1 ? "" : "s"}` : "…"}
            </span>
            <div className="relative ml-auto">
              <select
                value={sort}
                onChange={(e) => setParam("sort", e.target.value)}
                className="input appearance-none !py-2 !pr-9"
                aria-label="Sort products"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key} className="bg-surface">
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
          </div>

          {/* active filter chips */}
          {hasFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {q && <FilterChip label={`“${q}”`} onClear={() => setParam("q", null)} />}
              {activeCategory && (
                <FilterChip label={activeCategory.name} onClear={() => setParam("category", null)} />
              )}
              {brands.map((b) => (
                <FilterChip key={b} label={b} onClear={() => toggleBrand(b)} />
              ))}
              {priceKey !== "all" && (
                <FilterChip label={PRICE_RANGES[priceKey]?.label ?? ""} onClear={() => setParam("price", null)} />
              )}
              {minRating > 0 && (
                <FilterChip label={`${minRating}★ & up`} onClear={() => setParam("rating", null)} />
              )}
              {dealsOnly && <FilterChip label="On sale" onClear={() => setParam("deals", null)} />}
              <button
                onClick={() => router.push("/products", { scroll: false })}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* grid */}
          {!filtered ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 py-16 text-center">
              <Tag size={40} className="text-faint" />
              <p className="font-display text-lg font-semibold">No products match</p>
              <p className="max-w-xs text-sm text-muted">
                Try removing a filter or searching for something else.
              </p>
              <button onClick={() => router.push("/products", { scroll: false })} className="btn btn-outline mt-1">
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFilters(false)} />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-xs overflow-y-auto border-r border-border bg-bg p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display font-bold">Filters</span>
              <button className="btn btn-ghost h-9 w-9 !px-0" onClick={() => setMobileFilters(false)}>
                <X size={18} />
              </button>
            </div>
            <FiltersPanel
              categories={categories}
              allBrands={allBrands}
              category={category}
              brands={brands}
              priceKey={priceKey}
              minRating={minRating}
              dealsOnly={dealsOnly}
              setParam={setParam}
              toggleBrand={toggleBrand}
            />
            <button onClick={() => setMobileFilters(false)} className="btn btn-primary mt-4 w-full">
              Show results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function sortProducts(list: Product[], sort: SortKey) {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "newest":
      return copy.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    default:
      return copy.sort(
        (a, b) =>
          Number(!!b.featured) - Number(!!a.featured) ||
          b.rating - a.rating,
      );
  }
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="chip border-primary/40 bg-primary/10 text-primary">
      {label}
      <button onClick={onClear} aria-label={`Remove ${label}`}>
        <X size={12} />
      </button>
    </span>
  );
}

function FiltersPanel({
  categories,
  allBrands,
  category,
  brands,
  priceKey,
  minRating,
  dealsOnly,
  setParam,
  toggleBrand,
}: {
  categories: ReturnType<typeof useCategories>;
  allBrands: string[];
  category: string;
  brands: string[];
  priceKey: string;
  minRating: number;
  dealsOnly: boolean;
  setParam: (key: string, value: string | null) => void;
  toggleBrand: (brand: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Group title="Category">
        <div className="flex flex-col gap-1">
          <FilterRadio
            checked={!category}
            label="All categories"
            onClick={() => setParam("category", null)}
          />
          {categories?.map((c) => (
            <FilterRadio
              key={c.id}
              checked={category === c.slug}
              label={c.name}
              onClick={() => setParam("category", c.slug)}
            />
          ))}
        </div>
      </Group>

      <Group title="Price">
        <div className="flex flex-col gap-1">
          {Object.entries(PRICE_RANGES).map(([key, r]) => (
            <FilterRadio
              key={key}
              checked={priceKey === key}
              label={r.label}
              onClick={() => setParam("price", key === "all" ? null : key)}
            />
          ))}
        </div>
      </Group>

      <Group title="Brand">
        <div className="flex max-h-56 flex-col gap-1 overflow-y-auto pr-1">
          {allBrands.map((b) => (
            <label
              key={b}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-fg"
            >
              <input
                type="checkbox"
                checked={brands.includes(b)}
                onChange={() => toggleBrand(b)}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              {b}
            </label>
          ))}
        </div>
      </Group>

      <Group title="Rating">
        <div className="flex flex-col gap-1">
          {[0, 4, 4.5].map((r) => (
            <FilterRadio
              key={r}
              checked={minRating === r}
              label={r === 0 ? "All ratings" : `${r}★ & up`}
              icon={r > 0 ? <Star size={13} className="text-warning" fill="currentColor" /> : undefined}
              onClick={() => setParam("rating", r === 0 ? null : String(r))}
            />
          ))}
        </div>
      </Group>

      <Group title="Offers">
        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted hover:text-fg">
          <input
            type="checkbox"
            checked={dealsOnly}
            onChange={(e) => setParam("deals", e.target.checked ? "1" : null)}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          On sale only
        </label>
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 font-display text-sm font-bold">{title}</p>
      {children}
    </div>
  );
}

function FilterRadio({
  checked,
  label,
  icon,
  onClick,
}: {
  checked: boolean;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        checked
          ? "bg-primary/12 font-semibold text-primary"
          : "text-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      <span
        className={cn(
          "grid h-3.5 w-3.5 place-items-center rounded-full border",
          checked ? "border-primary" : "border-border",
        )}
      >
        {checked && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
      </span>
      {icon}
      {label}
    </button>
  );
}
