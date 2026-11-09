"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";
export function AddToCartButton({
  product,
  quantity = 1,
  className,
}: {
  product: Product;
  quantity?: number;
  className?: string;
}) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const soldOut = product.stock <= 0;
  return (
    <button
      type="button"
      disabled={soldOut}
      data-added={added}
      aria-label={added ? "Added to cart" : undefined}
      onClick={() => {
        add(product, quantity);
        setAdded(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1800);
      }}
      className={cn("btn btn-primary cart-action", className)}
    >
      {added ? (
        <Check size={16} className="cart-check" />
      ) : (
        <ShoppingCart size={16} />
      )}
      <span aria-live="polite" aria-atomic="true">
        {soldOut ? "Sold out" : added ? "Added" : "Add to cart"}
      </span>
    </button>
  );
}
