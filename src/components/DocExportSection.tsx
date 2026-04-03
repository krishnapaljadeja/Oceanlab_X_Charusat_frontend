import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { generateDocs } from "@/lib/api";
import { GeneratedDocs } from "@/lib/types";
import ErrorBanner from "@/components/ErrorBanner";

interface DocExportSectionProps {
  repoUrl: string;
}

function downloadMd(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DocExportSection({ repoUrl }: DocExportSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [docs, setDocs] = useState<GeneratedDocs | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (isGenerating || docs) return;

    setIsGenerating(true);
    setError(null);
    const result = await generateDocs(repoUrl);

    if (!result.success) {
      setError(result.error);
      setIsGenerating(false);
      return;
    }

    setDocs(result.docs);
    setIsGenerating(false);
  };

  return (
    <section
      className="rounded-xl p-6 space-y-4"
      style={{ background: "#171717", border: "2px solid #2a2a2a" }}
    >
      <div>
        <h3
          className="text-3xl"
          style={{ fontFamily: "'Bebas Neue', cursive" }}
        >
          Export README
        </h3>
        <p className="text-sm mt-1" style={{ color: "#9a9a9a" }}>
          Generate a production-ready README from your repository
        </p>
      </div>

      {error && (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || Boolean(docs)}
        className="px-5 py-2 rounded-lg text-sm font-semibold"
        style={{
          background: isGenerating || docs ? "#2a2a2a" : "#FFD93D",
          color: isGenerating || docs ? "#808080" : "#111",
          cursor: isGenerating || docs ? "not-allowed" : "pointer",
        }}
      >
        {isGenerating ? "Generating..." : "Generate Docs"}
      </button>

      {docs && (
        <article
          className="rounded-xl p-4"
          style={{ background: "#131313", border: "1px solid #2d2d2d" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4
              className="text-lg"
              style={{ fontFamily: "'Bebas Neue', cursive" }}
            >
              README.md
            </h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPreview((prev) => !prev)}
                className="px-3 py-1 rounded text-xs"
                style={{
                  background: "#1d1d1d",
                  border: "1px solid #3a3a3a",
                  color: "#c5c5c5",
                }}
              >
                {showPreview ? "Hide Preview" : "Preview"}
              </button>
              <button
                type="button"
                onClick={() => downloadMd(docs.readme, "README.md")}
                className="px-3 py-1 rounded text-xs"
                style={{
                  background: "rgba(76,201,240,0.12)",
                  border: "1px solid rgba(76,201,240,0.35)",
                  color: "#4CC9F0",
                }}
              >
                Download
              </button>
            </div>
          </div>

          {showPreview && (
            <div className="mt-4 prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {docs.readme}
              </ReactMarkdown>
            </div>
          )}
        </article>
      )}
    </section>
  );
}
