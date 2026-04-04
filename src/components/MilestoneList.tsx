import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GeneratedNarrative } from "@/lib/types";

interface MilestoneListProps {
  milestones: GeneratedNarrative["milestoneHighlights"];
}

const ACCENT_COLORS = ["#4CC9F0", "#FF6B9D", "#6BCB77", "#FFD93D", "#FF8C42"];

export default function MilestoneList({ milestones }: MilestoneListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLDivElement[]>([]);
  const isScrollable = milestones.length > 6;

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      itemRefs.current = itemRefs.current.slice(0, milestones.length);
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        if (isScrollable) {
          gsap.set(el, { opacity: 1, x: 0, scale: 1 });
          return;
        }
        gsap.fromTo(
          el,
          { opacity: 0, x: 40, scale: 0.96 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.6,
            delay: i * 0.05,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    },
    {
      scope: containerRef,
      dependencies: [milestones, isScrollable],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      ref={containerRef}
      className="rounded-xl p-6"
      style={{
        background: "#1a1a1a",
        border: "2px solid #2a2a2a",
        transform: "rotate(-0.5deg)",
      }}
    >
      <h2
        className="text-2xl mb-4"
        style={{
          color: "#f0f0f0",
          fontFamily: "'Bebas Neue', cursive",
          letterSpacing: "0.06em",
        }}
      >
        MILESTONE HIGHLIGHTS
      </h2>
      <div
        className={
          isScrollable ? "space-y-3 pr-2 overflow-y-auto" : "space-y-3"
        }
        style={isScrollable ? { maxHeight: 640 } : undefined}
      >
        {milestones.map((m, i) => {
          const color = ACCENT_COLORS[i % ACCENT_COLORS.length];
          return (
            <div
              key={i}
              ref={(el) => {
                if (el) itemRefs.current[i] = el;
              }}
              className="flex gap-3 p-3 rounded-lg"
              style={{
                background: "#141414",
                border: `1.5px solid ${color}33`,
                borderLeft: `3px solid ${color}`,
                opacity: isScrollable ? 1 : 0,
              }}
            >
              <div
                className="flex-shrink-0 text-xs pt-0.5 font-bold"
                style={{
                  color,
                  fontFamily: "'Bebas Neue', cursive",
                  minWidth: 60,
                  letterSpacing: "0.04em",
                }}
              >
                {new Date(m.date).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{
                    color: "#f0f0f0",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {m.title}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "#888", fontFamily: "'DM Sans', sans-serif" }}
                >
                  {m.significance}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
