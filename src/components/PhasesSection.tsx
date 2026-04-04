import { useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DevelopmentPhase } from "@/lib/types";

interface PhasesSectionProps {
  phases: DevelopmentPhase[];
}

export default function PhasesSection({ phases }: PhasesSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");

  const PHASE_COLORS = [
    "#FFD93D",
    "#4CC9F0",
    "#FF6B9D",
    "#6BCB77",
    "#FF8C42",
    "#c084fc",
    "#f97316",
  ];
  const VELOCITY_COLORS = {
    high: "#6BCB77",
    medium: "#FFD93D",
    low: "#FF8C42",
  };

  const filteredPhases = useMemo(() => {
    if (activeFilter === "all") return phases;
    return phases.filter((phase) => phase.velocity === activeFilter);
  }, [activeFilter, phases]);

  const counts = useMemo(
    () => ({
      all: phases.length,
      high: phases.filter((phase) => phase.velocity === "high").length,
      medium: phases.filter((phase) => phase.velocity === "medium").length,
      low: phases.filter((phase) => phase.velocity === "low").length,
    }),
    [phases],
  );

  const SVG_WIDTH = 600;
  const ROW_HEIGHT = 200;
  const totalHeight = (filteredPhases.length + 1) * ROW_HEIGHT;

  const buildPath = () => {
    const segments: string[] = [];
    const cols = [80, SVG_WIDTH - 80];
    filteredPhases.forEach((_, i) => {
      const y = 60 + i * ROW_HEIGHT;
      const x = cols[i % 2];
      if (i === 0) {
        segments.push(`M ${x} ${y}`);
      } else {
        const prevX = cols[(i - 1) % 2];
        const prevY = 60 + (i - 1) * ROW_HEIGHT;
        const midY = (prevY + y) / 2;
        segments.push(`C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y}`);
      }
    });
    return segments.join(" ");
  };

  const nodePositions = filteredPhases.map((_, i) => {
    const cols = [80, SVG_WIDTH - 80];
    return {
      x: cols[i % 2],
      y: 60 + i * ROW_HEIGHT,
      side: i % 2 === 0 ? "right" : "left",
    };
  });

  const pathD = buildPath();

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      if (!pathRef.current || filteredPhases.length === 0) return;

      const length = pathRef.current.getTotalLength();
      gsap.set(pathRef.current, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1,
        },
      });

      cardRefs.current = cardRefs.current.slice(0, filteredPhases.length);
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const side = nodePositions[i]?.side;
        gsap.fromTo(
          el,
          { opacity: 0, x: side === "right" ? 60 : -60, scale: 0.9 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.65,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    },
    {
      scope: containerRef,
      dependencies: [filteredPhases],
      revertOnUpdate: true,
    },
  );

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="flex items-center gap-4">
        <h2
          className="text-4xl"
          style={{
            color: "#f0f0f0",
            fontFamily: "'Bebas Neue', cursive",
            letterSpacing: "0.06em",
          }}
        >
          DEVELOPMENT PHASES
        </h2>
        <div style={{ height: 2, flex: 1, background: "#2a2a2a" }} />
        <span
          className="text-sm px-3 py-1 rounded-full"
          style={{
            background: "rgba(255,217,61,0.12)",
            color: "#FFD93D",
            border: "1.5px solid #FFD93D44",
            fontFamily: "'Bebas Neue', cursive",
            letterSpacing: "0.06em",
          }}
        >
          {filteredPhases.length} PHASES
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {(
          [
            { key: "all", label: "ALL", count: counts.all },
            { key: "high", label: "HIGH", count: counts.high },
            { key: "medium", label: "MEDIUM", count: counts.medium },
            { key: "low", label: "LOW", count: counts.low },
          ] as const
        ).map((tab) => {
          const selected = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className="px-4 py-2 rounded-md text-sm"
              style={{
                background: selected ? "#111" : "#1b1b1b",
                color: selected ? "#FFD93D" : "#aaa",
                border: selected
                  ? "1px solid rgba(255,217,61,0.5)"
                  : "1px solid #2a2a2a",
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      <div className="relative" style={{ minHeight: totalHeight }}>
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${totalHeight}`}
          className="absolute inset-0 w-full"
          style={{ height: totalHeight, pointerEvents: "none" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d={pathD}
            stroke="#2a2a2a"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          <path
            ref={pathRef}
            d={pathD}
            stroke="#FFD93D"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {nodePositions.map((pos, i) => {
            const color = PHASE_COLORS[i % PHASE_COLORS.length];
            return (
              <g key={i}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="20"
                  fill="#1a1a1a"
                  stroke={color}
                  strokeWidth="2.5"
                />
                <text
                  x={pos.x}
                  y={pos.y + 6}
                  textAnchor="middle"
                  fill={color}
                  fontSize="14"
                  fontFamily="'Bebas Neue', cursive"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {filteredPhases.map((phase, i) => {
          const pos = nodePositions[i];
          const color = PHASE_COLORS[i % PHASE_COLORS.length];
          const totalCommits =
            Object.values(phase.commitTypeBreakdown).reduce(
              (a, b) => a + b,
              0,
            ) || 1;
          const velColor = VELOCITY_COLORS[phase.velocity] || "#888";
          const isRight = pos.side === "right";

          return (
            <div
              key={i}
              ref={(el) => {
                if (el) cardRefs.current[i] = el;
              }}
              className="absolute rounded-xl p-4"
              style={{
                top: `${pos.y - 70}px`,
                left: isRight ? "calc(50% + 40px)" : undefined,
                right: !isRight ? "calc(50% + 40px)" : undefined,
                width: "calc(50% - 60px)",
                background: "#1a1a1a",
                border: `2px solid ${color}`,
                borderTop: `4px solid ${color}`,
                boxShadow: "4px 4px 0 rgba(0,0,0,0.4)",
                opacity: 0,
                zIndex: 2,
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span
                    className="text-3xl leading-none"
                    style={{ color, fontFamily: "'Bebas Neue', cursive" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="text-sm font-bold mt-0.5"
                    style={{
                      color: "#f0f0f0",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {phase.name}
                  </h3>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: `${velColor}22`,
                    color: velColor,
                    border: `1px solid ${velColor}55`,
                    fontFamily: "'Bebas Neue', cursive",
                    letterSpacing: "0.05em",
                    fontSize: "0.65rem",
                  }}
                >
                  {phase.velocity.toUpperCase()}
                </span>
              </div>

              <span
                className="inline-block text-xs px-2 py-0.5 rounded-full mb-2"
                style={{
                  background: `${color}22`,
                  color,
                  border: `1px solid ${color}44`,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.7rem",
                }}
              >
                {phase.dominantType}
              </span>

              <div className="space-y-1 mb-2">
                {Object.entries(phase.commitTypeBreakdown)
                  .filter(([type, count]) => type !== "unknown" && count > 0)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center gap-2">
                      <span
                        className="text-xs w-16 truncate flex-shrink-0"
                        style={{
                          color: "#666",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.65rem",
                        }}
                      >
                        {type}
                      </span>
                      <div
                        className="flex-1 h-1.5 rounded-full"
                        style={{ background: "#2a2a2a" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.round((count / totalCommits) * 100)}%`,
                            background: color,
                            opacity: 0.7,
                          }}
                        />
                      </div>
                      <span
                        className="text-xs"
                        style={{
                          color: "#666",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.65rem",
                        }}
                      >
                        {count}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="flex items-center justify-between">
                <span
                  style={{
                    color: "#888",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.7rem",
                  }}
                >
                  {phase.commitCount} commits
                </span>
                <div className="flex gap-1">
                  {phase.contributors.slice(0, 3).map((c) => (
                    <span
                      key={c}
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: "#2a2a2a",
                        color: "#888",
                        fontSize: "0.6rem",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      @{c.length > 8 ? c.slice(0, 8) + "…" : c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {filteredPhases.length === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: "#888", fontFamily: "'DM Sans', sans-serif" }}
          >
            No phases for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
