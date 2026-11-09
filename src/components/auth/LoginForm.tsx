"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { safeNext } from "@/lib/validation";
import { useAuth } from "@/store/auth";

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNext(sp.get("next"));
  const login = useAuth((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) router.push(next);
    else setError(res.error);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="block">
        <span className="label mb-1 block">Email</span>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
        />
      </label>
      <label className="block">
        <span className="label mb-1 block">Password</span>
        <div className="relative">
          <input
            className="input !pr-10"
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-fg"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full"
      >
        <LogIn size={16} /> {loading ? "Signing in…" : "Sign in"}
      </button>

      <Link href="/reset-password" className="text-sm text-primary">
        Forgot your password?
      </Link>

      <p className="text-center text-sm text-muted">
        New to Nexus?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
