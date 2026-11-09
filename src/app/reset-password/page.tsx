"use client";
import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { errorMessage } from "@/lib/validation";
import { useAuth } from "@/store/auth";
export default function PasswordPage() {
  const user = useAuth((s) => s.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (user) {
        if (password.length < 8 || password !== confirm)
          throw new Error("Enter matching passwords of at least 8 characters.");
        const { error } = await getSupabase().auth.updateUser({ password });
        if (error) throw error;
        setMessage("Password updated.");
        setPassword("");
        setConfirm("");
      } else {
        const { error } = await getSupabase().auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: window.location.origin + "/reset-password" },
        );
        if (error) throw error;
        setMessage(
          "If that email has an account, a password reset link will be sent. Delivery depends on your Supabase email configuration.",
        );
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container-nexus max-w-lg py-12">
      <h1 className="mb-6 font-display text-3xl font-bold">
        {user ? "Set a new password" : "Reset password"}
      </h1>
      <form onSubmit={submit} className="panel space-y-4 p-5">
        {user ? (
          <>
            <label className="block">
              New password
              <input
                className="input mt-2"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="block">
              Confirm password
              <input
                className="input mt-2"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
          </>
        ) : (
          <label className="block">
            Account email
            <input
              required
              className="input mt-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        )}
        {error && (
          <p role="alert" className="text-danger">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-success">
            {message}
          </p>
        )}
        <button disabled={busy} className="btn btn-primary">
          {busy ? "Please wait…" : user ? "Update password" : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
