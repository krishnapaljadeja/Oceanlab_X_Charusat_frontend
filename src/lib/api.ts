/// <reference types="vite/client" />
import axios, { AxiosError } from "axios";
import {
  ApiResponse,
  HistoryItem,
  QAMessage,
  HeatmapData,
  AnalysisFilters,
  ContributorProfile,
  GeneratedDocs,
  IngestDigest,
} from "./types";
import { supabase } from "./supabase";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

async function buildAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return {};
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

export async function analyzeRepo(
  repoUrl: string,
  filters?: AnalysisFilters,
): Promise<ApiResponse> {
  try {
    const headers = await buildAuthHeaders();
    const response = await axios.post<ApiResponse>(
      `${BACKEND_URL}/api/analyze`,
      { repoUrl, filters },
      {
        timeout: 300000,
        headers,
      }, // 5 min timeout — large repos (e.g. keploy) can take 3+ min
    );
    return response.data;
  } catch (err) {
    const axiosErr = err as AxiosError<{ error: string; code: string }>;
    if (axiosErr.response?.data) {
      return {
        success: false,
        error: axiosErr.response.data.error || "Analysis failed",
        code: axiosErr.response.data.code || "UNKNOWN",
      };
    }
    if (axiosErr.code === "ECONNABORTED") {
      return {
        success: false,
        error: "Analysis timed out. Try a smaller or simpler repository.",
        code: "TIMEOUT",
      };
    }
    return {
      success: false,
      error: "Could not connect to the analysis server.",
      code: "NETWORK_ERROR",
    };
  }
}

export async function refreshRepo(
  repoUrl: string,
  filters?: AnalysisFilters,
): Promise<ApiResponse> {
  try {
    const headers = await buildAuthHeaders();
    const response = await axios.post<ApiResponse>(
      `${BACKEND_URL}/api/analyze/refresh`,
      { repoUrl, filters },
      { timeout: 300000, headers },
    );
    return response.data;
  } catch (err) {
    const axiosErr = err as AxiosError<{ error: string; code: string }>;
    if (axiosErr.response?.data) {
      return {
        success: false,
        error: axiosErr.response.data.error || "Refresh failed",
        code: axiosErr.response.data.code || "UNKNOWN",
      };
    }
    if (axiosErr.code === "ECONNABORTED") {
      return {
        success: false,
        error: "Refresh timed out. Try again later.",
        code: "TIMEOUT",
      };
    }
    return {
      success: false,
      error: "Could not connect to the analysis server.",
      code: "NETWORK_ERROR",
    };
  }
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  try {
    const headers = await buildAuthHeaders();
    const response = await axios.get<{ success: true; history: HistoryItem[] }>(
      `${BACKEND_URL}/api/history`,
      { headers },
    );
    return response.data.history;
  } catch {
    return [];
  }
}

export async function askQuestion(
  owner: string,
  repo: string,
  question: string,
  history: QAMessage[],
): Promise<
  | { success: true; answer: string; timestamp: string }
  | { success: false; error: string }
> {
  try {
    const headers = await buildAuthHeaders();
    const response = await axios.post<{
      success: true;
      answer: string;
      timestamp: string;
    }>(
      `${BACKEND_URL}/api/qa`,
      { owner, repo, question, history: history.slice(-5) },
      { timeout: 30000, headers },
    );
    return response.data;
  } catch (err) {
    const axiosErr = err as AxiosError<{ error: string }>;
    if (axiosErr.response?.data?.error) {
      return { success: false, error: axiosErr.response.data.error };
    }
    if (axiosErr.code === "ECONNABORTED") {
      return {
        success: false,
        error: "Request timed out. Please try again.",
      };
    }
    return {
      success: false,
      error: "Could not get an answer. Please try again.",
    };
  }
}

export async function fetchHeatmap(
  owner: string,
  repo: string,
): Promise<HeatmapData | null> {
  try {
    const headers = await buildAuthHeaders();
    const response = await axios.get<HeatmapData & { success: true }>(
      `${BACKEND_URL}/api/heatmap/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      { timeout: 10000, headers },
    );
    const { success: _success, ...data } = response.data;
    return data;
  } catch {
    return null;
  }
}

export async function fetchContributorProfile(
  repoUrl: string,
  login: string,
  filters?: AnalysisFilters,
): Promise<
  | { success: true; profile: ContributorProfile }
  | { success: false; error: string }
> {
  try {
    const headers = await buildAuthHeaders();
    const response = await axios.post<{
      success: true;
      profile: ContributorProfile;
    }>(
      `${BACKEND_URL}/api/contributors/profile`,
      { repoUrl, login, filters },
      { timeout: 120000, headers },
    );
    return response.data;
  } catch (err) {
    const axiosErr = err as AxiosError<{ error?: string }>;
    return {
      success: false,
      error:
        axiosErr.response?.data?.error ||
        "Could not load contributor profile. Please try again.",
    };
  }
}

export async function generateDocs(
  repoUrl: string,
): Promise<
  { success: true; docs: GeneratedDocs } | { success: false; error: string }
> {
  try {
    const headers = await buildAuthHeaders();
    const response = await axios.post<{ success: true; docs: GeneratedDocs }>(
      `${BACKEND_URL}/api/docs/generate`,
      { repoUrl },
      { timeout: 180000, headers },
    );
    return response.data;
  } catch (err) {
    const axiosErr = err as AxiosError<{ error?: string }>;
    return {
      success: false,
      error:
        axiosErr.response?.data?.error ||
        "Could not generate docs. Please try again.",
    };
  }
}

export async function fetchIngestDigest(
  repoUrl: string,
  options?: {
    includePatterns?: string[];
    excludePatterns?: string[];
    maxFileSize?: number;
  },
): Promise<
  { success: true; digest: IngestDigest } | { success: false; error: string }
> {
  try {
    const headers = await buildAuthHeaders();
    const response = await axios.post<{ success: true; digest: IngestDigest }>(
      `${BACKEND_URL}/api/ingest/fetch`,
      { repoUrl, options },
      { timeout: 180000, headers },
    );
    return response.data;
  } catch (err) {
    const axiosErr = err as AxiosError<{ error?: string }>;
    return {
      success: false,
      error:
        axiosErr.response?.data?.error ||
        "Could not ingest repository content. Please try again.",
    };
  }
}

export async function generateIngestReadme(
  repoUrl: string,
  digest?: IngestDigest,
): Promise<
  | { success: true; readme: string; digest: IngestDigest }
  | { success: false; error: string }
> {
  try {
    const headers = await buildAuthHeaders();
    const response = await axios.post<{
      success: true;
      readme: string;
      digest: IngestDigest;
    }>(
      `${BACKEND_URL}/api/ingest/readme`,
      { repoUrl, digest },
      { timeout: 180000, headers },
    );
    return response.data;
  } catch (err) {
    const axiosErr = err as AxiosError<{ error?: string }>;
    return {
      success: false,
      error:
        axiosErr.response?.data?.error ||
        "Could not generate README. Please try again.",
    };
  }
}
