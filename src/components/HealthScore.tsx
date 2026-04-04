import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnalysisSummary } from "@/lib/types";

interface HealthScoreProps {
  summary: AnalysisSummary;
}

const GRADE_THRESHOLDS = [
  { min: 90, grade: "A+", color: "#6BCB77" },
  { min: 80, grade: "A", color: "#6BCB77" },
  { min: 70, grade: "B", color: "#FFD93D" },
  { min: 60, grade: "C", color: "#FF8C42" },
  { min: 0, grade: "D", color: "#FF6B9D" },
];

function getGrade(score: number) {
  return GRADE_THRESHOLDS.find((t) => score >= t.min) ?? GRADE_THRESHOLDS[4];
}

interface BreakdownItem {
  label: string;
  value: number;
  color: string;
  sublabel: string;
}

function computeBreakdown(summary: AnalysisSummary): BreakdownItem[] {
  const total = summary.analyzedCommitCount || 1;
  const types = summary.commitTypeBreakdown;
  const feat = ((types["feat"] || 0) / total) * 100;
  const fix = ((types["fix"] || 0) / total) * 100;
  const test = ((types["test"] || 0) / total) * 100;
  const docs = ((types["docs"] || 0) / total) * 100;
  const contributors = summary.topContributors.length;

  return [
    {
      label: "Features",
      value: Math.min(feat * 1.5, 100),
      color: "#4CC9F0",
      sublabel: `${Math.round(feat)}% of commits`,
    },
    {
      label: "Bug Fixes",
      value: Math.min(fix * 2, 100),
      color: "#FF6B9D",
      sublabel: `${Math.round(fix)}% of commits`,
    },
    {
      label: "Tests",
      value: Math.min(test * 3, 100),
      color: "#6BCB77",
      sublabel: `${Math.round(test)}% of commits`,
    },
    {
      label: "Docs",
      value: Math.min(docs * 3, 100),
      color: "#FFD93D",
      sublabel: `${Math.round(docs)}% of commits`,
    },
    {
      label: "Team Size",
      value: Math.min(contributors * 10, 100),
      color: "#FF8C42",
      sublabel: `${contributors} contributors`,
    },
  ];
}

function deriveFallbackHealthScore(summary: AnalysisSummary): number {
  const total = Math.max(1, summary.analyzedCommitCount || 0);
  const types = summary.commitTypeBreakdown;

  const feat = ((types["feat"] || 0) / total) * 100;
  const fix = ((types["fix"] || 0) / total) * 100;
  const test = ((types["test"] || 0) / total) * 100;
  const docs = ((types["docs"] || 0) / total) * 100;

  const contributorScore = Math.min(summary.topContributors.length * 8, 24);
  const testingScore = Math.min(test * 1.2, 18);
  const docsScore = Math.min(docs * 0.9, 12);
  const maintenanceScore = Math.min((fix + feat) * 0.5, 26);
  const releaseScore = Math.min(summary.tags.length * 0.8, 10);

  const derived =
    20 +
    contributorScore +
    testingScore +
    docsScore +
    maintenanceScore +
    releaseScore;

  return Math.max(0, Math.min(100, Math.round(derived)));
}

export default function HealthScore({ summary }: HealthScoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const scoreRef = useRef<{ val: number }>({ val: 0 });
  const scoreDisplayRef = useRef<HTMLSpanElement>(null);
  const barRefs = useRef<HTMLDivElement[]>([]);

  const rawScore = Number(summary.commitQualityScore);
  const score =
    Number.isFinite(rawScore) && rawScore > 0
      ? Math.max(0, Math.min(100, Math.round(rawScore)))
      : deriveFallbackHealthScore(summary);
  const { grade, color: gradeColor } = getGrade(score);
  const breakdown = computeBreakdown(summary);

  // SVG circle params
  const R = 80;
  const CIRCUM = 2 * Math.PI * R;
  const busFactor = summary.topContributors.length === 1;

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      if (!circleRef.current || !scoreDisplayRef.current) return;

      const ctx = gsap.context(() => {}, containerRef);
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 75%",
        onEnter: () => {
          // Score circle
          gsap.fromTo(
            circleRef.current!,
            { strokeDashoffset: CIRCUM },
            {
              strokeDashoffset: CIRCUM - (score / 100) * CIRCUM,
              duration: 2,
              ease: "power3.out",
            },
          );
          // Count-up number
          gsap.to(scoreRef.current, {
            val: score,
            duration: 2,
            ease: "power3.out",
            onUpdate: () => {
              if (scoreDisplayRef.current) {
                scoreDisplayRef.current.textContent = Math.round(
                  scoreRef.current.val,
                ).toString();
              }
            },
          });

          // Bar animations
          barRefs.current.forEach((el, i) => {
            if (!el) return;
            const targetW = breakdown[i].value;
            gsap.fromTo(
              el,
              { width: "0%" },
              {
                width: `${targetW}%`,
                duration: 1.2,
                delay: i * 0.1,
                ease: "power3.out",
              },
            );
          });
        },
      });

      return () => ctx.revert();
    },
    { scope: containerRef },
  );

  const gradeMap: Record<string, string> = {
    "A+": "EXCELLENT",
    A: "GREAT",
    B: "GOOD",
    C: "FAIR",
    D: "NEEDS WORK",
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <h2
          className="text-4xl"
          style={{
            color: "#f0f0f0",
            fontFamily: "'Bebas Neue', cursive",
            letterSpacing: "0.06em",
          }}
        >
          REPO HEALTH
        </h2>
        <div style={{ height: 2, flex: 1, background: "#2a2a2a" }} />
      </div>

      {/* Bus factor warning */}
      {busFactor && (
        <div
          className="p-4 rounded-xl flex items-center gap-3"
          style={{
            border: "3px solid #FFD93D",
            background: "rgba(255,217,61,0.08)",
          }}
        >
          <div
            className="warning-stripes rounded-lg flex-shrink-0"
            style={{ width: 40, height: 40, borderRadius: 8 }}
          />
          <div>
            <p
              className="font-bold text-sm"
              style={{
                color: "#FFD93D",
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "0.06em",
                fontSize: "1rem",
              }}
            >
              ⚠ BUS FACTOR WARNING
            </p>
            <p
              className="text-xs"
              style={{ color: "#999", fontFamily: "'DM Sans', sans-serif" }}
            >
              This repository has only 1 main contributor. High knowledge
              concentration risk.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score circle — report card style */}
        <div
          className="rounded-xl p-6 flex flex-col items-center gap-4"
          style={{ background: "#1a1a1a", border: "2px solid #2a2a2a" }}
        >
          <p
            className="text-sm uppercase tracking-widest"
            style={{
              color: "#666",
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "0.1em",
            }}
          >
            Commit Quality Score
          </p>

          {/* Animated SVG circle */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: 200, height: 200 }}
          >
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke="#2a2a2a"
                strokeWidth="12"
              />
              <circle
                ref={circleRef}
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke={gradeColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={CIRCUM}
                strokeDashoffset={CIRCUM}
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                  filter: `drop-shadow(0 0 8px ${gradeColor}88)`,
                }}
              />
            </svg>
            {/* Score in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                ref={scoreDisplayRef}
                className="text-5xl font-bold"
                style={{
                  color: "#f0f0f0",
                  fontFamily: "'Bebas Neue', cursive",
                }}
              >
                0
              </span>
              <span
                className="text-xs"
                style={{ color: "#666", fontFamily: "'DM Sans', sans-serif" }}
              >
                / 100
              </span>
            </div>
          </div>

          {/* Grade letter */}
          <div className="text-center">
            <div
              className="text-8xl leading-none"
              style={{
                color: gradeColor,
                fontFamily: "'Bebas Neue', cursive",
                filter: `drop-shadow(0 0 20px ${gradeColor}55)`,
              }}
            >
              {grade}
            </div>
            <p
              className="text-sm mt-1"
              style={{
                color: "#666",
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "0.08em",
              }}
            >
              {gradeMap[grade] || "FAIR"}
            </p>
          </div>
        </div>

        {/* Report card breakdown */}
        <div
          className="rounded-xl p-6"
          style={{
            background: "#1a1a1a",
            border: "2px solid #2a2a2a",
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 31px, #2a2a2a 31px, #2a2a2a 32px)",
          }}
        >
          <p
            className="text-sm uppercase tracking-widest mb-4"
            style={{
              color: "#666",
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "0.1em",
            }}
          >
            📋 Report Card
          </p>
          <div className="space-y-4">
            {breakdown.map((item, i) => {
              const letterGrade = getGrade(item.value);
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span
                    className="w-20 text-xs flex-shrink-0"
                    style={{
                      color: "#888",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {item.label}
                  </span>
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: "#2a2a2a" }}
                  >
                    <div
                      ref={(el) => {
                        if (el) barRefs.current[i] = el;
                      }}
                      className="h-full rounded-full"
                      style={{ width: "0%", background: item.color }}
                    />
                  </div>
                  <span
                    className="w-6 text-center text-sm font-bold flex-shrink-0"
                    style={{
                      color: letterGrade.color,
                      fontFamily: "'Bebas Neue', cursive",
                    }}
                  >
                    {letterGrade.grade}
                  </span>
                  <span
                    className="text-xs w-24 text-right flex-shrink-0"
                    style={{
                      color: "#555",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.65rem",
                    }}
                  >
                    {item.sublabel}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Commit type breakdown */}
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid #2a2a2a" }}>
            <p
              className="text-xs uppercase tracking-widest mb-3"
              style={{
                color: "#555",
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "0.1em",
              }}
            >
              Commit Type Mix
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.commitTypeBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([type, count], i) => {
                  const colors = [
                    "#FFD93D",
                    "#4CC9F0",
                    "#FF6B9D",
                    "#6BCB77",
                    "#FF8C42",
                    "#c084fc",
                    "#f97316",
                    "#60a5fa",
                  ];
                  return (
                    <span
                      key={type}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${colors[i % colors.length]}18`,
                        color: colors[i % colors.length],
                        border: `1px solid ${colors[i % colors.length]}44`,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.65rem",
                      }}
                    >
                      {type}: {count}
                    </span>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
