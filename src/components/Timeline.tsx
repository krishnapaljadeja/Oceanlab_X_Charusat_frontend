import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Milestone } from "@/lib/types";

interface TimelineProps {
  milestones: Milestone[];
}

const MILESTONE_ICONS: Record<string, string> = {
  initial_commit: "🚀",
  version_release: "🏷️",
  test_introduction: "🧪",
  ci_introduction: "⚙️",
  large_refactor: "🔨",
  contributor_spike: "👥",
  new_module: "📦",
  commit_count_threshold: "📊",
};

const ACCENT_COLORS = ["#FFD93D", "#4CC9F0", "#FF6B9D", "#6BCB77", "#FF8C42"];

export default function Timeline({ milestones }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLDivElement[]>([]);
  const isScrollable = milestones.length > 6;

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        if (isScrollable) {
          gsap.set(el, { opacity: 1, x: 0, y: 0 });
          return;
        }
        const fromLeft = i % 2 === 0;
        gsap.fromTo(
          el,
          { opacity: 0, x: fromLeft ? -50 : 50, y: 10 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="rounded-xl p-6"
      style={{
        background: "#1a1a1a",
        border: "2px solid #2a2a2a",
        transform: "rotate(0.5deg)",
      }}
    >
      <h2
        className="text-2xl mb-6"
        style={{
          color: "#f0f0f0",
          fontFamily: "'Bebas Neue', cursive",
          letterSpacing: "0.06em",
        }}
      >
        DEVELOPMENT TIMELINE
      </h2>

      <div
        className={isScrollable ? "relative pr-2 overflow-y-auto" : "relative"}
        style={isScrollable ? { maxHeight: 640 } : undefined}
      >
        {/* Dashed center line */}
        <div
          className="absolute left-5 top-0 bottom-0"
          style={{ width: 2, borderLeft: "2px dashed #2a2a2a" }}
        />

        <div className="space-y-5">
          {milestones.map((milestone, i) => {
            const color = ACCENT_COLORS[i % ACCENT_COLORS.length];
            return (
              <div
                key={`${milestone.sha}-${i}`}
                ref={(el) => {
                  if (el) itemRefs.current[i] = el;
                }}
                className="flex gap-4 relative"
                style={{ opacity: 0 }}
              >
                {/* Icon circle */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 z-10"
                  style={{
                    background: "#1a1a1a",
                    border: `2px solid ${color}`,
                    boxShadow: `0 0 10px ${color}33`,
                  }}
                >
                  {MILESTONE_ICONS[milestone.type] || "📌"}
                </div>

                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className="font-medium text-sm"
                      style={{
                        color: "#f0f0f0",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {milestone.title}
                    </p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${color}22`,
                        color,
                        border: `1px solid ${color}44`,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {new Date(milestone.date).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p
                    className="text-xs mt-0.5 leading-relaxed"
                    style={{
                      color: "#888",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {milestone.significance}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
