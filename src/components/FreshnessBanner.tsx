import { Loader2 } from "lucide-react";
import { StalenessInfo } from "@/lib/types";
import { timeAgo } from "@/lib/timeAgo";
import { FeedbackAction } from "@/components/ui/feedback-action";

interface FreshnessBannerProps {
  staleness: StalenessInfo;
  repoUrl: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function FreshnessBanner({
  staleness,
  onRefresh,
  isRefreshing,
}: FreshnessBannerProps) {
  const refreshControl = isRefreshing ? (
    <FeedbackAction
      loadingMessage="Syncing"
      errorMessage="Refresh Failed"
      initialStatus="loading"
      lockLoading
      hideRetryButton
    />
  ) : (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all disabled:cursor-not-allowed"
      style={{
        fontFamily: "'Bebas Neue', cursive",
        letterSpacing: "0.06em",
        background: staleness.isStale
          ? "rgba(255,217,61,0.12)"
          : "rgba(107,203,119,0.12)",
        color: staleness.isStale ? "#FFD93D" : "#6BCB77",
        border: staleness.isStale
          ? "1.5px solid rgba(255,217,61,0.3)"
          : "1.5px solid rgba(107,203,119,0.3)",
      }}
    >
      {isRefreshing && <Loader2 size={10} className="animate-spin" />}
      {staleness.isStale ? "REFRESH ANALYSIS" : "RE-ANALYZE"}
    </button>
  );

  if (!staleness.isStale) {
    return (
      <div
        className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl text-sm"
        style={{
          background: "rgba(107,203,119,0.07)",
          border: "1.5px solid rgba(107,203,119,0.2)",
          borderLeft: "4px solid #6BCB77",
        }}
      >
        <div
          className="flex items-center gap-2"
          style={{ color: "#6BCB77", fontFamily: "'DM Sans', sans-serif" }}
        >
          <span className="text-base">✓</span>
          <span className="font-medium">Up to date</span>
          <span style={{ color: "#3a5a3e" }}>·</span>
          <span style={{ color: "#4a8a54" }}>
            Analyzed {timeAgo(staleness.lastAnalyzedAt)}
          </span>
        </div>
        {refreshControl}
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl text-sm"
      style={{
        background: "rgba(255,217,61,0.06)",
        border: "1.5px solid rgba(255,217,61,0.2)",
        borderLeft: "4px solid #FFD93D",
      }}
    >
      <div
        className="flex items-center gap-2 flex-wrap"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <span style={{ color: "#FFD93D" }}>⚠</span>
        <span style={{ color: "#c4a93d", fontWeight: 500 }}>
          {staleness.newCommitsSince} new commit
          {staleness.newCommitsSince === 1 ? "" : "s"} since last analysis
        </span>
        <span style={{ color: "#444" }}>·</span>
        <span style={{ color: "#666" }}>
          Last analyzed {timeAgo(staleness.lastAnalyzedAt)}
        </span>
      </div>
      {refreshControl}
    </div>
  );
}
