import { useEffect, useState } from "react";
import { HeatmapData, HeatmapDay } from "@/lib/types";
import { fetchHeatmap } from "@/lib/api";

interface CommitHeatmapProps {
  owner: string;
  repo: string;
}

const COLOR_MAP: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-[#1e1e1e] border border-[#2a2a2a]",
  1: "bg-[#0e4429]",
  2: "bg-[#006d32]",
  3: "bg-[#26a641]",
  4: "bg-[#39d353]",
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DAY_LABELS: Record<number, string> = {
  1: "Mon",
  3: "Wed",
  5: "Fri",
};

function formatDate(dateString: string): string {
  return new Date(dateString + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CommitHeatmap({ owner, repo }: CommitHeatmapProps) {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoading(true);
    setData(null);
    fetchHeatmap(owner, repo).then((result) => {
      setData(result);
      setIsLoading(false);
    });
  }, [owner, repo]);

  if (isLoading) {
    return (
      <div
        className="rounded-xl p-6"
        style={{ background: "#1a1a1a", border: "2px solid #2a2a2a" }}
      >
        <div
          className="w-48 h-4 rounded mb-4 animate-pulse"
          style={{ background: "#2a2a2a" }}
        />
        <div
          className="w-full h-28 rounded-xl animate-pulse"
          style={{ background: "#242424" }}
        />
      </div>
    );
  }

  if (!data) return null;

  // Build month label positions: find first week index where a month's 1st appears
  const monthPositions: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  data.weeks.forEach((week, wi) => {
    for (const day of week.days) {
      const d = new Date(day.date + "T12:00:00");
      const month = d.getMonth();
      if (month !== lastMonth) {
        // Only label if it's within the target year
        if (d.getFullYear() === data.year) {
          monthPositions.push({ label: MONTH_NAMES[month], weekIndex: wi });
        }
        lastMonth = month;
      }
    }
  });

  const totalCommits = data.stats.totalCommits;

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: "#1a1a1a", border: "2px solid #2a2a2a" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-2xl"
          style={{
            color: "#f0f0f0",
            fontFamily: "'Bebas Neue', cursive",
            letterSpacing: "0.06em",
          }}
        >
          COMMIT ACTIVITY
        </h2>
        <span
          className="text-sm px-3 py-1 rounded-full"
          style={{
            color: "#888",
            background: "#222",
            border: "1px solid #2a2a2a",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {data.year}
        </span>
      </div>

      {/* Month labels + grid */}
      <div className="overflow-x-auto">
        {/* Month labels row */}
        <div
          className="flex mb-2"
          style={{ minWidth: "max-content", height: "16px" }}
        >
          {/* Spacer for day-label column */}
          <div style={{ width: "28px", flexShrink: 0 }} />
          {/* Render labels inline-positioned over week columns */}
          <div className="relative flex" style={{ gap: "3px" }}>
            {data.weeks.map((_, wi) => {
              const monthEntry = monthPositions.find((m) => m.weekIndex === wi);
              return (
                <div
                  key={wi}
                  style={{
                    width: "12px",
                    flexShrink: 0,
                    position: "relative",
                    height: "16px",
                  }}
                >
                  {monthEntry && (
                    <span
                      className="absolute text-xs"
                      style={{
                        left: 0,
                        top: 0,
                        color: "#666",
                        fontFamily: "'DM Sans', sans-serif",
                        whiteSpace: "nowrap",
                        fontSize: "0.65rem",
                        lineHeight: "16px",
                      }}
                    >
                      {monthEntry.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main grid */}
        <div className="flex" style={{ gap: "3px", minWidth: "max-content" }}>
          {/* Day labels column */}
          <div
            className="flex flex-col"
            style={{ gap: "3px", width: "28px", flexShrink: 0 }}
          >
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                style={{
                  height: "12px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {DAY_LABELS[i] && (
                  <span
                    className="text-xs"
                    style={{
                      color: "#555",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.6rem",
                      lineHeight: 1,
                    }}
                  >
                    {DAY_LABELS[i]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {data.weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="flex flex-col"
              style={{ gap: "3px" }}
            >
              {week.days.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`rounded-sm cursor-pointer transition-opacity hover:opacity-75 ${COLOR_MAP[day.level]}`}
                  style={{ width: "12px", height: "12px", flexShrink: 0 }}
                  onMouseEnter={(e) => {
                    setHoveredDay(day);
                    setTooltipPosition({
                      x: e.clientX + 10,
                      y: e.clientY - 40,
                    });
                  }}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div
        className="flex flex-wrap gap-x-4 gap-y-1 mt-5 text-sm"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <span style={{ color: "#666" }}>
          <span style={{ color: "#c4c4c4", fontWeight: 600 }}>
            {totalCommits.toLocaleString()}
          </span>{" "}
          total commits
        </span>
        <span style={{ color: "#444" }}>·</span>
        <span style={{ color: "#666" }}>
          <span style={{ color: "#c4c4c4", fontWeight: 600 }}>
            {data.stats.activeDays}
          </span>{" "}
          active days
        </span>
        <span style={{ color: "#444" }}>·</span>
        <span style={{ color: "#666" }}>
          <span style={{ color: "#c4c4c4", fontWeight: 600 }}>
            {data.stats.longestStreak}
          </span>{" "}
          day longest streak
        </span>
        <span style={{ color: "#444" }}>·</span>
        <span style={{ color: "#666" }}>
          <span style={{ color: "#c4c4c4", fontWeight: 600 }}>
            {data.stats.currentStreak}
          </span>{" "}
          day current streak
        </span>
        <span style={{ color: "#444" }}>·</span>
        <span style={{ color: "#666" }}>
          Most active:{" "}
          <span style={{ color: "#c4c4c4", fontWeight: 600 }}>
            {data.stats.mostActiveDayOfWeek}s
          </span>
        </span>
        <span style={{ color: "#444" }}>·</span>
        <span style={{ color: "#666" }}>
          Avg{" "}
          <span style={{ color: "#c4c4c4", fontWeight: 600 }}>
            {data.stats.averageCommitsPerActiveDay}
          </span>{" "}
          commits/active day
        </span>
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-1.5 mt-3"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <span className="text-xs" style={{ color: "#555" }}>
          Less
        </span>
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <div
            key={level}
            className={`rounded-sm ${COLOR_MAP[level]}`}
            style={{ width: "12px", height: "12px", flexShrink: 0 }}
          />
        ))}
        <span className="text-xs" style={{ color: "#555" }}>
          More
        </span>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          style={{
            position: "fixed",
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            pointerEvents: "none",
            zIndex: 50,
            background: "#111",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "6px 10px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
          }}
        >
          <p
            className="text-xs"
            style={{ color: "#e0e0e0", fontFamily: "'DM Sans', sans-serif" }}
          >
            {hoveredDay.count === 0
              ? `No commits on ${formatDate(hoveredDay.date)}`
              : `${hoveredDay.count} commit${hoveredDay.count === 1 ? "" : "s"} on ${formatDate(hoveredDay.date)}`}
          </p>
        </div>
      )}
    </div>
  );
}
