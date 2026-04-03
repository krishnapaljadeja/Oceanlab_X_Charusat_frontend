import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { fetchContributorProfile } from "@/lib/api";
import { CommitDetail, ContributorProfile } from "@/lib/types";
import { timeAgo } from "@/lib/timeAgo";
import ErrorBanner from "@/components/ErrorBanner";

type ImpactFilter = "All" | "Critical" | "High" | "Medium" | "Low";
type SortOption = "newest" | "highest-impact" | "oldest";

const IMPACT_FILTERS: ImpactFilter[] = [
  "All",
  "Critical",
  "High",
  "Medium",
  "Low",
];

function impactColor(label: CommitDetail["impactLabel"]): string {
  if (label === "Critical") return "#ff5d5d";
  if (label === "High") return "#ff9f43";
  if (label === "Medium") return "#ffd93d";
  return "#8a8a8a";
}

function formatPeriod(dateIso: string): string {
  if (!dateIso) return "Unknown";
  return new Date(dateIso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-full px-4 py-2 whitespace-nowrap"
      style={{
        background: "#1a1a1a",
        border: "1px solid #2e2e2e",
      }}
    >
      <p className="text-[11px] uppercase" style={{ color: "#7a7a7a" }}>
        {label}
      </p>
      <p className="text-sm" style={{ color: "#f0f0f0" }}>
        {value}
      </p>
    </div>
  );
}

export default function ContributorPage() {
  const { login = "" } = useParams();
  const [searchParams] = useSearchParams();
  const repoUrl = searchParams.get("repo") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ContributorProfile | null>(null);
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>("All");
  const [sort, setSort] = useState<SortOption>("newest");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!repoUrl || !login) {
        setError("Missing contributor or repository details.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const result = await fetchContributorProfile(repoUrl, login);
      if (cancelled) return;

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setProfile(result.profile);
      setLoading(false);
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [login, repoUrl]);

  const filteredCommits = useMemo(() => {
    if (!profile) return [];

    let commits = [...profile.commits];
    if (impactFilter !== "All") {
      commits = commits.filter((commit) => commit.impactLabel === impactFilter);
    }

    if (sort === "highest-impact") {
      commits.sort((a, b) => b.impactScore - a.impactScore);
    } else if (sort === "oldest") {
      commits.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    } else {
      commits.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    }

    return commits;
  }, [impactFilter, profile, sort]);

  const backHref = useMemo(() => {
    try {
      const parsed = new URL(repoUrl);
      const [owner, repo] = parsed.pathname.split("/").filter(Boolean);
      if (!owner || !repo) return "/analyze";
      return `/analyze?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`;
    } catch {
      return "/analyze";
    }
  }, [repoUrl]);

  const copySha = async (sha: string) => {
    try {
      await navigator.clipboard.writeText(sha);
      setCopiedSha(sha);
      window.setTimeout(() => setCopiedSha(null), 1200);
    } catch {
      setCopiedSha(null);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 max-w-5xl mx-auto space-y-6">
      <Link
        to={backHref}
        className="inline-flex items-center gap-2 text-sm"
        style={{ color: "#9a9a9a" }}
      >
        ← Back to Story
      </Link>

      {error && (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl p-5 animate-pulse"
              style={{ background: "#171717", border: "1px solid #2a2a2a" }}
            >
              <div
                className="h-4 w-40 rounded"
                style={{ background: "#2b2b2b" }}
              />
              <div
                className="h-3 w-3/4 rounded mt-3"
                style={{ background: "#242424" }}
              />
              <div
                className="h-3 w-2/3 rounded mt-2"
                style={{ background: "#232323" }}
              />
            </div>
          ))}
        </div>
      )}

      {profile && !loading && (
        <>
          <section
            className="rounded-xl p-5"
            style={{ background: "#171717", border: "2px solid #2b2b2b" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full overflow-hidden"
                style={{ border: "2px solid #4CC9F0", background: "#111" }}
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.login}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm">
                    {profile.login.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1
                  className="text-2xl"
                  style={{ fontFamily: "'Bebas Neue', cursive" }}
                >
                  {profile.login}
                </h1>
                <p className="text-sm" style={{ color: "#9a9a9a" }}>
                  @{profile.login}
                </p>
              </div>
            </div>
            <p className="text-sm mt-3" style={{ color: "#9f9f9f" }}>
              {profile.aiContributorSummary}
            </p>
          </section>

          <section className="overflow-x-auto pb-1">
            <div className="flex gap-2 min-w-max">
              <StatChip
                label="Total Commits"
                value={String(profile.totalCommits)}
              />
              <StatChip
                label="Lines Added"
                value={`+${profile.totalLinesAdded}`}
              />
              <StatChip
                label="Lines Deleted"
                value={`-${profile.totalLinesDeleted}`}
              />
              <StatChip
                label="Impact Score"
                value={`${profile.overallImpactScore.toFixed(1)} pts`}
              />
              <StatChip
                label="Peak Activity"
                value={profile.peakActivityPeriod}
              />
              <StatChip
                label="Avg Frequency"
                value={profile.commitFrequency.replace("avg ", "")}
              />
              <StatChip
                label="Active Period"
                value={`${formatPeriod(profile.firstCommitDate)} - ${formatPeriod(profile.lastCommitDate)}`}
              />
            </div>
          </section>

          <section className="space-y-3">
            <h2
              className="text-xl"
              style={{ fontFamily: "'Bebas Neue', cursive" }}
            >
              Work Areas
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.primaryWorkAreas.map((area) => (
                <span
                  key={`area-${area}`}
                  className="px-3 py-1 rounded-full text-xs"
                  style={{
                    background: "rgba(76,201,240,0.12)",
                    border: "1px solid rgba(76,201,240,0.35)",
                    color: "#4CC9F0",
                  }}
                >
                  {area}
                </span>
              ))}
              {profile.specializations.map((spec) => (
                <span
                  key={`spec-${spec}`}
                  className="px-3 py-1 rounded-full text-xs"
                  style={{
                    background: "rgba(255,217,61,0.12)",
                    border: "1px solid rgba(255,217,61,0.35)",
                    color: "#FFD93D",
                  }}
                >
                  {spec}
                </span>
              ))}
            </div>
          </section>

          <section
            className="rounded-xl p-4"
            style={{ background: "#171717", border: "1px solid #2a2a2a" }}
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {IMPACT_FILTERS.map((filter) => {
                  const active = impactFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setImpactFilter(filter)}
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        background: active
                          ? "rgba(255,217,61,0.12)"
                          : "#1f1f1f",
                        border: active
                          ? "1px solid rgba(255,217,61,0.35)"
                          : "1px solid #333",
                        color: active ? "#FFD93D" : "#aaa",
                      }}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded-lg px-3 py-2 text-sm"
                style={{
                  background: "#1f1f1f",
                  border: "1px solid #333",
                  color: "#e8e8e8",
                }}
              >
                <option value="newest">Newest First</option>
                <option value="highest-impact">Highest Impact</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </section>

          <section className="space-y-3">
            {filteredCommits.map((commit) => {
              const shortSha = commit.sha.slice(0, 7);
              const isExpanded = Boolean(expanded[commit.sha]);

              return (
                <article
                  key={commit.sha}
                  className="rounded-xl p-4"
                  style={{ background: "#171717", border: "1px solid #2a2a2a" }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => copySha(commit.sha)}
                      className="text-sm"
                      title="Click to copy SHA"
                      style={{
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                        color: "#4CC9F0",
                      }}
                    >
                      {shortSha}
                      {copiedSha === commit.sha ? "  Copied!" : ""}
                    </button>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs"
                        title={new Date(commit.date).toLocaleString()}
                      >
                        {timeAgo(commit.date)}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          background: `${impactColor(commit.impactLabel)}22`,
                          border: `1px solid ${impactColor(commit.impactLabel)}66`,
                          color: impactColor(commit.impactLabel),
                        }}
                      >
                        {commit.impactLabel}
                      </span>
                      <span className="text-xs" style={{ color: "#a0a0a0" }}>
                        {commit.impactScore.toFixed(1)} pts
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-sm" style={{ color: "#ececec" }}>
                    {commit.message}
                  </p>

                  <p
                    className="mt-2 text-sm italic"
                    style={{ color: "#9a9a9a" }}
                  >
                    {commit.aiImpactSummary}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    <span style={{ color: "#6BCB77" }}>
                      +{commit.linesAdded}
                    </span>
                    <span style={{ color: "#FF6B6B" }}>
                      -{commit.linesDeleted}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [commit.sha]: !prev[commit.sha],
                      }))
                    }
                    className="mt-3 text-xs"
                    style={{ color: "#4CC9F0" }}
                  >
                    {isExpanded
                      ? "Hide files"
                      : `Show ${commit.filesAffected.length} files`}
                  </button>

                  {isExpanded && commit.filesAffected.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {commit.filesAffected.map((filePath) => (
                        <div
                          key={`${commit.sha}-${filePath}`}
                          className="text-xs"
                          style={{
                            color: "#b0b0b0",
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                          }}
                        >
                          {filePath}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
}
