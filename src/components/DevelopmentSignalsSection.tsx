import { AnalysisSummary } from "@/lib/types";

interface DevelopmentSignalsSectionProps {
  summary: AnalysisSummary;
}

interface SignalCard {
  label: string;
  value: number;
  subtitle: string;
  color: string;
}

function getCount(summary: AnalysisSummary, key: string): number {
  return summary.commitTypeBreakdown[key] || 0;
}

export default function DevelopmentSignalsSection({
  summary,
}: DevelopmentSignalsSectionProps) {
  const pullRequestLikeCount = Math.round(summary.milestones.length * 1.7);

  const signals: SignalCard[] = [
    {
      label: "REFACTOR COMMITS",
      value: getCount(summary, "refactor"),
      subtitle: `${Math.round((getCount(summary, "refactor") / Math.max(1, summary.analyzedCommitCount)) * 100)}% of all commits`,
      color: "#cf4f28",
    },
    {
      label: "BUG FIXES",
      value: getCount(summary, "fix"),
      subtitle: `${Math.round((getCount(summary, "fix") / Math.max(1, summary.analyzedCommitCount)) * 100)}% of all commits`,
      color: "#FFD93D",
    },
    {
      label: "FEATURES ADDED",
      value: getCount(summary, "feat"),
      subtitle: `${Math.round((getCount(summary, "feat") / Math.max(1, summary.analyzedCommitCount)) * 100)}% of all commits`,
      color: "#2f7a58",
    },
    {
      label: "TEST COMMITS",
      value: getCount(summary, "test"),
      subtitle: `${Math.round((getCount(summary, "test") / Math.max(1, summary.analyzedCommitCount)) * 100)}% of all commits`,
      color: "#2a5fb6",
    },
    {
      label: "RELEASES",
      value: summary.tags.length,
      subtitle: `${summary.tags.length} total tags`,
      color: "#2f7a58",
    },
    {
      label: "CONTRIBUTORS",
      value: summary.topContributors.length,
      subtitle: "Active community",
      color: "#2f7a58",
    },
    {
      label: "DEV PHASES",
      value: summary.phases.length,
      subtitle: `From ${new Date(summary.dateRange.first).toLocaleDateString("en-US", { month: "short", year: "numeric" })} to ${new Date(summary.dateRange.last).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`,
      color: "#2a5fb6",
    },
    {
      label: "PULL REQUESTS",
      value: pullRequestLikeCount,
      subtitle: "Milestone-derived estimate",
      color: "#FF8C42",
    },
    {
      label: "DOC COMMITS",
      value: getCount(summary, "docs"),
      subtitle: "Documentation updates",
      color: "#4CC9F0",
    },
    {
      label: "DEP UPGRADES",
      value: getCount(summary, "deps"),
      subtitle: "Dependency changes",
      color: "#2f7a58",
    },
  ];

  return (
    <section className="space-y-5">
      <div style={{ height: 2, background: "#2f2f2f" }} />
      <p
        className="text-xs tracking-[0.42em]"
        style={{ color: "#8f8b80", fontFamily: "'Bebas Neue', cursive" }}
      >
        DETECTED DEVELOPMENT SIGNALS
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {signals.map((signal) => (
          <article
            key={signal.label}
            className="rounded-md p-5"
            style={{
              background: "#141414",
              border: "1px solid #2c2c2c",
            }}
          >
            <p
              className="text-6xl leading-none"
              style={{
                color: signal.color,
                fontFamily: "'Bebas Neue', cursive",
                fontWeight: 700,
              }}
            >
              {signal.value}
            </p>
            <p
              className="text-xs tracking-[0.3em] mt-4"
              style={{ color: "#8b8b8b", fontFamily: "'DM Sans', sans-serif" }}
            >
              {signal.label}
            </p>
            <p
              className="text-sm mt-2"
              style={{ color: "#a1a1a1", fontFamily: "'DM Sans', sans-serif" }}
            >
              {signal.subtitle}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
