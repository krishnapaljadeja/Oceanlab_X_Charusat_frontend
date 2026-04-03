export interface RepoMeta {
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
  topics: string[];
}

export interface DevelopmentPhase {
  name: string;
  label: string;
  startDate: string;
  endDate: string;
  commitCount: number;
  dominantType: string;
  commitTypeBreakdown: Record<string, number>;
  keyFiles: string[];
  contributors: string[];
  velocity: "high" | "medium" | "low";
}

export interface Milestone {
  date: string;
  sha: string;
  title: string;
  type: string;
  significance: string;
}

export interface NormalizedContributor {
  name: string;
  login: string;
  commitCount: number;
  firstCommitDate: string;
  lastCommitDate: string;
  primaryAreas: string[];
}

export interface AnalysisSummary {
  repoMeta: RepoMeta;
  totalCommitsInRepo: number;
  analyzedCommitCount: number;
  dateRange: { first: string; last: string };
  topContributors: NormalizedContributor[];
  phases: DevelopmentPhase[];
  milestones: Milestone[];
  commitQualityScore: number;
  commitTypeBreakdown: Record<string, number>;
  tags: Array<{ name: string; sha: string }>;
  isCapped: boolean;
  dataConfidenceLevel: "high" | "medium" | "low";
}

export interface NarrativeChapter {
  title: string;
  period: string;
  story: string;
  keyEvents: string[];
}

export interface GeneratedNarrative {
  projectOverview: string;
  narrativeChapters: NarrativeChapter[];
  milestoneHighlights: Array<{
    date: string;
    title: string;
    significance: string;
  }>;
  contributorInsights: string;
  architecturalObservations: string;
  currentState: string;
  dataConfidenceNote: string;
}

export interface AnalysisResponse {
  success: true;
  repoMeta: RepoMeta;
  summary: AnalysisSummary;
  narrative: GeneratedNarrative;
  analyzedAt: string;
  fromCache: boolean;
  staleness: StalenessInfo;
}

export interface AnalysisFilters {
  dateRange: {
    type: "last_n_months" | "last_n_commits" | "all" | "custom";
    months?: number;
    commitCount?: number;
    from?: string;
    to?: string;
  };
  excludeMergeCommits: boolean;
  branchFilter?: string;
  pathFilter?: string;
  minLinesChanged?: number;
}

export interface CommitDetail {
  sha: string;
  message: string;
  date: string;
  filesChanged: number;
  linesAdded: number;
  linesDeleted: number;
  impactScore: number;
  impactLabel: "Critical" | "High" | "Medium" | "Low";
  aiImpactSummary: string;
  filesAffected: string[];
}

export interface ContributorProfile {
  login: string;
  avatarUrl: string;
  totalCommits: number;
  totalLinesAdded: number;
  totalLinesDeleted: number;
  totalFilesChanged: number;
  overallImpactScore: number;
  primaryWorkAreas: string[];
  specializations: string[];
  peakActivityPeriod: string;
  firstCommitDate: string;
  lastCommitDate: string;
  commitFrequency: string;
  aiContributorSummary: string;
  commits: CommitDetail[];
}

export interface GeneratedDocs {
  readme: string;
}

export interface IngestDigest {
  summary: string;
  tree: string;
  content: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
}

export type ApiResponse = AnalysisResponse | ErrorResponse;

export interface StalenessInfo {
  isStale: boolean;
  newCommitsSince: number;
  lastAnalyzedAt: string;
  storedCommitCount: number;
  currentCommitCount: number;
}

export interface HistoryItem {
  owner: string;
  repo: string;
  fullName: string;
  analyzedAt: string;
  commitCount: number;
  language: string | null;
  description: string | null;
  stars: number;
}

export interface QAMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface HeatmapWeek {
  days: HeatmapDay[];
}

export interface HeatmapStats {
  totalCommits: number;
  activeDays: number;
  longestStreak: number;
  currentStreak: number;
  mostActiveDay: string;
  mostActiveDayCount: number;
  mostActiveDayOfWeek: string;
  averageCommitsPerActiveDay: number;
}

export interface HeatmapData {
  weeks: HeatmapWeek[];
  stats: HeatmapStats;
  year: number;
  owner: string;
  repo: string;
}
