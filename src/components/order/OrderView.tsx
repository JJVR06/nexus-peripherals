"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, Truck } from "lucide-react";
import type { Order } from "@/lib/types";
import { getOrder, listOrderEvents } from "@/lib/repository";
import { formatPHP } from "@/lib/utils";
import { useAuth } from "@/store/auth";
import { errorMessage } from "@/lib/validation";
import { StatusBadge } from "@/components/order/StatusBadge";

export function OrderView({ id }: { id: string }) {
  const userId = useAuth((s) => s.user?.id);
  return <OrderContent key={`${userId ?? "anon"}:${id}`} id={id} />;
}
function OrderContent({ id }: { id: string }) {
  const { user, hydrated } = useAuth();
  const [error, setError] = useState("");
  const [events, setEvents] = useState<
    { status: string; created_at: string }[]
  >([]);
  const sp = useSearchParams();
  const isNew = sp.get("new") === "1";
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    if (!hydrated || !user) return;
    let active = true;
    const refresh = () => {
      Promise.all([getOrder(id), listOrderEvents(id)])
        .then(([o, history]) => {
          if (active) {
            setOrder(o ?? null);
            setEvents(history);
            setError("");
          }
        })
        .catch((e) => {
          if (active) setError(errorMessage(e));
        });
    };
    refresh();
    const interval = setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [id, hydrated, user]);
  if (hydrated && !user)
    return (
      <div className="container-nexus py-24 text-center">
        <h1 className="mb-4 text-2xl font-bold">Sign in to view this order</h1>
        <Link
          href={`/login?next=${encodeURIComponent(`/order/${id}`)}`}
          className="btn btn-primary"
        >
          Sign in
        </Link>
      </div>
    );
  if (error)
    return (
      <div role="alert" className="container-nexus py-24 text-danger">
        {error}
      </div>
    );

  if (order === undefined)
    return (
      <div className="container-nexus py-24 text-center text-muted">
        Loading order…
      </div>
    );

  if (order === null)
    return (
      <div className="container-nexus flex flex-col items-center gap-3 py-24 text-center">
        <Package size={44} className="text-faint" />
        <h1 className="font-display text-2xl font-bold">Order not found</h1>
        <Link href="/account" className="btn btn-primary mt-2">
          Go to my orders
        </Link>
      </div>
    );

  const date = new Date(order.createdAt).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="container-nexus max-w-3xl py-10">
      {isNew && (
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-success/40 bg-success/10 p-5 animate-fade-up">
          <CheckCircle2 size={36} className="shrink-0 text-success" />
          <div>
            <h1 className="font-display text-xl font-bold">
              Order placed — thank you!
            </h1>
            <p className="text-sm text-muted">
              Your order is saved to your account. Checkout is simulated; no
              payment is collected, no goods are shipped, and no confirmation
              email is sent.
            </p>
          </div>
        </div>
      )}

      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Order number
            </p>
            <p className="font-display text-lg font-bold">{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">{date}</p>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="divide-y divide-border">
          {order.items.map((i) => (
            <div
              key={i.productId}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface-2 text-sm font-bold text-primary">
                  {i.quantity}×
                </span>
                <div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted">{i.brand}</p>
                </div>
              </div>
              <span className="font-semibold">
                {formatPHP(i.price * i.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-1 border-t border-border p-5">
          <Row label="Subtotal" value={formatPHP(order.subtotal)} />
          <Row
            label="Shipping"
            value={order.shipping === 0 ? "FREE" : formatPHP(order.shipping)}
          />
          <div className="my-2 divider-glow" />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-display text-xl font-black text-primary">
              {formatPHP(order.total)}
            </span>
          </div>
        </div>

        <div className="grid gap-4 border-t border-border p-5 sm:grid-cols-2">
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <Truck size={13} /> Shipping to
            </p>
            <p className="text-sm font-medium">{order.customer.name}</p>
            <p className="text-sm text-muted">{order.customer.address}</p>
            <p className="text-sm text-muted">
              {order.customer.city}, {order.customer.zip}
            </p>
            <p className="text-sm text-muted">{order.customer.phone}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Payment
            </p>
            <p className="text-sm font-medium">{order.paymentMethod}</p>
          </div>
        </div>
      </div>

      <section className="panel mt-6 p-5">
        <h2 className="mb-3 font-display text-lg font-bold">Order tracking</h2>
        <p className="text-sm text-muted">
          Reference: {order.trackingNumber || "Not shipped yet"}
        </p>
        <p className="mt-2 text-sm text-muted">
          Payment:{" "}
          {order.paymentStatus === "simulated"
            ? "Simulated — no charge"
            : "Due on delivery (demo)"}
        </p>
        <ol className="mt-4 space-y-2">
          {events.map((event, i) => (
            <li key={i} className="flex justify-between gap-3 text-sm">
              <span className="capitalize">{event.status}</span>
              <time>{new Date(event.created_at).toLocaleString("en-PH")}</time>
            </li>
          ))}
        </ol>
      </section>
      <div className="mt-6 flex gap-3">
        <Link href="/products" className="btn btn-primary">
          Continue shopping
        </Link>
        <Link href="/account" className="btn btn-ghost">
          View all orders
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm text-muted">
      <span>{label}</span>
      <span className="text-fg">{value}</span>
    </div>
  );
}
