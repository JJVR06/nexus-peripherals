"use client";

import { useMemo } from "react";
import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductRail } from "@/components/ProductRail";
import { PromoBanners } from "@/components/home/PromoBanners";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { useProducts } from "@/lib/hooks";
import { discountPct } from "@/lib/utils";

export default function HomePage() {
  const products = useProducts();

  const rails = useMemo(() => {
    if (!products) return null;
    return {
      featured: products.filter((p) => p.featured),
      bestSellers: products.filter((p) => p.bestSeller),
      newArrivals: products.filter((p) => p.isNew),
      deals: products
        .filter((p) => discountPct(p.price, p.compareAtPrice) > 0)
        .sort(
          (a, b) =>
            discountPct(b.price, b.compareAtPrice) -
            discountPct(a.price, a.compareAtPrice),
        ),
    };
  }, [products]);

  return (
    <>
      <Hero />
      <CategoryGrid />
      <ProductRail
        title="Featured gear"
        subtitle="Hand-picked flagships worth building around"
        products={rails?.featured ?? null}
        href="/products"
      />
      <PromoBanners />
      <ProductRail
        title="Hot deals"
        subtitle="Limited-time price cuts"
        products={rails?.deals ?? null}
        href="/products?deals=1"
      />
      <ProductRail
        title="New arrivals"
        subtitle="Fresh drops just landed"
        products={rails?.newArrivals ?? null}
        href="/products?sort=newest"
      />
      <ProductRail
        title="Best sellers"
        subtitle="What the community keeps buying"
        products={rails?.bestSellers ?? null}
        href="/products"
      />
      <BrandMarquee />
    </>
  );
}
