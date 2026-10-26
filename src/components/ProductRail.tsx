"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/Skeleton";

export function ProductRail({
  title,
  subtitle,
  products,
  href,
}: {
  title: string;
  subtitle?: string;
  products: Product[] | null;
  href?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * 560, behavior: "smooth" });

  return (
    <section className="container-nexus py-7">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold sm:text-2xl">{title}</h2>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {href && (
            <Link href={href} className="hidden items-center gap-1 text-sm font-semibold text-primary hover:gap-1.5 sm:flex">
              View all <ArrowRight size={15} />
            </Link>
          )}
          <div className="hidden gap-1.5 md:flex">
            <button onClick={() => scrollBy(-1)} aria-label="Scroll left" className="grid h-9 w-9 place-items-center rounded-md border border-border bg-surface transition-colors hover:border-primary hover:text-primary">
              <ChevronLeft size={17} />
            </button>
            <button onClick={() => scrollBy(1)} aria-label="Scroll right" className="grid h-9 w-9 place-items-center rounded-md border border-border bg-surface transition-colors hover:border-primary hover:text-primary">
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      <div ref={scroller} className="flex snap-x gap-4 overflow-x-auto px-0.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products
          ? products.map((p) => (
              <div key={p.id} className="w-[220px] shrink-0 snap-start sm:w-[240px]">
                <ProductCard product={p} />
              </div>
            ))
          : Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-[220px] shrink-0 sm:w-[240px]">
                <ProductCardSkeleton />
              </div>
            ))}
      </div>
    </section>
  );
}
