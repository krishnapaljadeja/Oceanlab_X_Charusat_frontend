import { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { analyzeRepo } from "@/lib/api";
import LoadingState from "@/components/LoadingState";
import ErrorBanner from "@/components/ErrorBanner";
import RepoInput from "@/components/RepoInput";
import AppNavbar from "@/components/AppNavbar";
import { useAuth } from "@/context/AuthContext";
import { AnalysisFilters } from "@/lib/types";
import AuroraBackground from "@/components/ui/aurora-background";
import { SparklesText } from "@/components/ui/sparkles-text";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();

  const heroRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (!headingRef.current || !subRef.current || !badgeRef.current) return;

      const tl = gsap.timeline();

      const lineOneLetters =
        headingRef.current.querySelectorAll<HTMLSpanElement>(
          ".line-one .letter",
        );
      const lineTwoLetters =
        headingRef.current.querySelectorAll<HTMLSpanElement>(
          ".line-two .letter",
        );

      if (lineOneLetters.length > 0) {
        tl.from(lineOneLetters, {
          yPercent: 120,
          opacity: 0,
          rotateX: -90,
          duration: 0.95,
          stagger: 0.035,
          ease: "power4.out",
        });
      }

      if (lineTwoLetters.length > 0) {
        tl.from(
          lineTwoLetters,
          {
            yPercent: 120,
            opacity: 0,
            rotateX: -90,
            duration: 0.95,
            stagger: 0.035,
            ease: "power4.out",
          },
          "-=0.5",
        );
      }

      tl.from(
        badgeRef.current,
        {
          y: 24,
          opacity: 0,
          scale: 0.92,
          duration: 0.65,
          ease: "back.out(1.7)",
        },
        "-=0.45",
      );

      tl.from(
        subRef.current,
        {
          y: 36,
          opacity: 0,
          duration: 0.75,
          ease: "power3.out",
        },
        "-=0.3",
      );

      tl.add(() => {
        if (!headingRef.current) return;
        gsap.to(headingRef.current, {
          y: -6,
          duration: 4.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    },
    { scope: heroRef },
  );

  const handleAnalyze = async (url: string, filters?: AnalysisFilters) => {
    if (!session) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setError(null);
    const result = await analyzeRepo(url, filters);
    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    sessionStorage.setItem("analysisResult", JSON.stringify(result));
    if (filters) {
      sessionStorage.setItem("analysisFilters", JSON.stringify(filters));
    } else {
      sessionStorage.removeItem("analysisFilters");
    }
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    navigate(`/analyze?owner=${parts[0]}&repo=${parts[1]}`);
  };

  const handleForceRefresh = async (url: string, filters?: AnalysisFilters) => {
    if (!session) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setError(null);
    const { refreshRepo } = await import("@/lib/api");
    const result = await refreshRepo(url, filters);
    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    sessionStorage.setItem("analysisResult", JSON.stringify(result));
    if (filters) {
      sessionStorage.setItem("analysisFilters", JSON.stringify(filters));
    } else {
      sessionStorage.removeItem("analysisFilters");
    }
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
    <AuroraBackground
      className="w-full min-h-screen h-auto px-4 pt-24 pb-8"
      starCount={80}
      gradientColors={[
        "var(--aurora-color1, rgba(99,102,241,0.2))",
        "var(--aurora-color2, rgba(139,92,246,0.2))",
      ]}
      pulseDuration={8}
      ariaLabel="Landing page aurora background"
    >
      <main
        ref={heroRef}
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      >
        <AppNavbar />

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
          <div
            ref={headingRef}
            className="relative mb-8 sm:mb-10 leading-[0.92] text-[64px] sm:text-[84px] lg:text-[112px] font-bebas"
            style={{ letterSpacing: "0.03em" }}
          >
            <div className="line-one overflow-hidden text-white">
              {"EVERY COMMIT".split("").map((letter, idx) => (
                <span key={`line1-${idx}`} className="letter inline-block">
                  {letter === " " ? "\u00A0" : letter}
                </span>
              ))}
            </div>
            <div className="line-two relative" style={{ color: "#FFD93D" }}>
              <div className="overflow-hidden">
                {"TELLS A STORY.".split("").map((letter, idx) => (
                  <span key={`line2-${idx}`} className="letter inline-block">
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                ))}
              </div>

              <div className="absolute -inset-x-2 -inset-y-2 pointer-events-none">
                <SparklesText
                  text="TELLS A STORY."
                  sparklesCount={4}
                  colors={{ first: "#FFD93D", second: "#FE8BBB" }}
                  className="font-bebas text-[64px] sm:text-[84px] lg:text-[112px] text-transparent select-none"
                />
              </div>
            </div>
          </div>

          {/* <div
            ref={badgeRef}
            className="inline-block mb-8 sm:mb-10 border-2 border-[#2a2a2a] rounded-xl px-5 py-2"
            style={{ background: "rgba(26,26,26,0.85)" }}
          >
            <p className="font-mono text-[0.7rem] sm:text-xs uppercase tracking-[0.2em] text-[#9aa3b2]">
              THINKING BEYOND BORDERS
            </p>
          </div> */}

          {/* Subheading */}
          <p
            ref={subRef}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Enter a public GitHub repository URL and watch its entire
            development history transform into an{" "}
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
            className="mt-6 text-sm flex gap-3 justify-center items-center"
            style={{ color: "#f9e6e6", fontFamily: "'DM Sans', sans-serif" }}
          >
            <span>Analyzed before?</span>
            <button
              onClick={() => navigate("/history")}
              className="transition-colors hover:opacity-80"
              style={{
                color: "#FFD93D",
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
    </AuroraBackground>
  );
}
