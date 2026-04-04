import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

type AuthActionResult = {
  error?: string;
  needsConfirmation?: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const VITE_FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL ?? "";

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error("Failed to read Supabase session:", error.message);
      }
      setSession(data.session ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn: async (email, password) => {
        if (!hasSupabaseConfig) {
          return {
            error:
              "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using auth.",
          };
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return error ? { error: error.message } : {};
      },
      signUp: async (email, password) => {
        if (!hasSupabaseConfig) {
          return {
            error:
              "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using auth.",
          };
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${VITE_FRONTEND_URL}/login`,
          },
        });

        if (error) {
          return { error: error.message };
        }

        return data.session
          ? {}
          : {
              needsConfirmation: true,
            };
      },
      signOut: async () => {
        if (!hasSupabaseConfig) {
          return {
            error:
              "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using auth.",
          };
        }

        const { error } = await supabase.auth.signOut();
        return error ? { error: error.message } : {};
      },
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
