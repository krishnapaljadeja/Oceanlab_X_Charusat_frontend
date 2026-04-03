interface DataConfidenceBannerProps {
  level: "high" | "medium" | "low";
  note: string;
  isCapped: boolean;
  totalCommits: number;
  analyzedCommits: number;
}

export default function DataConfidenceBanner({
  level,
  note,
  isCapped,
  totalCommits,
  analyzedCommits,
}: DataConfidenceBannerProps) {
  if (level === "high" && !isCapped) return null;

  const config = {
    high: {
      color: "#6BCB77",
      bg: "rgba(107,203,119,0.1)",
      label: "ℹ Analysis Note",
    },
    medium: {
      color: "#FFD93D",
      bg: "rgba(255,217,61,0.1)",
      label: "ℹ Moderate Data Quality",
    },
    low: {
      color: "#FF8C42",
      bg: "rgba(255,140,66,0.1)",
      label: "⚠ Limited Data Quality",
    },
  }[level];

  return (
    <div
      className="p-4 rounded-xl text-sm"
      style={{
        background: config.bg,
        border: `2px solid ${config.color}`,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <p className="font-semibold mb-1" style={{ color: config.color }}>
        {config.label}
      </p>
      <p style={{ color: "#ccc" }}>{note}</p>
      {isCapped && (
        <p className="mt-1 text-xs" style={{ color: "#888" }}>
          This repository has {totalCommits.toLocaleString()}+ commits. Analysis
          is based on a representative sample of{" "}
          {analyzedCommits.toLocaleString()} commits.
        </p>
      )}
    </div>
  );
}
