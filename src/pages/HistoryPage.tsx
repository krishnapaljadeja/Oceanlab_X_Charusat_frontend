import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHistory, analyzeRepo } from "@/lib/api";
import { HistoryItem } from "@/lib/types";
import HistoryCard from "@/components/HistoryCard";
import { GridBackground } from "@/components/ui/grid-background";
import { useAuth } from "@/context/AuthContext";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingRepo, setViewingRepo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate("/login", { replace: true });
      return;
    }

    setIsLoading(true);
    fetchHistory().then((result) => {
      setHistory(result);
      setIsLoading(false);
    });
  }, [loading, navigate, session]);

  const onView = async (item: HistoryItem) => {
    const key = `${item.owner}/${item.repo}`;
    setViewingRepo(key);
    const url = `https://github.com/${item.fullName}`;
    const result = await analyzeRepo(url);
    if (result.success) {
      sessionStorage.setItem("analysisResult", JSON.stringify(result));
      navigate("/analyze");
    } else {
      setError(result.error);
      setViewingRepo(null);
    }
  };

  const onRefresh = (item: HistoryItem) => {
    navigate(`/?repo=${item.owner}/${item.repo}&force=true`);
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "#0b0b0b" }}
    >
      <GridBackground className="z-0" />

      {/* ==================== NAVBAR ==================== */}
      <header
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between gap-4"
        style={{
          background: "rgba(15,15,15,0.95)",
          borderBottom: "1px solid #2a2a2a",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Left: back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
          style={{ color: "#888", fontFamily: "'DM Sans', sans-serif" }}
        >
          <span style={{ fontSize: "0.75rem" }}>←</span>
          <span className="hidden sm:inline">New Repo</span>
        </button>

        {/* Center: page title */}
        <span
          className="absolute left-1/2 -translate-x-1/2 text-sm tracking-widest"
          style={{
            color: "#555",
            fontFamily: "'Bebas Neue', cursive",
            letterSpacing: "0.12em",
          }}
        >
          ANALYSIS HISTORY
        </span>

        {/* Right: count badge */}
        <div className="flex items-center gap-3">
          {!isLoading && history.length > 0 && (
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(255,217,61,0.1)",
                border: "1px solid rgba(255,217,61,0.25)",
                color: "#FFD93D",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {history.length} repo{history.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </header>

      {/* ==================== MAIN ==================== */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* Page heading */}
        <div className="mb-8">
          <h1
            className="text-6xl sm:text-7xl leading-none mb-2"
            style={{
              color: "#f0f0f0",
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "0.04em",
            }}
          >
            YOUR REPOS
          </h1>
          <p
            className="text-sm"
            style={{ color: "#555", fontFamily: "'DM Sans', sans-serif" }}
          >
            Every repository you've turned into a story
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="flex items-center justify-between gap-4 mb-6 px-4 py-3 rounded-xl text-sm"
            style={{
              background: "rgba(255,75,75,0.08)",
              border: "1.5px solid rgba(255,75,75,0.3)",
              borderLeft: "4px solid #FF4B4B",
              color: "#ff9a9a",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="hover:opacity-70 transition-opacity font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <div
              className="w-10 h-10 rounded-full border-4 animate-spin"
              style={{ borderColor: "#FFD93D", borderTopColor: "transparent" }}
            />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && history.length === 0 && (
          <div className="text-center py-32">
            <p
              className="text-6xl mb-4"
              style={{
                fontFamily: "'Bebas Neue', cursive",
                color: "#2a2a2a",
                letterSpacing: "0.06em",
              }}
            >
              NO STORIES YET
            </p>
            <p
              className="text-sm mb-8"
              style={{ color: "#555", fontFamily: "'DM Sans', sans-serif" }}
            >
              Analyze a repository to see it here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-xl text-black font-bold"
              style={{
                background: "#FFD93D",
                border: "2px solid #000",
                boxShadow: "4px 4px 0 #000",
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "0.08em",
                fontSize: "1rem",
              }}
            >
              ANALYZE FIRST REPO →
            </button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => (
              <HistoryCard
                key={`${item.owner}/${item.repo}`}
                item={item}
                onView={onView}
                onRefresh={onRefresh}
                isRefreshing={false}
                isViewing={viewingRepo === `${item.owner}/${item.repo}`}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
