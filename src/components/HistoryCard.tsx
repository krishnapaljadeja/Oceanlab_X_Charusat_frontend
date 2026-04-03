import { Loader2 } from "lucide-react";
import { HistoryItem } from "@/lib/types";
import { timeAgo } from "@/lib/timeAgo";

interface HistoryCardProps {
  item: HistoryItem;
  onView: (item: HistoryItem) => void;
  onRefresh: (item: HistoryItem) => void;
  isRefreshing: boolean;
  isViewing?: boolean;
}

export default function HistoryCard({
  item,
  onView,
  onRefresh,
  isRefreshing,
  isViewing = false,
}: HistoryCardProps) {
  const truncatedDesc =
    item.description && item.description.length > 100
      ? item.description.slice(0, 100) + "…"
      : item.description;

  const busy = isViewing || isRefreshing;

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 transition-all hover:-translate-y-0.5"
      style={{
        background: "#1a1a1a",
        border: "2px solid #2a2a2a",
        boxShadow: "0 0 0 0 transparent",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = "#3a3a3a")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = "#2a2a2a")
      }
    >
      {/* Top: title + language badge */}
      <div className="flex items-start justify-between gap-2">
        <span
          className="text-xl leading-tight"
          style={{
            color: "#f0f0f0",
            fontFamily: "'Bebas Neue', cursive",
            letterSpacing: "0.04em",
          }}
        >
          {item.fullName}
        </span>
        {item.language && (
          <span
            className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: "rgba(76,201,240,0.12)",
              border: "1px solid rgba(76,201,240,0.3)",
              color: "#4CC9F0",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {item.language}
          </span>
        )}
      </div>

      {/* Description */}
      {truncatedDesc && (
        <p
          className="text-sm leading-relaxed"
          style={{ color: "#888", fontFamily: "'DM Sans', sans-serif" }}
        >
          {truncatedDesc}
        </p>
      )}

      {/* Stats row */}
      <div
        className="flex items-center gap-4 text-sm"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <span style={{ color: "#FFD93D" }}>
          ⭐ {item.stars.toLocaleString()}
        </span>
        <span style={{ color: "#444" }}>·</span>
        <span style={{ color: "#6BCB77" }}>
          ◈ {item.commitCount.toLocaleString()} commits
        </span>
      </div>

      {/* Analyzed at */}
      <p
        className="text-xs"
        style={{ color: "#555", fontFamily: "'DM Sans', sans-serif" }}
      >
        Analyzed {timeAgo(item.analyzedAt)}
      </p>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(item)}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:cursor-not-allowed"
          style={{
            fontFamily: "'Bebas Neue', cursive",
            letterSpacing: "0.06em",
            fontSize: "0.78rem",
            background: isViewing
              ? "rgba(255,217,61,0.06)"
              : "rgba(255,217,61,0.12)",
            color: isViewing ? "#888" : "#FFD93D",
            border: "1.5px solid rgba(255,217,61,0.3)",
          }}
        >
          {isViewing && <Loader2 size={11} className="animate-spin" />}
          {isViewing ? "LOADING..." : "VIEW RESULTS"}
        </button>
        <button
          onClick={() => onRefresh(item)}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:cursor-not-allowed"
          style={{
            fontFamily: "'Bebas Neue', cursive",
            letterSpacing: "0.06em",
            fontSize: "0.78rem",
            background: isRefreshing
              ? "rgba(107,203,119,0.06)"
              : "rgba(107,203,119,0.1)",
            color: isRefreshing ? "#888" : "#6BCB77",
            border: "1.5px solid rgba(107,203,119,0.3)",
          }}
        >
          {isRefreshing && <Loader2 size={11} className="animate-spin" />}
          {isRefreshing ? "ANALYZING..." : "RE-ANALYZE"}
        </button>
      </div>
    </div>
  );
}
