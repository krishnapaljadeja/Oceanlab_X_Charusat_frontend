import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExternalLink } from "lucide-react";
import { RepoMeta, AnalysisSummary } from "@/lib/types";

interface ProjectOverviewProps {
  repoMeta: RepoMeta;
  summary: AnalysisSummary;
  projectOverview: string;
}

const STAT_COLORS = ["#FFD93D", "#4CC9F0", "#6BCB77", "#FF8C42"];
const STAT_ROTATIONS = [-2, 1.5, -1, 2];

export default function ProjectOverview({
  repoMeta,
  summary,
  projectOverview,
}: ProjectOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement[]>([]);

  const repoAgeMs =
    new Date().getTime() - new Date(repoMeta.createdAt).getTime();
  const ageMonths = Math.max(
    1,
    Math.round(repoAgeMs / (1000 * 60 * 60 * 24 * 30.4375)),
  );
  const ageYears = Math.floor(ageMonths / 12);
  const ageLabel = ageYears < 1 ? `${ageMonths}mo` : `${ageYears}y`;

  const stats = [
    {
      label: "Commits",
      value: summary.totalCommitsInRepo.toLocaleString(),
      icon: "◈",
    },
    {
      label: "Contributors",
      value: summary.topContributors.length.toString(),
      icon: "👥",
    },
    { label: "Stars", value: repoMeta.stars.toLocaleString(), icon: "⭐" },
    { label: "Age", value: ageLabel, icon: "📅" },
  ];

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      statsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 30, rotation: STAT_ROTATIONS[i] * 2 },
          {
            opacity: 1,
            y: 0,
            rotation: STAT_ROTATIONS[i],
            duration: 0.6,
            delay: i * 0.1,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
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
      className="rounded-xl p-6 space-y-5"
      style={{ background: "#1a1a1a", border: "2px solid #2a2a2a" }}
    >
      {/* Repo name + link */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <a
            href={repoMeta.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group"
          >
            <h1
              className="text-4xl sm:text-5xl leading-none"
              style={{
                color: "#f0f0f0",
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "0.05em",
              }}
            >
              {repoMeta.fullName}
            </h1>
            <ExternalLink
              size={18}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "#FFD93D", flexShrink: 0 }}
            />
          </a>
          {repoMeta.description && (
            <p
              className="text-sm mt-2 max-w-2xl"
              style={{ color: "#888", fontFamily: "'DM Sans', sans-serif" }}
            >
              {repoMeta.description}
            </p>
          )}
        </div>

        {/* Language tag */}
        {repoMeta.language && (
          <span
            className="px-4 py-1.5 rounded-full text-sm font-bold flex-shrink-0"
            style={{
              background: "rgba(76,201,240,0.15)",
              color: "#4CC9F0",
              border: "2px solid #4CC9F0",
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "0.08em",
            }}
          >
            {repoMeta.language}
          </span>
        )}
      </div>

      {/* Overview text */}
      <p
        className="text-sm leading-relaxed"
        style={{
          color: "#b0b0b0",
          fontFamily: "'DM Sans', sans-serif",
          borderLeft: "3px solid #FFD93D",
          paddingLeft: "1rem",
        }}
      >
        {projectOverview}
      </p>

      {/* Stat sticker badges */}
      <div className="flex flex-wrap gap-4 pt-2">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            ref={(el) => {
              if (el) statsRef.current[i] = el;
            }}
            className="text-center px-5 py-3 rounded-xl min-w-[80px]"
            style={{
              background: `${STAT_COLORS[i]}18`,
              border: `2px solid ${STAT_COLORS[i]}`,
              boxShadow: `3px 3px 0 rgba(0,0,0,0.5)`,
              transform: `rotate(${STAT_ROTATIONS[i]}deg)`,
              opacity: 0,
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{
                color: STAT_COLORS[i],
                fontFamily: "'Bebas Neue', cursive",
              }}
            >
              {stat.value}
            </p>
            <p
              className="text-xs"
              style={{ color: "#888", fontFamily: "'DM Sans', sans-serif" }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Topics */}
      {repoMeta.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {repoMeta.topics.map((topic) => (
            <span
              key={topic}
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                background: "#2a2a2a",
                color: "#888",
                border: "1px solid #3a3a3a",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              #{topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
