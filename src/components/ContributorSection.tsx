import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NormalizedContributor } from "@/lib/types";
import { toParas } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ContributorSectionProps {
  contributors: NormalizedContributor[];
  insights: string;
  repoUrl: string;
}

const CARD_COLORS = [
  { border: "#FFD93D", bg: "rgba(255,217,61,0.06)" },
  { border: "#4CC9F0", bg: "rgba(76,201,240,0.06)" },
  { border: "#FF6B9D", bg: "rgba(255,107,157,0.06)" },
  { border: "#6BCB77", bg: "rgba(107,203,119,0.06)" },
  { border: "#FF8C42", bg: "rgba(255,140,66,0.06)" },
];

const ROLE_LABELS = [
  "LEAD DEV",
  "CONTRIBUTOR",
  "MAINTAINER",
  "ENGINEER",
  "AUTHOR",
];

function getInitials(login: string) {
  return login.charAt(0).toUpperCase();
}

export default function ContributorSection({
  contributors,
  insights,
  repoUrl,
}: ContributorSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLElement[]>([]);
  const [loadingLogin, setLoadingLogin] = useState<string | null>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          {
            opacity: 0,
            rotation: (Math.random() - 0.5) * 20,
            y: 40,
            scale: 0.85,
          },
          {
            opacity: 1,
            rotation: 0,
            y: 0,
            scale: 1,
            duration: 0.7,
            delay: i * 0.08,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    },
    { scope: containerRef },
  );

  const maxCommits = contributors.length > 0 ? contributors[0].commitCount : 1;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-4">
        <h2
          className="text-4xl"
          style={{
            color: "#f0f0f0",
            fontFamily: "'Bebas Neue', cursive",
            letterSpacing: "0.06em",
          }}
        >
          CONTRIBUTORS
        </h2>
        <div style={{ height: 2, flex: 1, background: "#2a2a2a" }} />
      </div>

      {/* Insights */}
      {insights && (
        <div
          className="p-4 rounded-xl"
          style={{
            background: "#1a1a1a",
            border: "2px solid #2a2a2a",
            borderLeft: "4px solid #4CC9F0",
          }}
        >
          <div className="space-y-3">
            {toParas(insights).map((para, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed"
                style={{
                  color: i === 0 ? "#c4c4c4" : "#9a9a9a",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Trading cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {contributors.slice(0, 10).map((contributor, i) => {
          const colorSet = CARD_COLORS[i % CARD_COLORS.length];
          const isTop = i === 0;
          const commitPct = Math.round(
            (contributor.commitCount / maxCommits) * 100,
          );

          return (
            <Link
              key={contributor.login}
              to={`/contributor/${encodeURIComponent(contributor.login)}?repo=${encodeURIComponent(repoUrl)}`}
              onClick={() => setLoadingLogin(contributor.login)}
              ref={(el) => {
                if (el) cardRefs.current[i] = el;
              }}
              className="rounded-xl p-4 relative flex flex-col gap-3 group cursor-pointer transition-transform hover:-translate-y-1"
              style={{
                background: isTop
                  ? "linear-gradient(135deg, rgba(255,217,61,0.12), #1a1a1a)"
                  : colorSet.bg,
                border: `2px solid ${isTop ? "#FFD93D" : colorSet.border}`,
                boxShadow: isTop
                  ? `4px 4px 0 rgba(255,217,61,0.3)`
                  : `4px 4px 0 rgba(0,0,0,0.4)`,
                opacity: 0,
                textDecoration: "none",
              }}
            >
              {/* Crown for top contributor */}
              {isTop && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 text-xl"
                  title="Top Contributor"
                >
                  👑
                </div>
              )}

              {/* Avatar */}
              <div className="flex flex-col items-center gap-2 pt-2">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{
                    background: `${colorSet.border}22`,
                    border: `3px solid ${colorSet.border}`,
                    color: colorSet.border,
                    fontFamily: "'Bebas Neue', cursive",
                  }}
                >
                  {getInitials(contributor.login)}
                </div>
                <div className="text-center">
                  <p
                    className="text-sm font-bold truncate max-w-[100px]"
                    style={{
                      color: "#f0f0f0",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {contributor.login}
                  </p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: `${colorSet.border}22`,
                      color: colorSet.border,
                      fontFamily: "'Bebas Neue', cursive",
                      letterSpacing: "0.06em",
                      fontSize: "0.65rem",
                    }}
                  >
                    {ROLE_LABELS[i % ROLE_LABELS.length]}
                  </span>
                </div>
              </div>

              {/* Commit count */}
              <div className="text-center">
                <span
                  className="text-2xl"
                  style={{
                    color: colorSet.border,
                    fontFamily: "'Bebas Neue', cursive",
                  }}
                >
                  {contributor.commitCount}
                </span>
                <p
                  className="text-xs"
                  style={{ color: "#666", fontFamily: "'DM Sans', sans-serif" }}
                >
                  commits
                </p>
              </div>

              {/* Commit bar */}
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "#2a2a2a" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${commitPct}%`,
                    background: colorSet.border,
                  }}
                />
              </div>

              {/* Areas */}
              {contributor.primaryAreas.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center">
                  {contributor.primaryAreas.slice(0, 2).map((area) => (
                    <span
                      key={area}
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: "#2a2a2a",
                        color: "#777",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.6rem",
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}

              <span
                className="text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  color: "#4CC9F0",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {loadingLogin === contributor.login
                  ? "Loading details..."
                  : "View details →"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
