"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/store/auth";
import { errorMessage } from "@/lib/validation";
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState("");
  const authError = useAuth((s) => s.error);
  useEffect(() => {
    const onError = (event: Event) =>
      setError((event as CustomEvent<string>).detail);
    window.addEventListener("nexus:error", onError);
    // Remove old demo credentials; Supabase manages its own session storage.
    try {
      for (const key of Object.keys(localStorage))
        if (key === "nexus.auth" || key.startsWith("nexus.users."))
          localStorage.removeItem(key);
    } catch {}
    let active = true;
    let unsubscribe: (() => void) | undefined;
    try {
      const db = getSupabase();
      const sync = async () => {
        const {
          data: { session },
        } = await db.auth.getSession();
        if (!active) return;
        if (!session) {
          await useAuth.getState().sync(null);
          return;
        }
        const {
          data: { user },
          error,
        } = await db.auth.getUser();
        if (active) {
          if (error) setError(errorMessage(error));
          await useAuth.getState().sync(user);
        }
      };
      void sync().catch((e) => {
        if (active) {
          setError(errorMessage(e));
          void useAuth.getState().sync(null);
        }
      });
      const { data } = db.auth.onAuthStateChange(() => {
        setTimeout(() => {
          if (active) void sync().catch((e) => setError(errorMessage(e)));
        }, 0);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch (e) {
      setTimeout(() => {
        if (active) {
          setError(errorMessage(e));
          void useAuth.getState().sync(null);
        }
      }, 0);
    }
    return () => {
      active = false;
      unsubscribe?.();
      window.removeEventListener("nexus:error", onError);
    };
  }, []);
  return (
    <>
      {(error || authError) && (
        <div
          role="alert"
          className="border-b border-danger/40 bg-danger/10 px-5 py-3 text-sm"
        >
          <strong>Action needed: </strong>
          {error || authError}
          <button
            onClick={() => {
              setError("");
              useAuth.setState({ error: "" });
            }}
            className="ml-4 underline"
          >
            Dismiss
          </button>
        </div>
      )}
      {children}
    </>
  );
}
