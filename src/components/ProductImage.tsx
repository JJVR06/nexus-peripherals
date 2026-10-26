"use client";

import { useState } from "react";
import Image from "next/image";
import { categories } from "@/lib/data/categories";
import { CategoryIcon } from "@/components/CategoryIcon";
import { cn } from "@/lib/utils";

/**
 * Shows a product photo with object-cover. If the remote image fails to load it
 * degrades to a clean, neutral placeholder (category line-art + brand) so the
 * grid never shows a broken image.
 */
export function ProductImage({
  swatch,
  categorySlug,
  brand,
  name,
  images,
  className,
  iconClassName,
  showBrand = true,
  sizes = "(max-width: 768px) 50vw, 300px",
}: {
  swatch: [string, string];
  categorySlug: string;
  brand: string;
  name: string;
  images?: string[];
  className?: string;
  iconClassName?: string;
  /** Hide the brand watermark on thumbnails too small to render it legibly. */
  showBrand?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const iconName =
    categories.find((c) => c.slug === categorySlug)?.icon ?? "Boxes";
  const src = images?.[0];

  if (src && !failed) {
    return (
      <div className={cn("relative overflow-hidden bg-[#0e1018]", className)}>
        <Image
          src={src}
          alt={`${brand} ${name}`}
          fill
          sizes={sizes}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    );
  }

  // Clean fallback — neutral, no glow.
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br from-surface-2 to-bg-soft",
        className,
      )}
      aria-label={`${brand} ${name}`}
    >
      <span
        className="absolute left-0 top-0 h-0.5 w-full"
        style={{ background: swatch[0], opacity: 0.6 }}
      />
      <CategoryIcon
        name={iconName}
        strokeWidth={1.1}
        className={cn("h-1/3 w-1/3 text-muted/70", iconClassName)}
      />
      {showBrand && (
        <span className="max-w-full truncate px-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted/60">
          {brand}
        </span>
      )}
    </div>
  );
}
