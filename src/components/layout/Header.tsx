"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Headset,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  PackageSearch,
  Search,
  ShoppingCart,
  Truck,
  User as UserIcon,
  X,
} from "lucide-react";
import { useCategories } from "@/lib/hooks";
import { CategoryIcon } from "@/components/CategoryIcon";
import { cartCount, useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";

export function Header() {
  const categories = useCategories() ?? [];
  const router = useRouter();
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [searchCat, setSearchCat] = useState("");
  const [megaOpen, setMegaOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    const id = setTimeout(() => {
      setMegaOpen(false);
      setAccountOpen(false);
      setMobileOpen(false);
    }, 0);
    return () => clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const count = mounted ? cartCount(items) : 0;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCat) params.set("category", searchCat);
    if (query.trim()) params.set("q", query.trim());
    router.push(`/products${params.toString() ? `?${params}` : ""}`);
  };

  const quickLinks = categories.slice(0, 6);

  return (
    <header className="sticky top-0 z-50">
      {/* utility bar */}
      <div className="hidden border-b border-border-soft bg-bg-soft text-xs text-muted md:block">
        <div className="container-nexus flex h-9 items-center justify-between">
          <div className="flex items-center gap-5">
            <Link
              href="/track-order"
              className="flex items-center gap-1.5 hover:text-primary"
            >
              <PackageSearch size={13} /> Track order
            </Link>
            <Link href="/help/about" className="flex items-center gap-1.5">
              <MapPin size={13} /> About Nexus
            </Link>
            <Link href="/help/contact" className="flex items-center gap-1.5">
              <Headset size={13} /> Support
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Truck size={13} /> Free shipping over ₱5,000
            </span>
            <span>Built for your next upgrade</span>
          </div>
        </div>
      </div>

      {/* main bar — sits above the category bar so the account menu, which is
          trapped in this bar's backdrop-filter stacking context, can overlap it. */}
      <div className="relative z-30 border-b border-border bg-bg/95 backdrop-blur-xl">
        <div className="container-nexus flex h-16 items-center gap-3 sm:gap-6">
          <button
            className="btn btn-ghost h-10 w-10 !px-0 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary font-display text-lg font-black text-[#04202a]">
              N
            </span>
            <span className="font-display text-xl font-black tracking-tight">
              NEXUS
            </span>
          </Link>

          {/* search with category dropdown */}
          <form
            onSubmit={submitSearch}
            className="relative ml-auto hidden h-11 flex-1 items-stretch overflow-hidden rounded-lg border border-border bg-bg-soft focus-within:border-primary md:flex md:max-w-2xl"
          >
            <div className="relative hidden border-r border-border sm:block">
              <select
                value={searchCat}
                onChange={(e) => setSearchCat(e.target.value)}
                className="h-full appearance-none bg-transparent pl-3 pr-8 text-sm text-muted focus:outline-none"
                aria-label="Search within category"
              >
                <option value="" className="bg-surface">
                  All categories
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug} className="bg-surface">
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-faint"
              />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for keyboards, mice, monitors…"
              className="flex-1 bg-transparent px-3 text-sm text-fg placeholder:text-faint focus:outline-none"
              aria-label="Search products"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-primary px-4 text-sm font-semibold text-[#04202a]"
              aria-label="Search"
            >
              <Search size={16} />
              <span className="hidden lg:inline">Search</span>
            </button>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
            {/* account */}
            <div className="relative" ref={accountRef}>
              <button
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-surface-2"
                onClick={() => setAccountOpen((v) => !v)}
                aria-label="Account menu"
                aria-expanded={accountOpen}
              >
                <UserIcon size={20} className="text-muted" />
                <span className="hidden text-xs leading-tight lg:block">
                  {mounted && user ? (
                    <>
                      <span className="block text-faint">
                        Hi, {user.name.split(" ")[0]}
                      </span>
                      <span className="block font-semibold">Account</span>
                    </>
                  ) : (
                    <>
                      <span className="block text-faint">Account</span>
                      <span className="block font-semibold">Sign in</span>
                    </>
                  )}
                </span>
                <ChevronDown size={13} className="hidden text-faint lg:block" />
              </button>

              {accountOpen && (
                <div className="nexus-popover absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-surface shadow-2xl">
                  {mounted && user ? (
                    <div className="p-1.5">
                      <div className="px-3 py-2">
                        <p className="truncate text-sm font-semibold">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {user.email}
                        </p>
                      </div>
                      <div className="my-1 h-px bg-border" />
                      <MenuItem href="/account" icon={<UserIcon size={16} />}>
                        My account
                      </MenuItem>
                      <MenuItem href="/account" icon={<Package size={16} />}>
                        My orders
                      </MenuItem>
                      {user.role === "admin" && (
                        <MenuItem
                          href="/admin"
                          icon={<LayoutDashboard size={16} />}
                        >
                          Admin dashboard
                        </MenuItem>
                      )}
                      <button
                        onClick={async () => {
                          if (!(await logout())) return;
                          setAccountOpen(false);
                          router.push("/");
                        }}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-danger transition-colors hover:bg-surface-2"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  ) : (
                    <div className="p-1.5">
                      <MenuItem href="/login" icon={<UserIcon size={16} />}>
                        Sign in
                      </MenuItem>
                      <MenuItem href="/register" icon={<Package size={16} />}>
                        Create account
                      </MenuItem>
                      <div className="my-1 h-px bg-border" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* cart */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors hover:bg-surface-2"
              aria-label="Open cart"
            >
              <span className="relative">
                <ShoppingCart size={21} />
                {count > 0 && (
                  <span
                    key={count}
                    className="nexus-cart-count absolute -right-2 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[0.7rem] font-bold text-[#04202a]"
                  >
                    {count}
                  </span>
                )}
              </span>
              <span className="hidden text-xs leading-tight lg:block">
                <span className="block text-faint">Cart</span>
                <span className="block font-semibold">
                  {count} item{count === 1 ? "" : "s"}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* mobile search row */}
        <div className="container-nexus pb-3 md:hidden">
          <form onSubmit={submitSearch} className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="input !pl-10"
            />
          </form>
        </div>
      </div>

      {/* category nav bar */}
      <div className="relative z-20 hidden border-b border-border bg-surface/70 backdrop-blur-xl lg:block">
        <div className="container-nexus flex h-11 items-center gap-1">
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              onClick={() => setMegaOpen((v) => !v)}
              aria-expanded={megaOpen}
              className="flex h-11 items-center gap-2 bg-primary/10 px-3 text-sm font-semibold text-primary"
            >
              <Menu size={16} /> All Categories <ChevronDown size={14} />
            </button>
            {megaOpen && (
              <div className="nexus-popover absolute left-0 top-11 z-50 w-[640px] rounded-b-lg border border-border bg-surface p-3 shadow-2xl">
                <div className="grid grid-cols-3 gap-1">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/products?category=${c.slug}`}
                      onClick={() => {
                        setMobileOpen(false);
                        setMegaOpen(false);
                      }}
                      className="group flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-surface-2"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-surface-2 text-muted transition-colors group-hover:border-primary/40 group-hover:text-primary">
                        <CategoryIcon
                          name={c.icon}
                          size={18}
                          strokeWidth={1.5}
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold group-hover:text-primary">
                          {c.name}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {c.tagline}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {quickLinks.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              onClick={() => {
                setMobileOpen(false);
                setMegaOpen(false);
              }}
              className="flex h-11 items-center px-3 text-sm font-medium text-muted transition-colors hover:text-primary"
            >
              {c.name}
            </Link>
          ))}
          <Link
            href="/products?deals=1"
            className="flex h-11 items-center px-3 text-sm font-semibold text-hot transition-colors hover:brightness-110"
          >
            Deals
          </Link>
          <span className="ml-auto flex items-center gap-2 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Explore
            your next upgrade
          </span>
        </div>
      </div>

      {/* mobile drawer menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="nexus-mobile-drawer absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto border-r border-border bg-bg p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-black">NEXUS</span>
              <button
                className="btn btn-ghost h-9 w-9 !px-0"
                onClick={() => setMobileOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <p className="label mb-2">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.slug}`}
                  onClick={() => {
                    setMobileOpen(false);
                    setMegaOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-md border border-border bg-surface p-2.5 text-sm"
                >
                  <CategoryIcon
                    name={c.icon}
                    size={18}
                    strokeWidth={1.5}
                    className="text-muted"
                  />
                  {c.name}
                </Link>
              ))}
            </div>
            <div className="my-4 h-px bg-border" />
            <div className="flex flex-col gap-1">
              <Link
                href="/products"
                className="rounded-md px-3 py-2.5 hover:bg-surface-2"
              >
                All products
              </Link>
              <Link
                href="/products?deals=1"
                className="rounded-md px-3 py-2.5 hover:bg-surface-2"
              >
                Deals
              </Link>
              <Link
                href="/account"
                className="rounded-md px-3 py-2.5 hover:bg-surface-2"
              >
                My account
              </Link>
              {mounted && user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-md px-3 py-2.5 hover:bg-surface-2"
                >
                  Admin dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MenuItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface-2"
    >
      {icon}
      {children}
    </Link>
  );
}
