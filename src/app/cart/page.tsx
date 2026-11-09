"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cartSubtotal, shippingFor, useCart } from "@/store/cart";
import { listProducts } from "@/lib/repository";
import { formatPHP } from "@/lib/utils";
import { errorMessage } from "@/lib/validation";
export default function CartPage() {
  const { items, hydrated, setQty, remove, reconcile } = useCart();
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    listProducts()
      .then((p) => {
        reconcile(p);
        setReady(true);
      })
      .catch((e) => setError(errorMessage(e)));
  }, [reconcile]);
  const subtotal = cartSubtotal(items);
  return (
    <div className="container-nexus max-w-4xl py-10">
      <h1 className="mb-6 font-display text-3xl font-bold">Your cart</h1>
      {error && (
        <p role="alert" className="mb-4 text-danger">
          {error}
        </p>
      )}
      {!hydrated ? (
        <p>Loading cart…</p>
      ) : items.length === 0 ? (
        <div className="panel p-10 text-center">
          <p className="mb-4">Your cart is empty.</p>
          <Link href="/products" className="btn btn-primary">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">
            Prices and availability are checked against the shared catalog. The
            database confirms the final total when you place your order.
          </p>
          <ul className="space-y-3">
            {items.map((i) => (
              <li
                key={i.productId}
                className="panel flex flex-wrap items-center gap-4 p-4"
              >
                <Link
                  href={`/product/${i.slug}`}
                  className="flex-1 font-semibold"
                >
                  {i.brand} {i.name}
                </Link>
                <label className="flex items-center gap-2 text-sm">
                  Quantity
                  <input
                    className="input !w-20"
                    type="number"
                    min="1"
                    max={Math.min(i.stock, 1000)}
                    value={i.quantity}
                    onChange={(e) =>
                      setQty(i.productId, Number(e.target.value))
                    }
                  />
                </label>
                <span>{formatPHP(i.price * i.quantity)}</span>
                <button
                  onClick={() => remove(i.productId)}
                  className="btn btn-ghost text-danger"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="panel mt-6 space-y-3 p-5">
            <p>Subtotal: {formatPHP(subtotal)}</p>
            <p>Shipping: {formatPHP(shippingFor(subtotal))}</p>
            <p className="text-xl font-bold">
              Total: {formatPHP(subtotal + shippingFor(subtotal))}
            </p>
            {ready ? (
              <Link href="/checkout" className="btn btn-primary">
                Continue to checkout
              </Link>
            ) : (
              <p>Waiting for the current catalog…</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
