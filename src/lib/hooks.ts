"use client";

import { useEffect, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { listCategories, listProducts } from "@/lib/repository";

export function useProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);
  useEffect(() => {
    let active = true;
    listProducts().then((p) => active && setProducts(p));
    return () => {
      active = false;
    };
  }, []);
  return products;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  useEffect(() => {
    let active = true;
    listCategories().then((c) => active && setCategories(c));
    return () => {
      active = false;
    };
  }, []);
  return categories;
}
