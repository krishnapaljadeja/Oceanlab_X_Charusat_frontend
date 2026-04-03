import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Search } from "lucide-react";
import AnalysisFilters from "@/components/AnalysisFilters";
import { AnalysisFilters as AnalysisFiltersType } from "@/lib/types";

interface RepoInputProps {
  onAnalyze: (url: string, filters?: AnalysisFiltersType) => void;
  isLoading: boolean;
}

const DEFAULT_FILTERS: AnalysisFiltersType = {
  dateRange: { type: "all" },
  excludeMergeCommits: false,
};

function getEffectiveFilters(
  filters: AnalysisFiltersType,
): AnalysisFiltersType | undefined {
  const hasDateFilter = filters.dateRange.type !== "all";
  const hasMergeFilter = filters.excludeMergeCommits;
  const hasBranchFilter = Boolean(filters.branchFilter?.trim());
  const hasPathFilter = Boolean(filters.pathFilter?.trim());
  const hasMinLinesFilter =
    typeof filters.minLinesChanged === "number" && filters.minLinesChanged > 0;

  if (
    !hasDateFilter &&
    !hasMergeFilter &&
    !hasBranchFilter &&
    !hasPathFilter &&
    !hasMinLinesFilter
  ) {
    return undefined;
  }

  return filters;
}

const EXAMPLE_REPOS = [
  { label: "expressjs/express", url: "https://github.com/expressjs/express" },
  { label: "axios/axios", url: "https://github.com/axios/axios" },
  {
    label: "typicode/json-server",
    url: "https://github.com/typicode/json-server",
  },
];

export default function RepoInput({ onAnalyze, isLoading }: RepoInputProps) {
  const [url, setUrl] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AnalysisFiltersType>(DEFAULT_FILTERS);
  const btnRef = useRef<HTMLButtonElement>(null);

  const { contextSafe } = useGSAP();

  const handleBtnHoverIn = contextSafe(() => {
    if (!btnRef.current) return;
    gsap.to(btnRef.current, {
      scale: 1.05,
      boxShadow: "6px 6px 0px #000",
      x: -2,
      y: -2,
      duration: 0.15,
      ease: "power2.out",
    });
  });

  const handleBtnHoverOut = contextSafe(() => {
    if (!btnRef.current) return;
    gsap.to(btnRef.current, {
      scale: 1,
      boxShadow: "4px 4px 0px #000",
      x: 0,
      y: 0,
      duration: 0.15,
      ease: "power2.in",
    });
  });

  const handleBtnClick = contextSafe(() => {
    if (!btnRef.current) return;
    gsap
      .timeline()
      .to(btnRef.current, {
        scale: 0.96,
        boxShadow: "1px 1px 0px #000",
        x: 2,
        y: 2,
        duration: 0.08,
      })
      .to(btnRef.current, {
        scale: 1,
        boxShadow: "4px 4px 0px #000",
        x: 0,
        y: 0,
        duration: 0.12,
      });
  });

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    handleBtnClick();
    onAnalyze(trimmed, getEffectiveFilters(filters));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        {/* Comic-book input */}
        <div className="flex-1 relative">
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#4CC9F0" }}
          >
            <Search size={18} />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="https://github.com/owner/repository"
            disabled={isLoading}
            className="w-full pl-11 pr-4 py-4 text-sm text-white placeholder-gray-600 rounded-xl disabled:opacity-50 focus:outline-none transition-colors"
            style={{
              background: "#1a1a1a",
              border: "2px solid #2a2a2a",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#FFD93D";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(255,217,61,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#2a2a2a";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Chunky yellow analyze button */}
        <button
          ref={btnRef}
          onClick={handleSubmit}
          disabled={isLoading || !url.trim()}
          onMouseEnter={handleBtnHoverIn}
          onMouseLeave={handleBtnHoverOut}
          className="px-7 py-4 rounded-xl font-bold text-sm tracking-widest uppercase text-black disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "var(--accent-yellow)",
            border: "2px solid #000",
            boxShadow: "4px 4px 0px #000",
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "1.1rem",
            letterSpacing: "0.08em",
            willChange: "transform",
          }}
        >
          {isLoading ? "..." : "Analyze"}
        </button>
      </div>

      {/* Example repos */}
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className="text-xs px-3 py-1.5 rounded-full transition-all hover:-translate-y-0.5"
          style={{
            background: "#1a1a1a",
            border: "1.5px solid #4CC9F0",
            color: "#4CC9F0",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {showFilters ? "Hide filters" : "Show filters"}
        </button>
        <span className="text-xs text-gray-600 uppercase tracking-widest">
          Try:
        </span>
        {EXAMPLE_REPOS.map((example) => (
          <button
            key={example.url}
            onClick={() => {
              setUrl(example.url);
              onAnalyze(example.url, getEffectiveFilters(filters));
            }}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-full disabled:opacity-50 transition-all hover:-translate-y-0.5"
            style={{
              background: "#1a1a1a",
              border: "1.5px solid #3a3a3a",
              color: "#9a9a9a",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#FFD93D";
              e.currentTarget.style.color = "#FFD93D";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#3a3a3a";
              e.currentTarget.style.color = "#9a9a9a";
            }}
          >
            {example.label}
          </button>
        ))}
      </div>

      {showFilters && (
        <AnalysisFilters filters={filters} onChange={setFilters} />
      )}
    </div>
  );
}
