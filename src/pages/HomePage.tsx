import { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { analyzeRepo } from "@/lib/api";
import LoadingState from "@/components/LoadingState";
import ErrorBanner from "@/components/ErrorBanner";
import RepoInput from "@/components/RepoInput";

// Floating background icons (git-themed)
const FLOAT_ICONS = [
  "⎇",
  "◈",
  "⌀",
  "⬡",
  "◉",
  "⎇",
  "◈",
  "◉",
  "⬡",
  "⎇",
  "◈",
  "⌀",
];

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const iconsRef = useRef<HTMLDivElement[]>([]);

  useGSAP(
    () => {
      if (!headingRef.current || !subRef.current) return;

      // Entrance animations
      gsap.from(headingRef.current, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
      gsap.from(subRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: "power3.out",
      });

      // Gentle float on heading
      gsap.to(headingRef.current, {
        y: -8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Float the background icons
      iconsRef.current.forEach((el, _i) => {
        if (!el) return;
        gsap.set(el, {
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 60,
          rotation: Math.random() * 360,
        });
        gsap.to(el, {
          y: -100,
          duration: 12 + Math.random() * 10,
          repeat: -1,
          delay: -Math.random() * 18,
          ease: "none",
          rotation: `+=${Math.random() > 0.5 ? 180 : -180}`,
        });
      });
    },
    { scope: heroRef },
  );

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setError(null);
    const result = await analyzeRepo(url);
    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    sessionStorage.setItem("analysisResult", JSON.stringify(result));
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    navigate(`/analyze?owner=${parts[0]}&repo=${parts[1]}`);
  };

  const handleForceRefresh = async (url: string) => {
    setIsLoading(true);
    setError(null);
    const { refreshRepo } = await import("@/lib/api");
    const result = await refreshRepo(url);
    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    sessionStorage.setItem("analysisResult", JSON.stringify(result));
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    navigate(`/analyze?owner=${parts[0]}&repo=${parts[1]}`);
  };

  // Auto-trigger analysis when navigated from history or analyze page
  useEffect(() => {
    const repoParam = searchParams.get("repo");
    const force = searchParams.get("force") === "true";
    if (repoParam) {
      const fullUrl = `https://github.com/${repoParam}`;
      if (force) {
        handleForceRefresh(fullUrl);
      } else {
        handleAnalyze(fullUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      ref={heroRef}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4"
    >
      {/* Top-right history link */}
      <div className="absolute top-5 right-6 z-20">
        <button
          onClick={() => navigate("/history")}
          className="flex items-center gap-2 text-sm transition-opacity hover:opacity-80"
          style={{ color: "#666", fontFamily: "'DM Sans', sans-serif" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>History</span>
        </button>
      </div>

      {/* Floating background icons */}
      {FLOAT_ICONS.map((icon, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) iconsRef.current[i] = el;
          }}
          className="absolute pointer-events-none select-none text-white"
          style={{
            opacity: 0.04,
            fontSize: "2rem",
            willChange: "transform",
            zIndex: 0,
          }}
        >
          {icon}
        </div>
      ))}

      {/* Hero content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Eyebrow label */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border-2 border-[#2a2a2a] bg-[#1a1a1a]">
          <span className="w-2 h-2 rounded-full bg-[#6BCB77] animate-pulse" />
          <span className="text-sm text-gray-400 font-medium tracking-widest uppercase">
            Git History Storyteller
          </span>
        </div>

        {/* Main heading */}
        <h1
          ref={headingRef}
          className="font-bebas text-[80px] sm:text-[96px] lg:text-[120px] leading-none text-white mb-4"
          style={{
            fontFamily: "'Bebas Neue', cursive",
            letterSpacing: "0.03em",
          }}
        >
          EVERY COMMIT
          <br />
          <span style={{ color: "var(--accent-yellow)" }}>TELLS A STORY.</span>
        </h1>

        {/* Subheading */}
        <p
          ref={subRef}
          className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto mb-12 leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Enter a public GitHub repository URL and watch its entire development
          history transform into an{" "}
          <span style={{ color: "var(--accent-cyan)" }}>
            AI&#8209;powered narrative.
          </span>
        </p>

        {/* Input + button */}
        <div className="w-full max-w-2xl mx-auto">
          <RepoInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        {error && (
          <div className="mt-4 max-w-2xl mx-auto">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* History shortcut */}
        <p
          className="mt-6 text-sm"
          style={{ color: "#444", fontFamily: "'DM Sans', sans-serif" }}
        >
          Analyzed before?{" "}
          <button
            onClick={() => navigate("/history")}
            className="transition-colors hover:opacity-80"
            style={{
              color: "#666",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            View history
          </button>
        </p>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex items-center justify-center">
          <LoadingState />
        </div>
      )}
    </main>
  );
}
