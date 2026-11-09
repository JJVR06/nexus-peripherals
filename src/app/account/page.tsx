"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import type { Order } from "@/lib/types";
import { useAuth } from "@/store/auth";
import { listOrdersByUser } from "@/lib/repository";
import { StatusBadge } from "@/components/order/StatusBadge";
import { reportError } from "@/lib/feedback";
import { AccountSettings } from "@/components/auth/AccountSettings";
import { formatPHP } from "@/lib/utils";

export default function AccountPage() {
  const userId = useAuth((s) => s.user?.id);
  return <AccountContent key={userId ?? "anon"} />;
}
function AccountContent() {
  const router = useRouter();
  const { user, hydrated, logout } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login?next=/account");
  }, [hydrated, user, router]);

  useEffect(() => {
    let active = true;
    if (user)
      listOrdersByUser(user.id)
        .then((o) => {
          if (active) setOrders(o);
        })
        .catch((e) => {
          if (active) {
            reportError(e);
            setOrders([]);
          }
        });
    return () => {
      active = false;
    };
  }, [user]);

  if (!hydrated || !user)
    return (
      <div className="container-nexus py-24 text-center text-muted">
        Loading…
      </div>
    );

  const totalSpent =
    orders
      ?.filter((o) => o.status === "delivered")
      .reduce((s, o) => s + o.total, 0) ?? 0;

  return (
    <div className="container-nexus py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black">My account</h1>
          <p className="text-muted">Welcome back, {user.name}.</p>
        </div>
        <div className="flex gap-2">
          {user.role === "admin" && (
            <Link href="/admin" className="btn btn-outline">
              <LayoutDashboard size={16} /> Admin dashboard
            </Link>
          )}
          <button
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="btn btn-ghost"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>

      {/* stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Package size={18} />}
          label="Orders placed"
          value={orders ? String(orders.length) : "…"}
        />
        <StatCard
          icon={<Wallet size={18} />}
          label="Delivered order value"
          value={orders ? formatPHP(totalSpent) : "…"}
        />
        <StatCard
          icon={<ShoppingBag size={18} />}
          label="Membership"
          value={user.role === "admin" ? "Admin" : "Member"}
        />
      </div>

      {/* profile */}
      <div className="mb-8 panel p-5">
        <h2 className="mb-4 font-display text-lg font-bold">Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Name" value={user.name} />
          <Info label="Email" value={user.email} />
          <Info
            label="Account type"
            value={user.role === "admin" ? "Administrator" : "Customer"}
          />
          <Info label="User ID" value={user.id} />
        </div>
      </div>

      <AccountSettings />
      {/* orders */}
      <h2 className="mb-4 font-display text-xl font-bold">Order history</h2>
      {!orders ? (
        <div className="panel p-10 text-center text-muted">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="panel flex flex-col items-center gap-3 p-12 text-center">
          <Package size={40} className="text-faint" />
          <p className="font-display text-lg font-semibold">No orders yet</p>
          <p className="text-sm text-muted">
            When you place an order it&apos;ll show up here.
          </p>
          <Link href="/products" className="btn btn-primary mt-1">
            Shop now
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/order/${o.id}`}
              className="card flex flex-wrap items-center justify-between gap-4 p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface-2 text-primary">
                  <Package size={18} />
                </span>
                <div>
                  <p className="font-display font-semibold">{o.id}</p>
                  <p className="text-xs text-muted">
                    {new Date(o.createdAt).toLocaleDateString("en-PH", {
                      dateStyle: "medium",
                    })}{" "}
                    · {o.items.reduce((n, i) => n + i.quantity, 0)} items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={o.status} />
                <span className="font-display font-bold">
                  {formatPHP(o.total)}
                </span>
                <ChevronRight size={16} className="text-faint" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface-2 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-display text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label mb-0.5">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
