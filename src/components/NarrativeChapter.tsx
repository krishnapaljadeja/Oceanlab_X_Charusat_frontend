import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NarrativeChapter as NarrativeChapterType } from "@/lib/types";
import { toParas } from "@/lib/utils";

interface NarrativeChapterProps {
  chapter: NarrativeChapterType;
  index: number;
}

const BORDER_COLORS = ["#FFD93D", "#4CC9F0", "#FF6B9D", "#6BCB77", "#FF8C42"];

const ROTATIONS = [-2, 1, -1, 2, -1.5];

export default function NarrativeChapter({
  chapter,
  index,
}: NarrativeChapterProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const color = BORDER_COLORS[index % BORDER_COLORS.length];
  const rotation = ROTATIONS[index % ROTATIONS.length];

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      if (!cardRef.current) return;
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 50, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: cardRef },
  );

  return (
    <div
      ref={cardRef}
      className="rounded-xl p-6 relative"
      style={{
        background: "#1a1a1a",
        border: "2px solid #2a2a2a",
        borderTop: `4px solid ${color}`,
        boxShadow: `4px 4px 0px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center",
        opacity: 0,
      }}
    >
      {/* Chapter label + period */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <span
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color, fontFamily: "'Bebas Neue', cursive" }}
          >
            Chapter {index + 1}
          </span>
          <h3
            className="text-xl mt-0.5"
            style={{
              color: "#f0f0f0",
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "0.04em",
            }}
          >
            {chapter.title}
          </h3>
        </div>
        <span
          className="text-xs px-3 py-1 rounded-full flex-shrink-0"
          style={{
            background: `${color}18`,
            color,
            border: `1.5px solid ${color}44`,
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {chapter.period}
        </span>
      </div>

      {/* Story text */}
      <div className="mb-4 space-y-3">
        {toParas(chapter.story).map((para, i) => (
          <p
            key={i}
            className="text-sm leading-relaxed"
            style={{
              color: i === 0 ? "#c8c8c8" : "#999",
              fontFamily: "'DM Sans', sans-serif",
              borderLeft:
                i === 0 ? `3px solid ${color}44` : "3px solid transparent",
              paddingLeft: "0.75rem",
            }}
          >
            {para}
          </p>
        ))}
      </div>

      {/* Key Events */}
      {chapter.keyEvents.length > 0 && (
        <div
          className="rounded-lg p-4"
          style={{ background: "#141414", border: "1px solid #2a2a2a" }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: color, fontFamily: "'Bebas Neue', cursive" }}
          >
            Key Events
          </p>
          <ul className="space-y-1.5">
            {chapter.keyEvents.map((event, i) => (
              <li
                key={i}
                className="text-sm flex items-start gap-2"
                style={{ color: "#888", fontFamily: "'DM Sans', sans-serif" }}
              >
                <span style={{ color, marginTop: 2, flexShrink: 0 }}>▸</span>
                <span>{event}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
