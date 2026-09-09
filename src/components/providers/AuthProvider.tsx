"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { ensureProfile, fetchProfile, saveProfilePatch } from "@/lib/auth/profile";
import type { AuthStatus, Profile, ProfilePatch } from "@/lib/auth/types";
import { mapAuthError } from "@/lib/auth/validation";
import { isSupabasePublicConfigured } from "@/lib/env";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  status: AuthStatus;
  loading: boolean;
  user: User | null;
  profile: Profile | null;
  configured: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    input: SignUpInput,
  ) => Promise<{ error: string | null; needsEmailConfirm: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const configured = isSupabasePublicConfigured();
  const [status, setStatus] = useState<AuthStatus>(
    configured ? "loading" : "unauthenticated",
  );
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const applyUser = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setUser(null);
      setProfile(null);
      setStatus("unauthenticated");
      return;
    }
    if (!isSupabasePublicConfigured()) {
      setUser(nextUser);
      setProfile(null);
      setStatus("authenticated");
      return;
    }
    const supabase = createBrowserSupabaseClient();
    const nextProfile = await ensureProfile(supabase, nextUser);
    setUser(nextUser);
    setProfile(nextProfile);
    setStatus("authenticated");
  }, []);

  useEffect(() => {
    if (!configured) {
      return;
    }

    const supabase = createBrowserSupabaseClient();
    let cancelled = false;

    void supabase.auth.getUser().then(({ data, error }) => {
      if (cancelled) {
        return;
      }
      if (error || !data.user) {
        void applyUser(null);
        return;
      }
      void applyUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || cancelled) {
        return;
      }
      void applyUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [applyUser, configured]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!isSupabasePublicConfigured()) {
        return {
          error:
            "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
        };
      }
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        return { error: mapAuthError(error.message) };
      }
      await applyUser(data.user);
      return { error: null };
    },
    [applyUser],
  );

  const signUp = useCallback(
    async (input: SignUpInput) => {
      if (!isSupabasePublicConfigured()) {
        return {
          error:
            "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
          needsEmailConfirm: false,
        };
      }
      const supabase = createBrowserSupabaseClient();
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          data: { full_name: input.fullName.trim() },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });
      if (error) {
        return { error: mapAuthError(error.message), needsEmailConfirm: false };
      }
      if (data.user && data.session) {
        await applyUser(data.user);
        return { error: null, needsEmailConfirm: false };
      }
      return { error: null, needsEmailConfirm: true };
    },
    [applyUser],
  );

  const signOut = useCallback(async () => {
    if (isSupabasePublicConfigured()) {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setStatus("unauthenticated");
    router.replace("/");
    router.refresh();
  }, [router]);


  const refreshProfile = useCallback(async () => {
    if (!user || !isSupabasePublicConfigured()) {
      return;
    }
    const supabase = createBrowserSupabaseClient();
    const next = await fetchProfile(supabase, user.id);
    setProfile(next);
  }, [user]);

  const updateProfile = useCallback(
    async (patch: ProfilePatch) => {
      if (!user || !isSupabasePublicConfigured()) {
        return { error: "You need to be signed in to update your profile." };
      }
      const supabase = createBrowserSupabaseClient();
      const { profile: next, error } = await saveProfilePatch(
        supabase,
        user.id,
        patch,
      );
      if (error) {
        return { error };
      }
      if (next) {
        setProfile(next);
      }
      return { error: null };
    },
    [user],
  );

  const value = useMemo(
    () => ({
      status,
      loading: status === "loading",
      user,
      profile,
      configured,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [
      status,
      user,
      profile,
      configured,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
