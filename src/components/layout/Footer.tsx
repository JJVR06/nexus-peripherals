"use client";
import { useState } from "react";
import { useCategories } from "@/lib/hooks";
import { useAuth } from "@/store/auth";
import { subscribeNewsletter } from "@/lib/repository";
import { errorMessage } from "@/lib/validation";
import Link from "next/link";
import { ShieldCheck, Truck, CreditCard, Headset, Mail } from "lucide-react";

const PAYMENTS = ["COD demo", "Simulated electronic payment"];

export function Footer() {
  const categories = useCategories() ?? [];
  const user = useAuth((s) => s.user);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await subscribeNewsletter();
      setMessage(
        "Preference saved. No marketing emails are sent by this presentation project.",
      );
    } catch (e) {
      setMessage(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="mt-16 border-t border-border bg-bg-soft">
      {/* newsletter */}
      <div className="border-b border-border-soft">
        <div className="container-nexus flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
          <div className="flex items-center gap-3 text-center md:text-left">
            <span className="hidden h-11 w-11 place-items-center rounded-lg border border-border bg-surface text-primary md:grid">
              <Mail size={20} />
            </span>
            <div>
              <p className="font-display text-lg font-bold">
                Join the Nexus list
              </p>
              <p className="text-sm text-muted">
                Save your preference for this presentation.
              </p>
            </div>
          </div>
          <form
            onSubmit={subscribe}
            className="flex w-full max-w-md flex-wrap gap-2"
          >
            <input
              type="email"
              readOnly
              value={user?.email ?? ""}
              placeholder="Sign in to subscribe"
              className="input"
              aria-label="Account email address"
            />
            <button
              type="submit"
              disabled={busy || !user}
              className="btn btn-primary shrink-0"
            >
              {busy ? "Saving…" : "Subscribe"}
            </button>
            {!user && (
              <Link href="/login" className="text-sm text-primary">
                Sign in
              </Link>
            )}
            {message && (
              <p role="status" className="w-full text-xs text-muted">
                {message}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* trust bar */}
      <div className="border-b border-border-soft">
        <div className="container-nexus grid grid-cols-2 gap-4 py-8 md:grid-cols-4">
          {[
            { icon: Truck, title: "Demo shipping", sub: "Free over ₱5,000" },
            {
              icon: ShieldCheck,
              title: "Sample catalog",
              sub: "For presentation only",
            },
            {
              icon: CreditCard,
              title: "Account-protected orders",
              sub: "No real payments",
            },
            {
              icon: Headset,
              title: "Project support",
              sub: "Contact the presenter",
            },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border bg-surface text-primary">
                <f.icon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-muted">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-nexus grid grid-cols-2 gap-8 py-12 md:grid-cols-5">
        <div className="col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary font-display text-lg font-black text-[#04202a]">
              N
            </span>
            <span className="font-display text-xl font-black">NEXUS</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted">
            The Philippines&apos; battle station for PC gaming peripherals.
            Build your setup with gear trusted by pros and enthusiasts.
          </p>
        </div>

        <div>
          <p className="mb-3 font-display text-sm font-bold">Shop</p>
          <ul className="flex flex-col gap-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/products?category=${c.slug}`}
                  className="link-muted"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 font-display text-sm font-bold">Company</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/products" className="link-muted">
                All products
              </Link>
            </li>
            <li>
              <Link href="/products?deals=1" className="link-muted">
                Deals
              </Link>
            </li>
            <li>
              <Link href="/account" className="link-muted">
                My account
              </Link>
            </li>
            <li>
              <Link href="/help/about" className="link-muted">
                About this project
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-display text-sm font-bold">Support</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/help/shipping" className="link-muted">
                Shipping &amp; returns
              </Link>
            </li>
            <li>
              <Link href="/help/warranty" className="link-muted">
                Warranty claims
              </Link>
            </li>
            <li>
              <Link href="/track-order" className="link-muted">
                Track order
              </Link>
            </li>
            <li>
              <Link href="/help/contact" className="link-muted">
                Contact us
              </Link>
            </li>
            <li>
              <Link href="/help/faq" className="link-muted">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* payment + legal */}
      <div className="border-t border-border-soft">
        <div className="container-nexus flex flex-col items-center justify-between gap-4 py-5 text-xs text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} Nexus Peripherals. Prices in ₱ PHP.
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {PAYMENTS.map((p) => (
              <span
                key={p}
                className="rounded border border-border bg-surface px-2 py-1 text-[0.7rem] font-semibold text-muted"
              >
                {p}
              </span>
            ))}
          </div>
          <p className="flex gap-4">
            <Link href="/help/privacy" className="link-muted">
              Privacy
            </Link>
            <Link href="/help/terms" className="link-muted">
              Terms
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
