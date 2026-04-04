import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Lock, Mail } from "lucide-react";

type AuthMode = "login" | "signup";

type LocationState = {
  from?: {
    pathname: string;
    search?: string;
  };
};

interface AuthPageProps {
  mode: AuthMode;
}

export default function AuthPage({ mode }: AuthPageProps) {
  const { session, loading, signIn, signUp, useAccessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const destination = useMemo(() => {
    const state = location.state as LocationState | null;
    return state?.from?.pathname ?? "/";
  }, [location.state]);

  useEffect(() => {
    if (!loading && session) {
      navigate(destination, { replace: true });
    }
  }, [destination, loading, navigate, session]);

  useEffect(() => {
    if (mode !== "login") return;

    const params = new URLSearchParams(location.search);
    const accessToken = params.get("access_token");
    const verificationFailed = params.get("verification") === "failed";
    const emailVerified = params.get("email_verified") === "true";

    if (verificationFailed) {
      setNotice("Verification link is invalid or expired.");
      return;
    }

    if (!accessToken) {
      if (emailVerified) {
        setNotice("Email verified. Please sign in.");
      }
      return;
    }

    let active = true;

    (async () => {
      const ok = await useAccessToken(accessToken);
      if (!active) return;
      if (!ok) {
        setNotice("Could not activate your session. Please sign in.");
      } else {
        setNotice("Email verified successfully.");
      }
    })();

    return () => {
      active = false;
    };
  }, [location.search, mode, useAccessToken]);

  const title = mode === "login" ? "Welcome back" : "Create account";
  const submitLabel = mode === "login" ? "Sign in" : "Sign up";
  const switchLabel = mode === "login" ? "Need an account?" : "Already have one?";
  const switchHref = mode === "login" ? "/signup" : "/login";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    if (!email.trim() || !password.trim()) {
      setNotice("Enter both email and password.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setNotice("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const result =
      mode === "login"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
    setSubmitting(false);

    if (result.error) {
      setNotice(result.error);
      return;
    }

    if (result.needsConfirmation) {
      setNotice("Check your email for next steps.");
      return;
    }

    navigate(destination, { replace: true });
  };

  return (
    <main
      className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
      style={{
        background: "#0f0f0f",
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md items-center justify-center">
        <div className="w-full">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.28em] text-gray-500">
              {mode === "login" ? "Sign In" : "Sign Up"}
            </p>
            <h2
              className="mt-2 text-4xl text-white"
              style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.04em" }}
            >
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Use the same account across analysis, history, and exports.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#151515] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
          >
              <label className="block space-y-2">
                <span className="text-sm text-gray-300">Email</span>
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 py-4 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#FFD93D]/70"
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-gray-300">Password</span>
                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 py-4 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#FFD93D]/70"
                  />
                </div>
              </label>

              {mode === "signup" && (
                <label className="block space-y-2">
                  <span className="text-sm text-gray-300">Confirm password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat your password"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 py-4 px-4 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#FFD93D]/70"
                  />
                </label>
              )}

              {notice && (
                <div
                  className="rounded-2xl border px-4 py-3 text-sm"
                  style={{
                    borderColor: notice.includes("Check your email")
                      ? "rgba(107,203,119,0.35)"
                      : "rgba(255,107,157,0.35)",
                    background: notice.includes("Check your email")
                      ? "rgba(107,203,119,0.08)"
                      : "rgba(255,107,157,0.08)",
                    color: notice.includes("Check your email") ? "#9CE6AC" : "#FF9BB8",
                  }}
                >
                  {notice}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold text-black transition-transform disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  background: "#FFD93D",
                  boxShadow: "0 14px 30px rgba(255, 217, 61, 0.16)",
                }}
              >
                <span>{submitting ? "Processing..." : submitLabel}</span>
                {!submitting && <ArrowRight size={16} />}
              </button>

              <div className="flex items-center justify-between gap-4 pt-2 text-sm text-gray-400">
                <span>{switchLabel}</span>
                <Link
                  to={switchHref}
                  className="font-semibold text-[#FFD93D] transition-opacity hover:opacity-80"
                >
                  {mode === "login" ? "Create account" : "Sign in"}
                </Link>
              </div>
          </form>
        </div>
      </div>
    </main>
  );
}
