"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListOrdered,
  Lock,
  Package,
  Store,
  Tags,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ListOrdered },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, hydrated } = useAuth();

  if (!hydrated)
    return (
      <div className="container-nexus py-24 text-center text-muted">
        Loading…
      </div>
    );

  if (!user || user.role !== "admin") {
    return (
      <div className="container-nexus flex flex-col items-center gap-4 py-24 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl border border-border bg-surface text-danger">
          <Lock size={28} />
        </span>
        <h1 className="font-display text-2xl font-bold">Admins only</h1>
        <p className="max-w-sm text-muted">
          You need an administrator account to access the dashboard.
        </p>
        <div className="flex gap-2">
          <Link href="/login?next=/admin" className="btn btn-primary">
            Sign in as admin
          </Link>
          <Link href="/" className="btn btn-ghost">
            Back to store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-nexus grid gap-6 py-8 lg:grid-cols-[230px_1fr]">
      <aside className="h-fit lg:sticky lg:top-28">
        <div className="panel p-3">
          <div className="mb-2 flex items-center gap-2 px-2 py-1.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-black text-[#04121a]">
              N
            </span>
            <span className="font-display text-sm font-bold">
              Admin Console
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => {
              const active = n.exact
                ? pathname === n.href
                : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/12 font-semibold text-primary"
                      : "text-muted hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  <n.icon size={16} /> {n.label}
                </Link>
              );
            })}
            <div className="my-1 divider-glow" />
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <Store size={16} /> View store
            </Link>
          </nav>
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
