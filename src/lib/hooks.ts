"use client";
import { useEffect, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { listCategories, listProducts } from "@/lib/repository";
import { reportError } from "@/lib/feedback";
// Shared cache avoids a category request per product card.
let categoryCache: Category[] | null = null;
let categoryExpires = 0;
let categoryPending: Promise<Category[]> | null = null;
async function cachedCategories() {
  if (categoryCache && Date.now() < categoryExpires) return categoryCache;
  categoryPending ??= listCategories()
    .then((c) => {
      categoryCache = c;
      categoryExpires = Date.now() + 10000;
      return c;
    })
    .finally(() => {
      categoryPending = null;
    });
  return categoryPending;
}
function useList<T>(load: () => Promise<T[]>) {
  const [value, setValue] = useState<T[] | null>(null);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      void load()
        .then((v) => {
          if (active) setValue(v);
        })
        .catch((e) => {
          if (active) {
            setValue([]);
            reportError(e);
          }
        });
    };
    refresh();
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    window.addEventListener("nexus:data", refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("nexus:data", refresh);
    };
  }, [load]);
  return value;
}
export function useProducts() {
  return useList<Product>(listProducts);
}
export function useCategories() {
  return useList<Category>(cachedCategories);
}
if (typeof window !== "undefined")
  window.addEventListener("nexus:data", () => {
    categoryCache = null;
  });
