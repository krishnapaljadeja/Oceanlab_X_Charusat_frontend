import { useEffect, useMemo, useState } from "react";
import { HeatmapData } from "@/lib/types";
import { fetchHeatmap } from "@/lib/api";

interface CommitHeatmapProps {
  owner: string;
  repo: string;
}

const RHYTHM_COLORS = {
  none: "#2a2a2a",
  low: "#2f5742",
  medium: "#5cc889",
  high: "#2f7a58",
  burst: "#f0652f",
};

function bucketCount(
  count: number,
): "none" | "low" | "medium" | "high" | "burst" {
  if (count > 20) return "burst";
  if (count > 8) return "high";
  if (count > 3) return "medium";
  if (count > 0) return "low";
  return "none";
}

export default function CommitHeatmap({ owner, repo }: CommitHeatmapProps) {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const points = useMemo(() => {
    if (!data) {
      return {
        coords: [] as Array<{
          date: string;
          count: number;
          x: number;
          y: number;
        }>,
        path: "",
        maxY: 1,
        width: 780,
        height: 220,
        firstDate: "",
        lastDate: "",
      };
    }

    const days = data.weeks
      .flatMap((week) => week.days)
      .sort((a, b) => a.date.localeCompare(b.date));
    const maxY = Math.max(1, ...days.map((d) => d.count));
    const width = 780;
    const height = 220;
    const xStep = days.length > 1 ? width / (days.length - 1) : width;

    const coords = days.map((d, i) => {
      const x = i * xStep;
      const y = height - (d.count / maxY) * height;
      return { ...d, x, y };
    });

    const path = coords
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`,
      )
      .join(" ");

    return {
      coords,
      path,
      maxY,
      width,
      height,
      firstDate: days[0]?.date ?? "",
      lastDate: days[days.length - 1]?.date ?? "",
    };
  }, [data]);

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
        <div className="w-52 h-4 rounded mb-4 animate-pulse bg-[#2a2a2a]" />
        <div className="w-full h-64 rounded-xl animate-pulse bg-[#232323]" />
      </div>
    );
  }

  if (!data) return null;

  const weeks = data.weeks;
  const yTicks = [0, Math.round(points.maxY / 2), points.maxY];

  return (
    <section
      className="space-y-8 rounded-xl p-6"
      style={{ background: "#1a1a1a", border: "2px solid #2a2a2a" }}
    >
      <div className="space-y-4">
        <div style={{ height: 2, background: "#2f2f2f" }} />
        <p
          className="text-xs tracking-[0.42em]"
          style={{ color: "#8f8b80", fontFamily: "'Bebas Neue', cursive" }}
        >
          COMMIT VELOCITY
        </p>

        <div
          className="rounded-md p-4 md:p-6"
          style={{ background: "#141414", border: "1px solid #2c2c2c" }}
        >
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${points.width + 70} ${points.height + 32}`}
              className="w-full min-w-[740px]"
              role="img"
              aria-label="Commit velocity line chart"
            >
              <g transform="translate(48,8)">
                {yTicks.map((tick) => {
                  const y =
                    points.height - (tick / points.maxY) * points.height;
                  return (
                    <g key={tick}>
                      <line
                        x1={0}
                        y1={y}
                        x2={points.width}
                        y2={y}
                        stroke="#2f2f2f"
                        strokeDasharray="5 6"
                      />
                      <text
                        x={-10}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="11"
                        fill="#888"
                        fontFamily="DM Sans"
                      >
                        {tick}
                      </text>
                    </g>
                  );
                })}

                <path
                  d={points.path}
                  fill="none"
                  stroke="#2f7a58"
                  strokeWidth={2.3}
                />

                {points.coords
                  .filter((point) => point.count > 0)
                  .map((point) => (
                    <circle
                      key={point.date}
                      cx={point.x}
                      cy={point.y}
                      r={point.count > 20 ? 3.2 : 2.2}
                      fill={point.count > 20 ? "#f0652f" : "#2f7a58"}
                    />
                  ))}

                <text
                  x={0}
                  y={points.height + 24}
                  fontSize="12"
                  fill="#888"
                  fontFamily="DM Sans"
                >
                  {new Date(points.firstDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </text>
                <text
                  x={points.width}
                  y={points.height + 24}
                  textAnchor="end"
                  fontSize="12"
                  fill="#888"
                  fontFamily="DM Sans"
                >
                  {new Date(points.lastDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div style={{ height: 2, background: "#2f2f2f" }} />
        <p
          className="text-xs tracking-[0.42em]"
          style={{ color: "#8f8b80", fontFamily: "'Bebas Neue', cursive" }}
        >
          ACTIVITY RHYTHM
        </p>
        <h3
          className="text-3xl leading-tight"
          style={{
            color: "#f0f0f0",
            fontFamily: "'Bebas Neue', cursive",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          Bursts, Sprints and Quiet Periods
        </h3>

        <div className="overflow-x-auto">
          <div className="inline-flex gap-1.5 p-2 rounded-md bg-[#141414] border border-[#2c2c2c]">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-rows-7 gap-1">
                {week.days.map((day) => {
                  const bucket = bucketCount(day.count);
                  const isBurst = bucket === "burst";
                  return (
                    <div
                      key={day.date}
                      title={`${day.count} commits on ${day.date}`}
                      className="w-4 h-4 rounded-[3px]"
                      style={{
                        background: RHYTHM_COLORS[bucket],
                        border: isBurst
                          ? "2px solid #f28a63"
                          : "1px solid #2c2c2c",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex flex-wrap gap-4 text-sm"
          style={{ color: "#8b8b8b" }}
        >
          <span>{data.stats.totalCommits.toLocaleString()} total commits</span>
          <span>{data.stats.activeDays} active days</span>
          <span>{data.stats.longestStreak} day longest streak</span>
          <span>
            {data.stats.averageCommitsPerActiveDay} avg commits per active day
          </span>
        </div>

        <div
          className="flex items-center gap-4 flex-wrap text-sm"
          style={{ color: "#8b8b8b" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-[3px] border border-[#d0c9b7]"
              style={{ background: RHYTHM_COLORS.none }}
            />
            <span>None</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-[3px]"
              style={{ background: RHYTHM_COLORS.low }}
            />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-[3px]"
              style={{ background: RHYTHM_COLORS.medium }}
            />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-[3px]"
              style={{ background: RHYTHM_COLORS.high }}
            />
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-[3px]"
              style={{
                background: RHYTHM_COLORS.burst,
                border: "2px solid #f4b49a",
              }}
            />
            <span>Burst ({">"}20)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
