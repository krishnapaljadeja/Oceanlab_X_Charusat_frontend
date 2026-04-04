import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AuthApiResult,
  AuthSession,
  AuthUser,
  establishSessionFromAccessToken,
  getStoredSession,
  setStoredSession,
  signInWithBackend,
  signOutWithBackend,
  signUpWithBackend,
  validateSessionWithBackend,
} from "@/lib/auth";

type AuthContextValue = {
  session: AuthSession | null;
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthApiResult>;
  signUp: (email: string, password: string) => Promise<AuthApiResult>;
  signOut: () => Promise<AuthApiResult>;
  useAccessToken: (accessToken: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const stored = getStoredSession();
      if (!stored) {
        if (active) {
          setSession(null);
          setLoading(false);
        }
        return;
      }

      const validated = await validateSessionWithBackend(stored);
      if (!active) return;

      if (!validated) {
        setStoredSession(null);
        setSession(null);
        setLoading(false);
        return;
      }

      setStoredSession(validated);
      setSession(validated);
      setLoading(false);
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn: async (email, password) => {
        const { result, session: nextSession } = await signInWithBackend(
          email,
          password,
        );
        if (nextSession) {
          setStoredSession(nextSession);
          setSession(nextSession);
        }
        return result;
      },
      signUp: async (email, password) => {
        const { result, session: nextSession } = await signUpWithBackend(
          email,
          password,
        );
        if (nextSession) {
          setStoredSession(nextSession);
          setSession(nextSession);
        }
        return result;
      },
      signOut: async () => {
        const result = await signOutWithBackend();
        setStoredSession(null);
        setSession(null);
        return result;
      },
      useAccessToken: async (accessToken: string) => {
        const nextSession = await establishSessionFromAccessToken(accessToken);
        if (!nextSession) {
          return false;
        }
        setStoredSession(nextSession);
        setSession(nextSession);
        return true;
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
