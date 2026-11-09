"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Undo2,
  Zap,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { getProduct, listProducts } from "@/lib/repository";
import { useCategories } from "@/lib/hooks";
import { reportError } from "@/lib/feedback";
import { Reviews } from "@/components/product/Reviews";
import { ProductImage } from "@/components/ProductImage";
import { ProductRail } from "@/components/ProductRail";
import { Stars } from "@/components/Stars";
import { Skeleton } from "@/components/Skeleton";
import { useCart } from "@/store/cart";
import { discountPct, formatPHP } from "@/lib/utils";

export function ProductDetailClient({ slug }: { slug: string }) {
  const categories = useCategories() ?? [];
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [related, setRelated] = useState<Product[] | null>(null);
  const [qty, setQty] = useState(1);
  const [activeTile, setActiveTile] = useState(0);

  useEffect(() => {
    let active = true;
    getProduct(slug)
      .then((p) => {
        if (!active) return;
        setProduct(p ?? null);
        if (p) {
          listProducts()
            .then(
              (all) =>
                active &&
                setRelated(
                  all
                    .filter(
                      (x) => x.categorySlug === p.categorySlug && x.id !== p.id,
                    )
                    .slice(0, 8),
                ),
            )
            .catch(reportError);
        }
      })
      .catch((e) => {
        reportError(e);
        if (active) setProduct(null);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (product === undefined) return <DetailSkeleton />;

  if (product === null) {
    return (
      <div className="container-nexus flex flex-col items-center gap-3 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Product not found</h1>
        <p className="text-muted">This item may have been removed.</p>
        <Link href="/products" className="btn btn-primary mt-2">
          Back to shop
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.slug === product.categorySlug);
  const off = discountPct(product.price, product.compareAtPrice);
  const soldOut = product.stock <= 0;

  return (
    <div className="container-nexus py-8">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight size={13} />
        <Link href="/products" className="hover:text-primary">
          Shop
        </Link>
        <ChevronRight size={13} />
        {category && (
          <>
            <Link
              href={`/products?category=${category.slug}`}
              className="hover:text-primary"
            >
              {category.name}
            </Link>
            <ChevronRight size={13} />
          </>
        )}
        <span className="truncate text-fg">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* gallery */}
        <div className="flex flex-col gap-3">
          <ProductImage
            swatch={product.swatch}
            categorySlug={product.categorySlug}
            brand={product.brand}
            name={product.name}
            images={
              product.images.length
                ? [
                    product.images[
                      Math.min(activeTile, product.images.length - 1)
                    ],
                  ]
                : undefined
            }
            className="aspect-square w-full overflow-hidden rounded-xl border border-border"
            sizes="(max-width: 1024px) 100vw, 560px"
          />
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTile(i)}
                  className={`aspect-square w-20 overflow-hidden rounded-lg border transition-colors ${
                    activeTile === i
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <ProductImage
                    swatch={product.swatch}
                    categorySlug={product.categorySlug}
                    brand={product.brand}
                    name={product.name}
                    images={[img]}
                    className="h-full w-full"
                    iconClassName="h-6 w-6"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* info */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link
              href={`/products?category=${product.categorySlug}`}
              className="text-xs font-semibold uppercase tracking-wider text-primary"
            >
              {product.brand}
            </Link>
            {product.isNew && (
              <span className="chip border-primary/40 bg-primary/10 text-primary">
                NEW
              </span>
            )}
            {product.bestSeller && (
              <span className="chip border-warning/40 bg-warning/10 text-warning">
                <Zap size={11} /> Best seller
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl font-black leading-tight">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <Stars rating={product.rating} size={16} />
            <span className="text-sm text-muted">
              {product.rating} · {product.reviewCount} reviews
            </span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-4xl font-black text-primary">
              {formatPHP(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="mb-1 text-lg text-faint line-through">
                {formatPHP(product.compareAtPrice)}
              </span>
            )}
            {off > 0 && (
              <span className="chip mb-1.5 border-hot/40 bg-hot/15 text-hot">
                Save {off}%
              </span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            {product.description}
          </p>

          <div className="mt-5 flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${soldOut ? "bg-danger" : "bg-success"}`}
            />
            <span className={soldOut ? "text-danger" : "text-success"}>
              {soldOut
                ? "Out of stock"
                : product.stock <= 10
                  ? `Low stock — only ${product.stock} left`
                  : "In stock & ready to ship"}
            </span>
          </div>

          {/* qty + actions */}
          {!soldOut && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-xl border border-border">
                <button
                  className="grid h-11 w-11 place-items-center text-muted hover:text-fg disabled:opacity-40"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button
                  className="grid h-11 w-11 place-items-center text-muted hover:text-fg disabled:opacity-40"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                  aria-label="Increase"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={() => add(product, qty)}
                className="btn btn-primary flex-1 sm:flex-none"
              >
                <ShoppingCart size={17} /> Add to cart
              </button>
              <button
                onClick={() => {
                  add(product, qty);
                  router.push("/checkout");
                }}
                className="btn btn-accent flex-1 sm:flex-none"
              >
                Buy now
              </button>
            </div>
          )}
          {soldOut && (
            <button disabled className="btn btn-ghost mt-6 w-full">
              Out of stock
            </button>
          )}

          {/* perks */}
          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { icon: Truck, t: "Free shipping ₱5k+" },
              { icon: ShieldCheck, t: "Demo catalog" },
              { icon: Undo2, t: "No real purchases" },
            ].map((perk) => (
              <div
                key={perk.t}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted"
              >
                <perk.icon size={16} className="text-primary" /> {perk.t}
              </div>
            ))}
          </div>

          {/* specs */}
          <div className="mt-8">
            <h2 className="mb-3 font-display text-lg font-bold">
              Specifications
            </h2>
            <div className="overflow-hidden rounded-xl border border-border">
              {product.specs.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex justify-between gap-4 px-4 py-3 text-sm ${
                    i % 2 ? "bg-surface" : "bg-surface-2/40"
                  }`}
                >
                  <span className="text-muted">{s.label}</span>
                  <span className="text-right font-medium">{s.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span key={t} className="chip">
                  <Check size={11} /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Reviews productId={product.id} />
      {related && related.length > 0 && (
        <ProductRail
          title="You might also like"
          products={related}
          href={`/products?category=${product.categorySlug}`}
        />
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-nexus grid gap-8 py-8 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}
