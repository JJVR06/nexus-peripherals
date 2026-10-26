import Link from "next/link";
import {
  Globe,
  MessageCircle,
  Send,
  AtSign,
  ShieldCheck,
  Truck,
  CreditCard,
  Headset,
  Mail,
} from "lucide-react";
import { categories } from "@/lib/data/categories";

const PAYMENTS = ["Visa", "Mastercard", "GCash", "Maya", "BDO", "COD"];

export function Footer() {
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
              <p className="font-display text-lg font-bold">Join the Nexus list</p>
              <p className="text-sm text-muted">New drops, restocks and members-only deals.</p>
            </div>
          </div>
          <form className="flex w-full max-w-md gap-2">
            <input type="email" placeholder="you@email.com" className="input" aria-label="Email address" />
            <button type="submit" className="btn btn-primary shrink-0">Subscribe</button>
          </form>
        </div>
      </div>

      {/* trust bar */}
      <div className="border-b border-border-soft">
        <div className="container-nexus grid grid-cols-2 gap-4 py-8 md:grid-cols-4">
          {[
            { icon: Truck, title: "Fast nationwide shipping", sub: "Free over ₱5,000" },
            { icon: ShieldCheck, title: "Official warranty", sub: "Authorized PH distributor" },
            { icon: CreditCard, title: "Secure checkout", sub: "0% installment options" },
            { icon: Headset, title: "Expert support", sub: "Real gamers, 24/7" },
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
            The Philippines&apos; battle station for PC gaming peripherals. Build
            your setup with gear trusted by pros and enthusiasts.
          </p>
          <div className="mt-4 flex gap-2">
            {[Globe, MessageCircle, Send, AtSign].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-md border border-border bg-surface text-muted transition-colors hover:border-primary/50 hover:text-primary"
                aria-label="Social link"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 font-display text-sm font-bold">Shop</p>
          <ul className="flex flex-col gap-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={`/products?category=${c.slug}`} className="link-muted">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 font-display text-sm font-bold">Company</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/products" className="link-muted">All products</Link></li>
            <li><Link href="/products?deals=1" className="link-muted">Deals</Link></li>
            <li><Link href="/account" className="link-muted">My account</Link></li>
            <li><a href="#" className="link-muted">About us</a></li>
            <li><a href="#" className="link-muted">Careers</a></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-display text-sm font-bold">Support</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li><a href="#" className="link-muted">Shipping &amp; returns</a></li>
            <li><a href="#" className="link-muted">Warranty claims</a></li>
            <li><a href="#" className="link-muted">Track order</a></li>
            <li><a href="#" className="link-muted">Contact us</a></li>
            <li><a href="#" className="link-muted">FAQ</a></li>
          </ul>
        </div>
      </div>

      {/* payment + legal */}
      <div className="border-t border-border-soft">
        <div className="container-nexus flex flex-col items-center justify-between gap-4 py-5 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Nexus Peripherals. Prices in ₱ PHP.</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {PAYMENTS.map((p) => (
              <span key={p} className="rounded border border-border bg-surface px-2 py-1 text-[0.7rem] font-semibold text-muted">
                {p}
              </span>
            ))}
          </div>
          <p className="flex gap-4">
            <a href="#" className="link-muted">Privacy</a>
            <a href="#" className="link-muted">Terms</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
