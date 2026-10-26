"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "@/lib/types";
import { createUser, findUserByEmail } from "@/lib/repository";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type Result = { ok: true } | { ok: false; error: string };

type AuthState = {
  user: SessionUser | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<Result>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<Result>;
  logout: () => void;
};

const toSession = (u: User): SessionUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
});

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      login: async (email, password) => {
        const found = await findUserByEmail(email.trim());
        if (!found) return { ok: false, error: "No account with that email." };
        if (found.password !== password)
          return { ok: false, error: "Incorrect password." };
        set({ user: toSession(found) });
        return { ok: true };
      },
      register: async (name, email, password) => {
        const trimmed = email.trim();
        const existing = await findUserByEmail(trimmed);
        if (existing)
          return { ok: false, error: "An account with that email exists." };
        const user = await createUser({
          name: name.trim(),
          email: trimmed,
          password,
        });
        set({ user: toSession(user) });
        return { ok: true };
      },
      logout: () => set({ user: null }),
    }),
    {
      name: "nexus.auth",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
