import { AnalysisFilters as AnalysisFiltersType } from "@/lib/types";

interface AnalysisFiltersProps {
  filters: AnalysisFiltersType;
  onChange: (filters: AnalysisFiltersType) => void;
}

const RANGE_OPTIONS: Array<{
  id: "all" | "last_3" | "last_6" | "last_12" | "custom";
  label: string;
}> = [
  { id: "all", label: "All Time" },
  { id: "last_3", label: "Last 3 Months" },
  { id: "last_6", label: "Last 6 Months" },
  { id: "last_12", label: "Last 12 Months" },
  { id: "custom", label: "Custom" },
];

const DEFAULT_FILTERS: AnalysisFiltersType = {
  dateRange: { type: "all" },
  excludeMergeCommits: true,
};

function getSelectedRangeId(
  filters: AnalysisFiltersType,
): "all" | "last_3" | "last_6" | "last_12" | "custom" {
  const { dateRange } = filters;
  if (dateRange.type === "custom") return "custom";
  if (dateRange.type === "last_n_months") {
    if (dateRange.months === 3) return "last_3";
    if (dateRange.months === 6) return "last_6";
    if (dateRange.months === 12) return "last_12";
  }
  return "all";
}

function summarizeActiveFilters(filters: AnalysisFiltersType): string | null {
  const bits: string[] = [];

  if (filters.dateRange.type === "last_n_months" && filters.dateRange.months) {
    bits.push(`Last ${filters.dateRange.months} months`);
  }
  if (filters.dateRange.type === "custom") {
    const from = filters.dateRange.from || "start";
    const to = filters.dateRange.to || "now";
    bits.push(`${from} to ${to}`);
  }
  if (filters.dateRange.commitCount && filters.dateRange.commitCount > 0) {
    bits.push(`Last ${filters.dateRange.commitCount} commits`);
  }
  if (filters.excludeMergeCommits) {
    bits.push("No merges");
  }
  if (filters.branchFilter?.trim()) {
    bits.push(`${filters.branchFilter.trim()} branch`);
  }
  if (filters.pathFilter?.trim()) {
    bits.push(`Path: ${filters.pathFilter.trim()}`);
  }
  if (filters.minLinesChanged && filters.minLinesChanged > 0) {
    bits.push(`Min ${filters.minLinesChanged} lines`);
  }

  if (bits.length === 0) return null;

  const isDefaultOnly =
    bits.length === 1 &&
    bits[0] === "No merges" &&
    DEFAULT_FILTERS.excludeMergeCommits;

  if (isDefaultOnly) return null;
  return bits.join(" · ");
}

export default function AnalysisFilters({
  filters,
  onChange,
}: AnalysisFiltersProps) {
  const selectedRangeId = getSelectedRangeId(filters);
  const summary = summarizeActiveFilters(filters);

  const update = (
    next: Omit<Partial<AnalysisFiltersType>, "dateRange"> & {
      dateRange?: Partial<AnalysisFiltersType["dateRange"]>;
    },
  ) => {
    onChange({
      ...filters,
      ...next,
      dateRange: {
        ...filters.dateRange,
        ...(next.dateRange || {}),
      },
    });
  };

  const handleRangeSelect = (
    id: "all" | "last_3" | "last_6" | "last_12" | "custom",
  ) => {
    if (id === "all") {
      update({
        dateRange: { type: "all", commitCount: filters.dateRange.commitCount },
      });
      return;
    }
    if (id === "custom") {
      update({
        dateRange: {
          type: "custom",
          from: filters.dateRange.from,
          to: filters.dateRange.to,
          commitCount: filters.dateRange.commitCount,
        },
      });
      return;
    }

    const months = id === "last_3" ? 3 : id === "last_6" ? 6 : 12;
    update({
      dateRange: {
        type: "last_n_months",
        months,
        commitCount: filters.dateRange.commitCount,
      },
    });
  };

  return (
    <div
      className="mt-4 rounded-xl p-4"
      style={{
        background: "#131313",
        border: "2px solid #2a2a2a",
      }}
    >
      <div className="space-y-4">
        <div>
          <p
            className="text-xs uppercase tracking-wider mb-2"
            style={{ color: "#787878", fontFamily: "'Bebas Neue', cursive" }}
          >
            Time Range
          </p>
          <div className="flex flex-wrap gap-2">
            {RANGE_OPTIONS.map((option) => {
              const active = selectedRangeId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleRangeSelect(option.id)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-colors"
                  style={{
                    background: active ? "rgba(255,217,61,0.14)" : "#1a1a1a",
                    border: active
                      ? "1.5px solid rgba(255,217,61,0.4)"
                      : "1.5px solid #313131",
                    color: active ? "#FFD93D" : "#909090",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {selectedRangeId === "custom" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs" style={{ color: "#a0a0a0" }}>
              From
              <input
                type="date"
                value={filters.dateRange.from || ""}
                onChange={(e) =>
                  update({ dateRange: { from: e.target.value } })
                }
                className="mt-1 w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "#1a1a1a",
                  border: "1.5px solid #333",
                  color: "#f0f0f0",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </label>
            <label className="text-xs" style={{ color: "#a0a0a0" }}>
              To
              <input
                type="date"
                value={filters.dateRange.to || ""}
                onChange={(e) => update({ dateRange: { to: e.target.value } })}
                className="mt-1 w-full px-3 py-2 rounded-lg text-sm"
                style={{
                  background: "#1a1a1a",
                  border: "1.5px solid #333",
                  color: "#f0f0f0",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs" style={{ color: "#a0a0a0" }}>
            Analyze last N commits only
            <input
              type="number"
              min={1}
              placeholder="e.g. 100"
              value={filters.dateRange.commitCount ?? ""}
              onChange={(e) => {
                const value = e.target.value
                  ? Number(e.target.value)
                  : undefined;
                update({ dateRange: { commitCount: value } });
              }}
              className="mt-1 w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: "#1a1a1a",
                border: "1.5px solid #333",
                color: "#f0f0f0",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </label>

          <label className="text-xs" style={{ color: "#a0a0a0" }}>
            Min lines changed
            <input
              type="number"
              min={1}
              placeholder="e.g. 10 (ignore trivial commits)"
              value={filters.minLinesChanged ?? ""}
              onChange={(e) => {
                const value = e.target.value
                  ? Number(e.target.value)
                  : undefined;
                update({ minLinesChanged: value });
              }}
              className="mt-1 w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: "#1a1a1a",
                border: "1.5px solid #333",
                color: "#f0f0f0",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </label>

          <label className="text-xs" style={{ color: "#a0a0a0" }}>
            Branch
            <input
              type="text"
              placeholder="main (default)"
              value={filters.branchFilter ?? ""}
              onChange={(e) =>
                update({ branchFilter: e.target.value || undefined })
              }
              className="mt-1 w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: "#1a1a1a",
                border: "1.5px solid #333",
                color: "#f0f0f0",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </label>

          <label className="text-xs" style={{ color: "#a0a0a0" }}>
            Folder scope
            <input
              type="text"
              placeholder="e.g. src/api (leave blank for all)"
              value={filters.pathFilter ?? ""}
              onChange={(e) =>
                update({ pathFilter: e.target.value || undefined })
              }
              className="mt-1 w-full px-3 py-2 rounded-lg text-sm"
              style={{
                background: "#1a1a1a",
                border: "1.5px solid #333",
                color: "#f0f0f0",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </label>
        </div>

        <label className="flex items-center gap-2 select-none">
          <input
            type="checkbox"
            checked={filters.excludeMergeCommits}
            onChange={(e) => update({ excludeMergeCommits: e.target.checked })}
            className="h-4 w-4"
          />
          <span className="text-sm" style={{ color: "#c9c9c9" }}>
            Exclude merge commits
          </span>
        </label>

        {summary && (
          <div
            className="inline-flex items-center rounded-full px-3 py-1 text-xs"
            style={{
              background: "rgba(76,201,240,0.12)",
              border: "1px solid rgba(76,201,240,0.35)",
              color: "#4CC9F0",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {summary}
          </div>
        )}
      </div>
    </div>
  );
}
