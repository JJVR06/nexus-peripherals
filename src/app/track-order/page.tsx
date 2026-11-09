"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";
export default function TrackingPage() {
  const [id, setId] = useState("");
  const router = useRouter();
  const user = useAuth((s) => s.user);
  return (
    <div className="container-nexus max-w-xl py-12">
      <h1 className="mb-4 font-display text-3xl font-bold">Track your order</h1>
      <p className="mb-6 text-muted">
        Sign in with the account that placed the order. Only you and store
        administrators can view its details.
      </p>
      {!user ? (
        <Link href="/login?next=/track-order" className="btn btn-primary">
          Sign in
        </Link>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (id.trim())
              router.push(`/order/${encodeURIComponent(id.trim())}`);
          }}
          className="panel space-y-4 p-5"
        >
          <label className="block">
            Order number
            <input
              required
              className="input mt-2"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="NX-…"
            />
          </label>
          <button className="btn btn-primary">View status</button>
          <Link href="/account" className="btn btn-ghost">
            Order history
          </Link>
        </form>
      )}
    </div>
  );
}
