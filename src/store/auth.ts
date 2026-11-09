"use client";
import { create } from "zustand";
import type { User as AuthUser } from "@supabase/supabase-js";
import type { Role } from "@/lib/types";
import { getSupabase } from "@/lib/supabase";
import { errorMessage } from "@/lib/validation";
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};
type Result = { ok: true; message?: string } | { ok: false; error: string };
type AuthState = {
  user: SessionUser | null;
  hydrated: boolean;
  error: string;
  sync: (user: AuthUser | null) => Promise<void>;
  login: (email: string, password: string) => Promise<Result>;
  register: (name: string, email: string, password: string) => Promise<Result>;
  logout: () => Promise<boolean>;
};
let revision = 0;
export const useAuth = create<AuthState>()((set, get) => ({
  user: null,
  hydrated: false,
  error: "",
  sync: async (user) => {
    const current = ++revision;
    if (!user) {
      set({ user: null, hydrated: true, error: "" });
      return;
    }
    try {
      const { data, error } = await getSupabase()
        .from("profiles")
        .select("id,name,email,role")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      if (current === revision)
        set({ user: data as SessionUser, hydrated: true, error: "" });
    } catch (e) {
      if (current === revision)
        set({ user: null, hydrated: true, error: errorMessage(e) });
    }
  },
  login: async (email, password) => {
    try {
      const { data, error } = await getSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      await get().sync(data.user);
      if (get().error) throw new Error(get().error);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errorMessage(e) };
    }
  },
  register: async (name, email, password) => {
    try {
      const { data, error } = await getSupabase().auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: name.trim() },
          emailRedirectTo: window.location.origin + "/account",
        },
      });
      if (error) throw error;
      if (!data.session)
        return {
          ok: true,
          message: "Check your email to confirm your account, then sign in. ",
        };
      await get().sync(data.user);
      if (get().error) throw new Error(get().error);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errorMessage(e) };
    }
  },
  logout: async () => {
    try {
      const { error } = await getSupabase().auth.signOut();
      if (error) throw error;
      ++revision;
      set({ user: null, hydrated: true, error: "" });
      return true;
    } catch (error) {
      set({ error: errorMessage(error) });
      return false;
    }
  },
}));
