"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { getSupabase } from "@/lib/supabase";
import { errorMessage } from "@/lib/validation";
export function AccountSettings() {
  const user = useAuth((s) => s.user);
  const [name, setName] = useState(user?.name ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const trimmed = name.trim();
      if (trimmed.length < 2 || trimmed.length > 100)
        throw new Error("Name must contain 2 to 100 characters.");
      const { error } = await getSupabase()
        .from("profiles")
        .update({ name: trimmed })
        .eq("id", user.id);
      if (error) throw error;
      useAuth.setState({ user: { ...user, name: trimmed } });
      setMessage("Profile updated.");
    } catch (e) {
      setMessage(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="panel mb-8 p-5">
      <h2 className="mb-4 font-display text-lg font-bold">Account settings</h2>
      <form onSubmit={save} className="flex flex-wrap items-end gap-3">
        <label className="flex-1 text-sm">
          Display name
          <input
            className="input mt-2"
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button disabled={busy} className="btn btn-primary">
          {busy ? "Saving…" : "Save name"}
        </button>
        <Link href="/reset-password" className="btn btn-ghost">
          Change password
        </Link>
      </form>
      {message && (
        <p role="status" className="mt-3 text-sm text-muted">
          {message}
        </p>
      )}
    </section>
  );
}
