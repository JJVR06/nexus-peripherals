"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Package,
  ListOrdered,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { Category, Order, Product } from "@/lib/types";
import { listCategories, listOrders, listProducts } from "@/lib/repository";
import { StatusBadge } from "@/components/order/StatusBadge";
import { formatPHP } from "@/lib/utils";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    listProducts().then(setProducts);
    listOrders().then(setOrders);
    listCategories().then(setCategories);
  }, []);

  const revenue =
    orders?.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0) ?? 0;
  const lowStock = products?.filter((p) => p.stock <= 10) ?? [];

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-black">Dashboard</h1>
        <p className="text-sm text-muted">Store overview at a glance.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile icon={<Wallet size={18} />} label="Revenue" value={orders ? formatPHP(revenue) : "…"} tone="primary" />
        <Tile icon={<ListOrdered size={18} />} label="Orders" value={orders ? String(orders.length) : "…"} tone="accent" />
        <Tile icon={<Package size={18} />} label="Products" value={products ? String(products.length) : "…"} tone="success" />
        <Tile icon={<AlertTriangle size={18} />} label="Low stock" value={products ? String(lowStock.length) : "…"} tone="warning" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* recent orders */}
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="font-display font-bold">Recent orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-sm text-primary hover:gap-1.5">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          {!orders ? (
            <p className="p-8 text-center text-muted">Loading…</p>
          ) : orders.length === 0 ? (
            <p className="p-8 text-center text-muted">No orders yet. Place one from the store to see it here.</p>
          ) : (
            <div className="divide-y divide-border">
              {orders.slice(0, 6).map((o) => (
                <Link
                  key={o.id}
                  href={`/order/${o.id}`}
                  className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-surface-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{o.id}</p>
                    <p className="truncate text-xs text-muted">{o.customer.name} · {o.items.length} items</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={o.status} />
                    <span className="font-semibold">{formatPHP(o.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* low stock */}
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="flex items-center gap-2 font-display font-bold">
              <TrendingUp size={16} className="text-warning" /> Low stock
            </h2>
            <Link href="/admin/products" className="text-sm text-primary hover:underline">Manage</Link>
          </div>
          {!products ? (
            <p className="p-8 text-center text-muted">Loading…</p>
          ) : lowStock.length === 0 ? (
            <p className="p-8 text-center text-muted">All products are well-stocked. 🎉</p>
          ) : (
            <div className="divide-y divide-border">
              {lowStock.slice(0, 7).map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 p-3.5 text-sm">
                  <span className="min-w-0 truncate">{p.brand} {p.name}</span>
                  <span className={p.stock <= 0 ? "text-danger" : "text-warning"}>
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <p className="mt-6 text-xs text-muted">
        {categories ? `${categories.length} categories` : ""} · Data is stored locally (Firebase-ready). See README to connect Firestore.
      </p>
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "accent" | "success" | "warning";
}) {
  const toneMap = {
    primary: "text-primary",
    accent: "text-accent",
    success: "text-success",
    warning: "text-warning",
  };
  return (
    <div className="panel p-5">
      <span className={`grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface-2 ${toneMap[tone]}`}>
        {icon}
      </span>
      <p className="mt-3 text-xs text-muted">{label}</p>
      <p className="font-display text-2xl font-black">{value}</p>
    </div>
  );
}
