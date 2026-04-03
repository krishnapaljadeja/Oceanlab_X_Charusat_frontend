import { useEffect, useRef, useState } from "react";
import { toParas } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import {
  RotateCcw,
  FileText,
  FileDown,
  Loader2,
  History,
  ArrowUp,
} from "lucide-react";
import { AnalysisResponse } from "@/lib/types";
import ProjectOverview from "@/components/ProjectOverview";
import NarrativeChapter from "@/components/NarrativeChapter";
import Timeline from "@/components/Timeline";
import MilestoneList from "@/components/MilestoneList";
import ContributorSection from "@/components/ContributorSection";
import DataConfidenceBanner from "@/components/DataConfidenceBanner";
import PhasesSection from "@/components/PhasesSection";
import HealthScore from "@/components/HealthScore";
import FreshnessBanner from "@/components/FreshnessBanner";
import RepoQA from "@/components/RepoQA";
import CommitHeatmap from "@/components/CommitHeatmap";
import { useAuth } from "@/context/AuthContext";
import { ContinuousPagination } from "@/components/ui/continuous-pagination";
import { ContinuousTabs } from "@/components/ui/continuous-tabs";
import { GridBackground } from "@/components/ui/grid-background";
import { refreshRepo } from "@/lib/api";

const NAV_ITEMS = [
  { id: "story", label: "STORY" },
  { id: "phases", label: "PHASES" },
  { id: "timeline", label: "TIMELINE" },
  { id: "contributors", label: "CONTRIBUTORS" },
  { id: "health", label: "HEALTH" },
];

export default function AnalyzePage() {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [activeSection, setActiveSection] = useState("story");
  const [chapterPage, setChapterPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { session, loading } = useAuth();

  useEffect(() => {
    gsap.registerPlugin(ScrollToPlugin);
  }, []);

  const handleRefresh = async () => {
    if (!result) return;

    setIsRefreshing(true);
    try {
      const repoUrl =
        result.repoMeta.htmlUrl ||
        `https://github.com/${result.repoMeta.fullName}`;
      const refreshed = await refreshRepo(repoUrl);
      if (refreshed.success) {
        sessionStorage.setItem("analysisResult", JSON.stringify(refreshed));
        setResult(refreshed);
        setChapterPage(1);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportPdf = async () => {
    if (!result || exporting) return;
    setExporting(true);
    try {
      const [{ default: PdfDocument }, { pdf }] = await Promise.all([
        import("@/components/PdfDocument"),
        import("@react-pdf/renderer"),
      ]);
      const blob = await pdf(<PdfDocument data={result} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.repoMeta.name}-git-story.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate("/login", { replace: true });
      return;
    }

    const stored = sessionStorage.getItem("analysisResult");
    if (!stored) {
      navigate("/");
      return;
    }
    try {
      setResult(JSON.parse(stored) as AnalysisResponse);
    } catch {
      navigate("/");
    }
  }, [loading, navigate, session]);

  useEffect(() => {
    setChapterPage(1);
  }, [result?.narrative.narrativeChapters.length]);

  // Track active section on scroll
  useEffect(() => {
    if (!result) return;
    const ids = NAV_ITEMS.map((n) => n.id);
    const observers = ids.map((id) => {
      const el = document.getElementById(`section-${id}`);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.3 },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, [result]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (!el) return;

    gsap.to(window, {
      duration: 0.8,
      ease: "power2.out",
      scrollTo: { y: el, offsetY: 90 },
    });
  };

  const scrollToTop = () => {
    gsap.to(window, {
      duration: 0.8,
      ease: "power2.out",
      scrollTo: { y: 0 },
    });
  };

  if (!result) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0f0f0f" }}
      >
        <div
          className="w-10 h-10 rounded-full border-4 animate-spin"
          style={{ borderColor: "#FFD93D", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const { repoMeta, summary, narrative } = result;
  const chaptersPerPage = 6;
  const totalChapters = narrative.narrativeChapters.length;
  const totalChapterPages = Math.max(
    1,
    Math.ceil(totalChapters / chaptersPerPage),
  );
  const startChapterIndex = (chapterPage - 1) * chaptersPerPage;
  const currentChapterBatch = narrative.narrativeChapters.slice(
    startChapterIndex,
    startChapterIndex + chaptersPerPage,
  );

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "#0b0b0b" }}
    >
      <GridBackground className="z-0" />

      {/* ==================== TOP NAV BAR ==================== */}
      <header
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between gap-4"
        style={{
          background: "rgba(15,15,15,0.95)",
          borderBottom: "1px solid #2a2a2a",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Left side: New Repo + View History */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
            style={{ color: "#888", fontFamily: "'DM Sans', sans-serif" }}
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">New Repo</span>
          </button>
          <span style={{ color: "#333", fontSize: "0.7rem" }}>|</span>
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
            style={{ color: "#888", fontFamily: "'DM Sans', sans-serif" }}
          >
            <History size={14} />
            <span className="hidden sm:inline">View History</span>
          </button>
          <span style={{ color: "#333", fontSize: "0.7rem" }}>|</span>
          <button
            onClick={() => navigate("/ingest")}
            className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
            style={{ color: "#4CC9F0", fontFamily: "'DM Sans', sans-serif" }}
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Ingest</span>
          </button>
        </div>

        {/* Nav tabs — ContinuousTabs component */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <ContinuousTabs
            tabs={NAV_ITEMS}
            activeId={activeSection}
            onChange={scrollToSection}
          />
        </div>

        {/* Right side: repo name + export button */}
        <div className="flex items-center gap-3">
          <span
            className="text-sm truncate max-w-[120px] hidden sm:block"
            style={{
              color: "#555",
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "0.05em",
            }}
          >
            {repoMeta.fullName}
          </span>
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              background: exporting
                ? "rgba(255,217,61,0.06)"
                : "rgba(255,217,61,0.12)",
              color: exporting ? "#888" : "#FFD93D",
              border: "1.5px solid rgba(255,217,61,0.3)",
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "0.06em",
              cursor: exporting ? "not-allowed" : "pointer",
            }}
          >
            {exporting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <FileDown size={12} />
            )}
            <span className="hidden sm:inline">
              {exporting ? "BUILDING..." : "EXPORT PDF"}
            </span>
          </button>
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <main
        ref={containerRef}
        className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-8 sm:space-y-10"
      >
        {/* Freshness banner */}
        {result.staleness && (
          <FreshnessBanner
            staleness={result.staleness}
            repoUrl={`https://github.com/${result.repoMeta.fullName}`}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        )}

        {/* Data confidence banner */}
        <DataConfidenceBanner
          level={summary.dataConfidenceLevel}
          note={narrative.dataConfidenceNote}
          isCapped={summary.isCapped}
          totalCommits={summary.totalCommitsInRepo}
          analyzedCommits={summary.analyzedCommitCount}
        />

        {/* Project Overview */}
        <ProjectOverview
          repoMeta={repoMeta}
          summary={summary}
          projectOverview={narrative.projectOverview}
        />

        {/* ===== STORY ===== */}
        <section id="section-story" className="scroll-mt-20 space-y-6">
          <div className="flex items-center gap-4">
            <h2
              className="text-4xl"
              style={{
                color: "#f0f0f0",
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "0.06em",
              }}
            >
              THE STORY
            </h2>
            <div style={{ height: 2, flex: 1, background: "#2a2a2a" }} />
          </div>

          {/* Narrative chapters */}
          <div
            className="py-4 px-2"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              overflowAnchor: "none",
            }}
          >
            {currentChapterBatch.map((chapter, localIndex) => (
              <NarrativeChapter
                key={`${chapterPage}-${localIndex}`}
                chapter={chapter}
                index={startChapterIndex + localIndex}
              />
            ))}

            {totalChapterPages > 1 && (
              <div className="pt-2">
                <ContinuousPagination
                  totalPages={totalChapterPages}
                  currentPage={chapterPage}
                  defaultPage={chapterPage}
                  maxVisiblePages={10}
                  onPageChange={setChapterPage}
                />
              </div>
            )}
          </div>

          {/* Architectural observations */}
          {narrative.architecturalObservations && (
            <div
              className="rounded-xl p-6"
              style={{
                background: "#1a1a1a",
                border: "2px solid #2a2a2a",
                borderLeft: "4px solid #c084fc",
              }}
            >
              <h3
                className="text-2xl mb-3"
                style={{
                  color: "#c084fc",
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: "0.06em",
                }}
              >
                ARCHITECTURAL OBSERVATIONS
              </h3>
              <div className="space-y-3">
                {toParas(narrative.architecturalObservations).map((para, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed"
                    style={{
                      color: i === 0 ? "#c4c4c4" : "#9a9a9a",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Current state */}
          {narrative.currentState && (
            <div
              className="rounded-xl p-6"
              style={{
                background: "#1a1a1a",
                border: "2px solid #2a2a2a",
                borderLeft: "4px solid #6BCB77",
              }}
            >
              <h3
                className="text-2xl mb-3"
                style={{
                  color: "#6BCB77",
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: "0.06em",
                }}
              >
                CURRENT STATE
              </h3>
              <div className="space-y-3">
                {toParas(narrative.currentState).map((para, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed"
                    style={{
                      color: i === 0 ? "#c4c4c4" : "#9a9a9a",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ===== PHASES ===== */}
        <section id="section-phases" className="scroll-mt-20">
          <PhasesSection phases={summary.phases} />
        </section>

        {/* ===== TIMELINE ===== */}
        <section id="section-timeline" className="scroll-mt-20 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Timeline milestones={summary.milestones} />
            <MilestoneList milestones={narrative.milestoneHighlights} />
          </div>
        </section>

        {/* ===== CONTRIBUTORS ===== */}
        <section id="section-contributors" className="scroll-mt-20">
          <ContributorSection
            contributors={summary.topContributors}
            insights={narrative.contributorInsights}
            repoUrl={`https://github.com/${repoMeta.fullName}`}
          />
        </section>

        {/* ===== COMMIT HEATMAP ===== */}
        <CommitHeatmap
          owner={result.repoMeta.fullName.split("/")[0]}
          repo={result.repoMeta.fullName.split("/")[1]}
        />

        {/* ===== HEALTH ===== */}
        <section id="section-health" className="scroll-mt-20">
          <HealthScore summary={summary} />
        </section>

        {/* Analyze another repo */}
        <div className="text-center py-10">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-black font-bold text-lg"
            style={{
              background: "#6BCB77",
              border: "2px solid #000",
              boxShadow: "5px 5px 0 #000",
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "0.08em",
              fontSize: "1.2rem",
              transition: "all 0.1s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "7px 7px 0 #000";
              e.currentTarget.style.transform = "translate(-2px,-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "5px 5px 0 #000";
              e.currentTarget.style.transform = "translate(0,0)";
            }}
          >
            <RotateCcw size={20} />
            ANALYZE ANOTHER REPO
          </button>
        </div>
      </main>

      {/* ==================== SCROLL TO TOP FAB ==================== */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:-translate-y-1"
        style={{
          background: "#1a1a1a",
          border: "2px solid #FFD93D",
          boxShadow: "3px 3px 0 rgba(255,217,61,0.3)",
          color: "#FFD93D",
        }}
        title="Scroll to top"
      >
        <ArrowUp size={18} />
      </button>

      {/* ==================== Q&A FLOATING CHAT ==================== */}
      <RepoQA
        owner={result.repoMeta.fullName.split("/")[0]}
        repo={result.repoMeta.fullName.split("/")[1]}
      />
    </div>
  );
}
