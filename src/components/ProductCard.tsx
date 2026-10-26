"use client";

import Link from "next/link";
import { Check, ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/ProductImage";
import { Stars } from "@/components/Stars";
import { useCart } from "@/store/cart";
import { discountPct, formatPHP } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const off = discountPct(product.price, product.compareAtPrice);
  const soldOut = product.stock <= 0;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50">
      {/* image */}
      <Link href={`/product/${product.slug}`} className="relative block">
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5">
          {off > 0 && (
            <span className="rounded bg-[#d81b60] px-1.5 py-0.5 text-[0.7rem] font-bold text-white">
              -{off}%
            </span>
          )}
          {product.isNew && (
            <span className="rounded bg-primary px-1.5 py-0.5 text-[0.7rem] font-bold text-[#04202a]">
              NEW
            </span>
          )}
          {product.bestSeller && (
            <span className="flex items-center gap-1 rounded bg-surface-3/90 px-1.5 py-0.5 text-[0.7rem] font-bold text-warning">
              <Zap size={10} /> Top
            </span>
          )}
        </div>
        <ProductImage
          swatch={product.swatch}
          categorySlug={product.categorySlug}
          brand={product.brand}
          name={product.name}
          images={product.images}
          className="aspect-square w-full"
        />
      </Link>

      {/* body */}
      <div className="flex flex-1 flex-col p-3.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {product.brand}
        </span>
        <Link
          href={`/product/${product.slug}`}
          className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug transition-colors group-hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5">
          <Stars rating={product.rating} size={12} />
          <span className="text-xs text-faint">({product.reviewCount})</span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-lg font-bold">{formatPHP(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-faint line-through">
              {formatPHP(product.compareAtPrice)}
            </span>
          )}
        </div>

        <span
          className={`mt-1 flex items-center gap-1 text-[0.7rem] font-medium ${
            soldOut ? "text-danger" : product.stock <= 10 ? "text-warning" : "text-success"
          }`}
        >
          {!soldOut && <Check size={11} />}
          {soldOut ? "Out of stock" : product.stock <= 10 ? `Only ${product.stock} left` : "In stock"}
        </span>

        <button
          type="button"
          disabled={soldOut}
          onClick={() => add(product)}
          className="btn btn-primary mt-3 w-full !py-2.5 text-sm disabled:!bg-surface-3 disabled:!text-muted"
        >
          <ShoppingCart size={15} /> {soldOut ? "Sold out" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
