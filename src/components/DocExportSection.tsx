import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import { generateDocs } from "@/lib/api";
import { GeneratedDocs } from "@/lib/types";
import ErrorBanner from "@/components/ErrorBanner";

interface DocExportSectionProps {
  repoUrl: string;
}

type PreviewType = "readme" | "architecture" | "systemflow" | null;

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
  const [activePreview, setActivePreview] = useState<PreviewType>(null);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activePreview !== "systemflow") return;
    if (!previewRef.current) return;

    mermaid.initialize({ startOnLoad: false, theme: "dark" });

    const blocks = previewRef.current.querySelectorAll(
      "pre > code.language-mermaid",
    );
    blocks.forEach((block, index) => {
      const source = block.textContent || "";
      const pre = block.parentElement;
      if (!pre || !source.trim()) return;

      const id = `mermaid-${Date.now()}-${index}`;
      mermaid
        .render(id, source)
        .then(({ svg }) => {
          pre.outerHTML = `<div class=\"mermaid-render\">${svg}</div>`;
        })
        .catch(() => {
          // Keep markdown code block as fallback when render fails.
        });
    });
  }, [activePreview, docs]);

  const cards = useMemo(
    () => [
      {
        id: "readme" as const,
        title: "README.md",
        filename: "README.md",
        content: docs?.readme || "",
      },
      {
        id: "architecture" as const,
        title: "ARCHITECTURE.md",
        filename: "ARCHITECTURE.md",
        content: docs?.architectureDoc || "",
      },
      {
        id: "systemflow" as const,
        title: "SYSTEM_FLOW.md",
        filename: "SYSTEM_FLOW.md",
        content: docs?.systemFlowDoc || "",
      },
    ],
    [docs],
  );

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
          Export Documentation
        </h3>
        <p className="text-sm mt-1" style={{ color: "#9a9a9a" }}>
          Generate production-ready docs from your repository analysis
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
        <div className="grid grid-cols-1 gap-4">
          {cards.map((card) => {
            const isOpen = activePreview === card.id;
            return (
              <article
                key={card.id}
                className="rounded-xl p-4"
                style={{ background: "#131313", border: "1px solid #2d2d2d" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4
                    className="text-lg"
                    style={{ fontFamily: "'Bebas Neue', cursive" }}
                  >
                    {card.title}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePreview(isOpen ? null : card.id)}
                      className="px-3 py-1 rounded text-xs"
                      style={{
                        background: "#1d1d1d",
                        border: "1px solid #3a3a3a",
                        color: "#c5c5c5",
                      }}
                    >
                      {isOpen ? "Hide Preview" : "Preview"}
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadMd(card.content, card.filename)}
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

                {isOpen && (
                  <div
                    ref={card.id === "systemflow" ? previewRef : undefined}
                    className="mt-4 prose prose-invert max-w-none"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {card.content}
                    </ReactMarkdown>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
