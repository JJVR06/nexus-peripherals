"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/store/auth";
import { authDestination } from "@/lib/auth-routing";
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next");
  const destination = user ? authDestination(user.role, next) : null;
  useEffect(() => {
    if (hydrated && destination) router.replace(destination);
  }, [hydrated, destination, router]);
  if (!hydrated || user)
    return (
      <div
        role="status"
        className="container-nexus py-24 text-center text-muted"
      >
        {user ? "Opening your account…" : "Checking your session…"}
      </div>
    );
  return <>{children}</>;
}
