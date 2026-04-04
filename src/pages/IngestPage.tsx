import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Download,
  UploadCloud,
  FileText,
  Database,
  Copy,
  Check,
} from "lucide-react";
import { fetchIngestDigest, generateIngestReadme } from "@/lib/api";
import { IngestDigest } from "@/lib/types";
import ErrorBanner from "@/components/ErrorBanner";
import AppNavbar from "@/components/AppNavbar";
import { BoxGridBackground } from "@/components/ui/box-grid-background";

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function IngestPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [excludeText, setExcludeText] = useState(
    "node_modules/*,*.lock,dist/*,build/*",
  );
  const [includeText, setIncludeText] = useState("");
  const [maxFileSize, setMaxFileSize] = useState(51200);
  const [isFetching, setIsFetching] = useState(false);
  const [isGeneratingReadme, setIsGeneratingReadme] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [digest, setDigest] = useState<IngestDigest | null>(null);
  const [readme, setReadme] = useState<string>("");
  const [copied, setCopied] = useState<string | null>(null);

  const applyPreset = (preset: "full" | "frontend" | "backend") => {
    if (preset === "full") {
      setIncludeText("");
      setExcludeText("node_modules/*,*.lock,dist/*,build/*,coverage/*");
      setMaxFileSize(51200);
      return;
    }

    if (preset === "frontend") {
      setIncludeText(
        "src/components/*,src/pages/*,src/lib/*,index.html,package.json,vite.config.ts,tailwind.config.js",
      );
      setExcludeText("node_modules/*,*.lock,dist/*,build/*,coverage/*");
      setMaxFileSize(51200);
      return;
    }

    setIncludeText(
      "src/routes/*,src/services/*,src/db/*,src/middleware/*,prisma/*,package.json,README.md",
    );
    setExcludeText("node_modules/*,*.lock,dist/*,build/*,coverage/*");
    setMaxFileSize(51200);
  };

  const copyToClipboard = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      setCopied(null);
    }
  };

  const ingestRepo = async () => {
    if (!repoUrl.trim()) return;
    setError(null);
    setIsFetching(true);

    const includePatterns = includeText
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const excludePatterns = excludeText
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const result = await fetchIngestDigest(repoUrl.trim(), {
      includePatterns: includePatterns.length ? includePatterns : undefined,
      excludePatterns: excludePatterns.length ? excludePatterns : undefined,
      maxFileSize,
    });

    if (!result.success) {
      setError(result.error);
      setIsFetching(false);
      return;
    }

    setDigest(result.digest);
    setIsFetching(false);
  };

  const createReadme = async () => {
    if (!repoUrl.trim()) return;
    setError(null);
    setIsGeneratingReadme(true);

    // Always regenerate digest server-side to avoid posting very large payloads.
    const result = await generateIngestReadme(repoUrl.trim());
    if (!result.success) {
      setError(result.error);
      setIsGeneratingReadme(false);
      return;
    }

    setDigest(result.digest);
    setReadme(result.readme);
    setIsGeneratingReadme(false);
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "#0b0b0b" }}
    >
      <BoxGridBackground className="z-0" />
      <main
        className="relative z-10 min-h-screen w-full px-4 pt-24 pb-8"
        style={{ background: "transparent" }}
      >
        <AppNavbar />
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-5xl"
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: "0.06em",
                }}
              >
                INGEST MODULE
              </h1>
              <p className="text-sm mt-1" style={{ color: "#9a9a9a" }}>
                Pull full repository digest with gitingest and generate a clean
                README.
              </p>
            </div>
          </div>

          {error && (
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          )}

          <section
            className="rounded-2xl p-6 space-y-4"
            style={{ background: "#171717", border: "2px solid #2a2a2a" }}
          >
            <div className="flex flex-wrap gap-2 items-center">
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: "#6f6f6f" }}
              >
                Presets
              </span>
              <button
                type="button"
                onClick={() => applyPreset("full")}
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  background: "#1f1f1f",
                  border: "1px solid #393939",
                  color: "#ddd",
                }}
              >
                Full Repo
              </button>
              <button
                type="button"
                onClick={() => applyPreset("frontend")}
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  background: "rgba(76,201,240,0.12)",
                  border: "1px solid rgba(76,201,240,0.35)",
                  color: "#4CC9F0",
                }}
              >
                Frontend Focus
              </button>
              <button
                type="button"
                onClick={() => applyPreset("backend")}
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  background: "rgba(107,203,119,0.12)",
                  border: "1px solid rgba(107,203,119,0.35)",
                  color: "#8FE09A",
                }}
              >
                Backend Focus
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="lg:col-span-2 px-4 py-3 rounded-xl"
                style={{
                  background: "#121212",
                  border: "1.5px solid #343434",
                  color: "#f0f0f0",
                }}
              />
              <input
                type="text"
                value={includeText}
                onChange={(e) => setIncludeText(e.target.value)}
                placeholder="Include: *.md,src/*"
                className="px-4 py-3 rounded-xl"
                style={{
                  background: "#121212",
                  border: "1.5px solid #343434",
                  color: "#f0f0f0",
                }}
              />
              <input
                type="text"
                value={excludeText}
                onChange={(e) => setExcludeText(e.target.value)}
                placeholder="Exclude: node_modules/*"
                className="px-4 py-3 rounded-xl"
                style={{
                  background: "#121212",
                  border: "1.5px solid #343434",
                  color: "#f0f0f0",
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs" style={{ color: "#8f8f8f" }}>
                Max file size (bytes)
              </label>
              <input
                type="number"
                min={1000}
                value={maxFileSize}
                onChange={(e) =>
                  setMaxFileSize(Number(e.target.value) || 51200)
                }
                className="w-36 px-3 py-2 rounded-lg"
                style={{
                  background: "#121212",
                  border: "1.5px solid #343434",
                  color: "#f0f0f0",
                }}
              />
              <button
                type="button"
                onClick={ingestRepo}
                disabled={isFetching}
                className="px-4 py-2 rounded-lg inline-flex items-center gap-2"
                style={{
                  background: "#FFD93D",
                  color: "#101010",
                  fontWeight: 700,
                }}
              >
                <UploadCloud size={14} />
                {isFetching ? "Ingesting..." : "Ingest"}
              </button>
              <button
                type="button"
                onClick={createReadme}
                disabled={isGeneratingReadme || !repoUrl.trim()}
                className="px-4 py-2 rounded-lg inline-flex items-center gap-2"
                style={{
                  background: "#4CC9F0",
                  color: "#101010",
                  fontWeight: 700,
                }}
              >
                <FileText size={14} />
                {isGeneratingReadme ? "Generating..." : "Generate README"}
              </button>
            </div>
          </section>

          {digest && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <article
                className="rounded-xl p-4"
                style={{ background: "#171717", border: "1px solid #2a2a2a" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2
                    className="text-xl"
                    style={{ fontFamily: "'Bebas Neue', cursive" }}
                  >
                    Summary
                  </h2>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() =>
                        downloadText(digest.summary, "ingest-summary.txt")
                      }
                      className="text-xs px-3 py-1 rounded-lg inline-flex items-center gap-1"
                      style={{
                        background: "#1f1f1f",
                        border: "1px solid #3a3a3a",
                        color: "#ccc",
                      }}
                    >
                      <Download size={12} /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("summary", digest.summary)}
                      className="text-xs px-3 py-1 rounded-lg inline-flex items-center gap-1"
                      style={{
                        background: "#1f1f1f",
                        border: "1px solid #3a3a3a",
                        color: "#ccc",
                      }}
                    >
                      {copied === "summary" ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}{" "}
                      {copied === "summary" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <pre
                  className="text-xs overflow-auto max-h-80 whitespace-pre-wrap"
                  style={{ color: "#ddd" }}
                >
                  {digest.summary}
                </pre>
              </article>

              <article
                className="rounded-xl p-4"
                style={{ background: "#171717", border: "1px solid #2a2a2a" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2
                    className="text-xl"
                    style={{ fontFamily: "'Bebas Neue', cursive" }}
                  >
                    Directory Structure
                  </h2>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() =>
                        downloadText(digest.tree, "ingest-tree.txt")
                      }
                      className="text-xs px-3 py-1 rounded-lg inline-flex items-center gap-1"
                      style={{
                        background: "#1f1f1f",
                        border: "1px solid #3a3a3a",
                        color: "#ccc",
                      }}
                    >
                      <Download size={12} /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("tree", digest.tree)}
                      className="text-xs px-3 py-1 rounded-lg inline-flex items-center gap-1"
                      style={{
                        background: "#1f1f1f",
                        border: "1px solid #3a3a3a",
                        color: "#ccc",
                      }}
                    >
                      {copied === "tree" ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}{" "}
                      {copied === "tree" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <pre
                  className="text-xs overflow-auto max-h-80 whitespace-pre"
                  style={{ color: "#ddd" }}
                >
                  {digest.tree}
                </pre>
              </article>

              <article
                className="rounded-xl p-4 lg:col-span-2"
                style={{ background: "#171717", border: "1px solid #2a2a2a" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2
                    className="text-xl inline-flex items-center gap-2"
                    style={{ fontFamily: "'Bebas Neue', cursive" }}
                  >
                    <Database size={18} /> Files Content
                  </h2>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() =>
                        downloadText(digest.content, "ingest-content.txt")
                      }
                      className="text-xs px-3 py-1 rounded-lg inline-flex items-center gap-1"
                      style={{
                        background: "#1f1f1f",
                        border: "1px solid #3a3a3a",
                        color: "#ccc",
                      }}
                    >
                      <Download size={12} /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("content", digest.content)}
                      className="text-xs px-3 py-1 rounded-lg inline-flex items-center gap-1"
                      style={{
                        background: "#1f1f1f",
                        border: "1px solid #3a3a3a",
                        color: "#ccc",
                      }}
                    >
                      {copied === "content" ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}{" "}
                      {copied === "content" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <pre
                  className="text-xs overflow-auto max-h-[480px] whitespace-pre-wrap"
                  style={{ color: "#ddd" }}
                >
                  {digest.content}
                </pre>
              </article>
            </section>
          )}

          {readme && (
            <section
              className="rounded-xl p-4"
              style={{ background: "#171717", border: "1px solid #2a2a2a" }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2
                  className="text-xl"
                  style={{ fontFamily: "'Bebas Neue', cursive" }}
                >
                  Generated README
                </h2>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => downloadText(readme, "README.md")}
                    className="text-xs px-3 py-1 rounded-lg inline-flex items-center gap-1"
                    style={{
                      background: "rgba(76,201,240,0.12)",
                      border: "1px solid rgba(76,201,240,0.35)",
                      color: "#4CC9F0",
                    }}
                  >
                    <Download size={12} /> Download
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("readme", readme)}
                    className="text-xs px-3 py-1 rounded-lg inline-flex items-center gap-1"
                    style={{
                      background: "#1f1f1f",
                      border: "1px solid #3a3a3a",
                      color: "#ccc",
                    }}
                  >
                    {copied === "readme" ? (
                      <Check size={12} />
                    ) : (
                      <Copy size={12} />
                    )}{" "}
                    {copied === "readme" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {readme}
                </ReactMarkdown>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
