import { useState } from "react";
import AnalysisFilters from "@/components/AnalysisFilters";
import { AnalysisFilters as AnalysisFiltersType } from "@/lib/types";
import { AiInput003 } from "@/components/ui/ai-input-003";

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

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    onAnalyze(trimmed, getEffectiveFilters(filters));
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <AiInput003
        value={url}
        onValueChange={setUrl}
        onSendMessage={() => handleSubmit()}
        placeholder="https://github.com/owner/repository"
        disabled={isLoading}
        submitLabel={isLoading ? "..." : "Analyze"}
      />

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
