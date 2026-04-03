/// <reference types="vite/client" />
import axios, { AxiosError } from "axios";
import { ApiResponse, HistoryItem, QAMessage, HeatmapData } from "./types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export async function analyzeRepo(repoUrl: string): Promise<ApiResponse> {
  try {
    const response = await axios.post<ApiResponse>(
      `${BACKEND_URL}/api/analyze`,
      { repoUrl },
      { timeout: 300000 }, // 5 min timeout — large repos (e.g. keploy) can take 3+ min
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

export async function refreshRepo(repoUrl: string): Promise<ApiResponse> {
  try {
    const response = await axios.post<ApiResponse>(
      `${BACKEND_URL}/api/analyze/refresh`,
      { repoUrl },
      { timeout: 300000 },
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
    const response = await axios.get<{ success: true; history: HistoryItem[] }>(
      `${BACKEND_URL}/api/history`,
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
    const response = await axios.post<{
      success: true;
      answer: string;
      timestamp: string;
    }>(
      `${BACKEND_URL}/api/qa`,
      { owner, repo, question, history: history.slice(-5) },
      { timeout: 30000 },
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
    const response = await axios.get<HeatmapData & { success: true }>(
      `${BACKEND_URL}/api/heatmap/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      { timeout: 10000 },
    );
    const { success: _success, ...data } = response.data;
    return data;
  } catch {
    return null;
  }
}
