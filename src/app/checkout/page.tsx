"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CreditCard,
  Loader2,
  Lock,
  Truck,
  Wallet,
} from "lucide-react";
import { cartSubtotal, shippingFor, useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { createOrder, listProducts } from "@/lib/repository";
import { ProductImage } from "@/components/ProductImage";
import { cn, formatPHP } from "@/lib/utils";
import { errorMessage } from "@/lib/validation";
import { dataChanged } from "@/lib/feedback";

const PAYMENTS = [
  { id: "cod", label: "Cash on Delivery", icon: Truck },
  {
    id: "demo",
    label: "Demo electronic payment (no charge)",
    icon: CreditCard,
  },
];

type FieldKey = "name" | "email" | "phone" | "address" | "city" | "zip";

export default function CheckoutPage() {
  const userId = useAuth((s) => s.user?.id);
  return <CheckoutContent key={userId ?? "anon"} />;
}
function CheckoutContent() {
  const router = useRouter();
  const { items, clear, hydrated } = useCart();
  const user = useAuth((s) => s.user);

  const submitted = useRef(false);
  const requestKey = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    address: "",
    city: "",
    zip: "",
  });
  const [payment, setPayment] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  useEffect(() => {
    let active = true;
    listProducts()
      .then((products) => {
        if (active) {
          useCart.getState().reconcile(products);
          setReady(true);
        }
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (hydrated && ready && items.length === 0 && !submitted.current)
      router.replace("/cart");
  }, [hydrated, ready, items.length, router]);

  const subtotal = cartSubtotal(items);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  const set = (k: FieldKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const validate = (): Partial<Record<FieldKey, string>> => {
    const e: Partial<Record<FieldKey, string>> = {};
    if (!form.name.trim()) e.name = "Enter your full name";
    if (!form.email.trim()) e.email = "Enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Enter a valid email address";
    if (!form.phone.trim()) e.phone = "Enter your phone number";
    if (!form.zip.trim()) e.zip = "Enter your ZIP / postal code";
    if (!form.address.trim()) e.address = "Enter your address";
    if (!form.city.trim()) e.city = "Enter your city or municipality";
    return e;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted.current || submitting) return;
    if (!user) {
      router.push("/login?next=/checkout");
      return;
    }
    const fieldErrors = validate();
    setErrors(fieldErrors);
    const firstInvalid = Object.keys(fieldErrors)[0] as FieldKey | undefined;
    if (firstInvalid) {
      setError("Please fix the highlighted fields before placing your order.");
      document.getElementById(`co-${firstInvalid}`)?.focus();
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      requestKey.current ??=
        sessionStorage.getItem("nexus.checkout.request") || crypto.randomUUID();
      sessionStorage.setItem("nexus.checkout.request", requestKey.current);
      const order = await createOrder({
        items: items.map(({ productId, quantity }) => ({
          productId,
          quantity,
        })),
        customer: form,
        paymentMethod: payment,
        requestKey: requestKey.current,
      });
      submitted.current = true;
      sessionStorage.removeItem("nexus.checkout.request");
      clear();
      dataChanged();
      router.replace(`/order/${order.id}?new=1`);
    } catch (e) {
      setError(errorMessage(e));
      setSubmitting(false);
    }
  };

  if (error && !ready)
    return (
      <div role="alert" className="container-nexus py-24 text-danger">
        {error}
        <button
          className="btn btn-ghost ml-3"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  if (!hydrated || items.length === 0) {
    return (
      <div className="container-nexus py-24 text-center text-muted">
        Loading checkout…
      </div>
    );
  }

  if (!user)
    return (
      <div className="container-nexus py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Sign in to checkout</h1>
        <p className="my-4 text-muted">
          Your account keeps orders private and accessible across devices.
        </p>
        <Link href="/login?next=/checkout" className="btn btn-primary">
          Sign in
        </Link>
      </div>
    );

  return (
    <div className="container-nexus py-8">
      <h1 className="mb-6 font-display text-3xl font-black">Checkout</h1>
      {/* noValidate: the browser's native bubbles would pre-empt onSubmit and
          clash with the styled field errors below. */}
      <form
        onSubmit={submit}
        noValidate
        className="grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        <div className="flex flex-col gap-6">
          {/* contact / shipping */}
          <section className="panel p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
              <Truck size={18} className="text-primary" /> Shipping details
            </h2>
            {error && (
              <p
                role="alert"
                className="mb-4 flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
              >
                <AlertCircle size={15} className="shrink-0" /> {error}
              </p>
            )}
            {!user && (
              <p className="mb-4 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-muted">
                Sign in to protect your order history.{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>{" "}
                to save your order history.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                error={errors.name}
                errorId="co-name-err"
              >
                <input
                  id="co-name"
                  className={cn("input", errors.name && "input-error")}
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Juan Dela Cruz"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "co-name-err" : undefined}
                />
              </Field>
              <Field label="Email" error={errors.email} errorId="co-email-err">
                <input
                  id="co-email"
                  type="email"
                  className={cn("input", errors.email && "input-error")}
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@email.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "co-email-err" : undefined}
                />
              </Field>
              <Field label="Phone" error={errors.phone} errorId="co-phone-err">
                <input
                  id="co-phone"
                  type="tel"
                  className={cn("input", errors.phone && "input-error")}
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="0917 000 0000"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "co-phone-err" : undefined}
                />
              </Field>
              <Field
                label="ZIP / Postal code"
                error={errors.zip}
                errorId="co-zip-err"
              >
                <input
                  id="co-zip"
                  inputMode="numeric"
                  className={cn("input", errors.zip && "input-error")}
                  value={form.zip}
                  onChange={set("zip")}
                  placeholder="1000"
                  aria-invalid={!!errors.zip}
                  aria-describedby={errors.zip ? "co-zip-err" : undefined}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field
                  label="Address"
                  error={errors.address}
                  errorId="co-address-err"
                >
                  <input
                    id="co-address"
                    className={cn("input", errors.address && "input-error")}
                    value={form.address}
                    onChange={set("address")}
                    placeholder="House no., street, barangay"
                    aria-invalid={!!errors.address}
                    aria-describedby={
                      errors.address ? "co-address-err" : undefined
                    }
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="City / Municipality"
                  error={errors.city}
                  errorId="co-city-err"
                >
                  <input
                    id="co-city"
                    className={cn("input", errors.city && "input-error")}
                    value={form.city}
                    onChange={set("city")}
                    placeholder="Quezon City"
                    aria-invalid={!!errors.city}
                    aria-describedby={errors.city ? "co-city-err" : undefined}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* payment */}
          <section className="panel p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
              <Wallet size={18} className="text-primary" /> Payment method
            </h2>
            <div
              role="radiogroup"
              aria-label="Payment method"
              className="grid gap-3 sm:grid-cols-2"
            >
              {PAYMENTS.map((p) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={payment === p.id}
                  key={p.id}
                  onClick={() => setPayment(p.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                    payment === p.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-border/80 hover:bg-surface-2"
                  }`}
                >
                  <p.icon
                    size={20}
                    className={payment === p.id ? "text-primary" : "text-muted"}
                  />
                  <span className="text-sm font-semibold">{p.label}</span>
                  <span
                    className={`ml-auto grid h-4 w-4 place-items-center rounded-full border ${
                      payment === p.id ? "border-primary" : "border-border"
                    }`}
                  >
                    {payment === p.id && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
              <Lock size={12} /> This is a demo store — no real payment is
              processed.
            </p>
          </section>
        </div>

        {/* summary */}
        <aside className="h-fit lg:sticky lg:top-40">
          <div className="panel p-5">
            <h2 className="mb-4 font-display text-lg font-bold">Your order</h2>
            <ul className="mb-4 flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
              {items.map((i) => (
                <li key={i.productId} className="flex items-center gap-3">
                  <div className="relative">
                    <ProductImage
                      swatch={i.swatch}
                      categorySlug={i.categorySlug}
                      brand={i.brand}
                      name={i.name}
                      showBrand={false}
                      className="h-14 w-14 shrink-0 rounded-lg"
                      iconClassName="h-6 w-6"
                    />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-surface-3 px-1 text-[0.65rem] font-bold">
                      {i.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium">{i.name}</p>
                    <p className="text-xs text-muted">{i.brand}</p>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatPHP(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between py-1 text-sm text-muted">
              <span>Subtotal</span>
              <span className="text-fg">{formatPHP(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm text-muted">
              <span>Shipping</span>
              <span className={shipping === 0 ? "text-success" : "text-fg"}>
                {shipping === 0 ? "FREE" : formatPHP(shipping)}
              </span>
            </div>
            <div className="my-3 divider-glow" />
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-display text-2xl font-black text-primary">
                {formatPHP(total)}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting || !ready}
              className="btn btn-primary mt-4 w-full"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Placing order…
                </>
              ) : (
                `Place order · ${formatPHP(total)}`
              )}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  errorId,
  children,
}: {
  label: string;
  error?: string;
  errorId?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label mb-1 block">{label}</span>
      {children}
      {error && (
        <span
          id={errorId}
          className="mt-1 flex items-center gap-1 text-xs text-danger"
        >
          <AlertCircle size={12} className="shrink-0" /> {error}
        </span>
      )}
    </label>
  );
}
