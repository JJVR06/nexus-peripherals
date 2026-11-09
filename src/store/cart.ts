"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { validQuantity } from "@/lib/validation";
import type { CartItem, Product } from "@/lib/types";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean;
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  reconcile: (products: Product[]) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      hydrated: false,
      add: (product, qty = 1) =>
        set((state) => {
          if (!validQuantity(qty) || product.stock <= 0) return state;
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((i) =>
                i.productId === product.id
                  ? {
                      ...i,
                      price: product.price,
                      stock: product.stock,
                      name: product.name,
                      quantity: Math.min(i.quantity + qty, product.stock, 1000),
                    }
                  : i,
              ),
            };
          }
          const item: CartItem = {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            price: product.price,
            categorySlug: product.categorySlug,
            swatch: product.swatch,
            quantity: Math.min(qty, product.stock),
            stock: product.stock,
          };
          return { isOpen: true, items: [...state.items, item] };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      setQty: (productId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? {
                    ...i,
                    quantity: Number.isFinite(qty)
                      ? Math.max(0, Math.min(Math.floor(qty), i.stock, 1000))
                      : i.quantity,
                  }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      reconcile: (products) =>
        set((state) => ({
          items: state.items.flatMap((item) => {
            const p = products.find((p) => p.id === item.productId);
            if (!p || p.stock <= 0 || !validQuantity(item.quantity)) return [];
            return [
              {
                ...item,
                name: p.name,
                brand: p.brand,
                slug: p.slug,
                categorySlug: p.categorySlug,
                swatch: p.swatch,
                price: p.price,
                stock: p.stock,
                quantity: Math.min(item.quantity, p.stock),
              },
            ];
          }),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: "nexus.cart.shared.v1",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.items = Array.isArray(state.items)
            ? state.items.filter(
                (i) =>
                  i &&
                  validQuantity(i.quantity) &&
                  Number.isFinite(i.price) &&
                  i.price > 0,
              )
            : [];
          state.hydrated = true;
        } else
          queueMicrotask(() => useCart.setState({ items: [], hydrated: true }));
      },
    },
  ),
);

export const cartCount = (items: CartItem[]) =>
  items.reduce((n, i) => n + i.quantity, 0);

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

/** Free shipping over ₱5,000, otherwise ₱250 flat. */
export const shippingFor = (subtotal: number) =>
  subtotal === 0 || subtotal >= 5000 ? 0 : 250;
