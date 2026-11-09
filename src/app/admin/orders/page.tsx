"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/types";
import { listOrders, updateOrderStatus } from "@/lib/repository";
import { StatusBadge } from "@/components/order/StatusBadge";
import { reportError, dataChanged } from "@/lib/feedback";
import { formatPHP } from "@/lib/utils";

const STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const refresh = () =>
    listOrders()
      .then(setOrders)
      .catch((e) => {
        reportError(e);
        setOrders([]);
      });
  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const changeStatus = async (id: string, status: OrderStatus) => {
    if (busy) return;
    setBusy(true);
    try {
      let tracking: string | undefined;
      if (status === "shipped") {
        const input = window.prompt(
          "Tracking reference (use a demo reference for the presentation)",
        );
        if (!input?.trim()) return;
        tracking = input.trim();
      }
      const updated = await updateOrderStatus(id, status, tracking);
      setOrders((cur) => cur?.map((o) => (o.id === id ? updated : o)) ?? cur);
      dataChanged();
    } catch (e) {
      reportError(e);
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(
    () =>
      orders
        ? orders.filter((o) => filter === "all" || o.status === filter)
        : null,
    [orders, filter],
  );

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-black">Orders</h1>
        <p className="text-sm text-muted">
          {orders ? `${orders.length} total orders` : "Loading…"}
        </p>
      </header>

      {/* status filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`chip capitalize ${
              filter === s
                ? "border-primary/50 bg-primary/15 text-primary"
                : "hover:text-fg"
            }`}
          >
            {s}
            {s !== "all" && orders && (
              <span className="opacity-60">
                {orders.filter((o) => o.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="p-3 font-semibold">Order</th>
                <th className="p-3 font-semibold">Customer</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Total</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 text-right font-semibold">View</th>
              </tr>
            </thead>
            <tbody>
              {!filtered ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted">
                    No orders here yet.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-border-soft last:border-0 hover:bg-surface-2/50"
                  >
                    <td className="p-3">
                      <p className="font-medium">{o.id}</p>
                      <p className="text-xs text-muted">
                        {o.items.length} items · {o.paymentMethod}
                      </p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{o.customer.name}</p>
                      <p className="text-xs text-muted">{o.customer.city}</p>
                    </td>
                    <td className="p-3 text-muted">
                      {new Date(o.createdAt).toLocaleDateString("en-PH", {
                        dateStyle: "medium",
                      })}
                    </td>
                    <td className="p-3 font-semibold">{formatPHP(o.total)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={o.status} />
                        <select
                          disabled={
                            busy ||
                            o.status === "delivered" ||
                            o.status === "cancelled"
                          }
                          value={o.status}
                          onChange={(e) =>
                            changeStatus(o.id, e.target.value as OrderStatus)
                          }
                          className="input !w-auto !py-1 !text-xs capitalize"
                          aria-label="Update status"
                        >
                          {STATUSES.filter(
                            (s) =>
                              s === o.status ||
                              (o.status === "pending" &&
                                ["processing", "cancelled"].includes(s)) ||
                              (o.status === "processing" &&
                                ["shipped", "cancelled"].includes(s)) ||
                              (o.status === "shipped" && s === "delivered"),
                          ).map((s) => (
                            <option
                              key={s}
                              value={s}
                              className="bg-surface capitalize"
                            >
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/order/${o.id}`}
                        className="btn btn-ghost h-9 w-9 !px-0"
                        aria-label="View order"
                      >
                        <ExternalLink size={15} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
