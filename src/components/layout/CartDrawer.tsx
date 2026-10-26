"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import {
  cartCount,
  cartSubtotal,
  shippingFor,
  useCart,
} from "@/store/cart";
import { ProductImage } from "@/components/ProductImage";
import { formatPHP } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const subtotal = cartSubtotal(items);
  const shipping = shippingFor(subtotal);
  const count = cartCount(items);
  const toFree = Math.max(0, 5000 - subtotal);

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-up"
        onClick={close}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-bg shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <ShoppingBag size={18} className="text-primary" /> Your cart
            <span className="chip">{count}</span>
          </h2>
          <button className="btn btn-ghost h-9 w-9 !px-0" onClick={close} aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingBag size={44} className="text-faint" />
            <p className="font-display text-lg font-semibold">Your cart is empty</p>
            <p className="text-sm text-muted">Add some gear to get rolling.</p>
            <button onClick={close} className="btn btn-outline mt-2">
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {subtotal < 5000 && (
                <div className="mb-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
                  Add <b>{formatPHP(toFree)}</b> more for free shipping!
                </div>
              )}
              <ul className="flex flex-col gap-3">
                {items.map((i) => (
                  <li key={i.productId} className="flex gap-3 rounded-xl border border-border bg-surface p-2.5">
                    <Link href={`/product/${i.slug}`} onClick={close}>
                      <ProductImage
                        swatch={i.swatch}
                        categorySlug={i.categorySlug}
                        brand={i.brand}
                        name={i.name}
                        showBrand={false}
                        className="h-20 w-20 shrink-0 rounded-lg"
                        iconClassName="h-8 w-8"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[0.7rem] uppercase tracking-wide text-muted">{i.brand}</p>
                          <Link
                            href={`/product/${i.slug}`}
                            onClick={close}
                            className="line-clamp-1 text-sm font-semibold hover:text-primary"
                          >
                            {i.name}
                          </Link>
                        </div>
                        <button
                          onClick={() => remove(i.productId)}
                          className="text-faint transition-colors hover:text-danger"
                          aria-label="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-lg border border-border">
                          <button
                            className="grid h-7 w-7 place-items-center text-muted hover:text-fg disabled:opacity-40"
                            onClick={() => setQty(i.productId, i.quantity - 1)}
                            disabled={i.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold">{i.quantity}</span>
                          <button
                            className="grid h-7 w-7 place-items-center text-muted hover:text-fg disabled:opacity-40"
                            onClick={() => setQty(i.productId, i.quantity + 1)}
                            disabled={i.quantity >= i.stock}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="font-display text-sm font-bold">
                          {formatPHP(i.price * i.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border bg-surface/60 p-4">
              <div className="mb-1 flex justify-between text-sm text-muted">
                <span>Subtotal</span>
                <span className="text-fg">{formatPHP(subtotal)}</span>
              </div>
              <div className="mb-3 flex justify-between text-sm text-muted">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-success" : "text-fg"}>
                  {shipping === 0 ? "FREE" : formatPHP(shipping)}
                </span>
              </div>
              <div className="mb-4 flex items-center justify-between border-t border-border pt-3">
                <span className="font-semibold">Total</span>
                <span className="font-display text-xl font-bold text-primary">
                  {formatPHP(subtotal + shipping)}
                </span>
              </div>
              <Link href="/checkout" onClick={close} className="btn btn-primary w-full">
                Checkout
              </Link>
              <button onClick={close} className="btn btn-ghost mt-2 w-full">
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
