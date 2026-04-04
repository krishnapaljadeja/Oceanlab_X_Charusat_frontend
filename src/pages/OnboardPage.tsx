import { useState } from "react";
import {
  BookOpen,
  Clipboard,
  ClipboardCheck,
  Download,
  Sparkles,
  FolderTree,
  Users,
  Rocket,
  Workflow,
  Activity,
  AlertTriangle,
  FileText,
} from "lucide-react";
import AppNavbar from "@/components/AppNavbar";
import ErrorBanner from "@/components/ErrorBanner";
import { BoxGridBackground } from "@/components/ui/box-grid-background";
import { generateOnboardingGuide } from "@/lib/api";

interface GuideSection {
  heading: string;
  body: string;
}

const KNOWN_HEADINGS = [
  "What this project is",
  "How the codebase is organised",
  "Where to start reading",
  "Who to talk to about what",
  "How the team works",
  "What is actively being worked on",
  "Things to know before you start",
];

function normalizeHeading(line: string): string {
  return line
    .replace(/^#+\s*/, "")
    .replace(/^[0-9]+\.\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/\s*:\s*$/, "")
    .trim()
    .toLowerCase();
}

function parseGuide(raw: string): {
  title: string;
  tagline: string;
  sections: GuideSection[];
} {
  const lines = raw.split("\n").map((line) => line.trimEnd());
  const nonEmpty = lines.map((line) => line.trim()).filter(Boolean);

  const titleLine =
    nonEmpty.find((line) => line.startsWith("# ")) ||
    nonEmpty.find((line) => /onboarding guide/i.test(line)) ||
    "# Onboarding guide";

  const taglineLine =
    nonEmpty.find((line) => line.startsWith(">")) || nonEmpty[1] || "";

  const sections: GuideSection[] = [];
  let currentHeading = "";
  let currentBody: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (currentBody.length > 0) currentBody.push("");
      continue;
    }

    const normalized = normalizeHeading(line);
    const matchedHeading = KNOWN_HEADINGS.find(
      (heading) => normalizeHeading(heading) === normalized,
    );

    if (matchedHeading) {
      if (currentHeading) {
        sections.push({
          heading: currentHeading,
          body: currentBody.join("\n").trim(),
        });
      }
      currentHeading = matchedHeading;
      currentBody = [];
      continue;
    }

    if (line === titleLine || line === taglineLine) continue;
    currentBody.push(line);
  }

  if (currentHeading) {
    sections.push({
      heading: currentHeading,
      body: currentBody.join("\n").trim(),
    });
  }

  if (sections.length === 0) {
    sections.push({
      heading: "Guide",
      body: raw.trim(),
    });
  }

  return {
    title: titleLine.replace(/^#\s*/, "").trim(),
    tagline: taglineLine.replace(/^>\s*/, "").trim(),
    sections,
  };
}

function shouldRenderAsList(heading: string): boolean {
  return [
    "How the codebase is organised",
    "Where to start reading",
    "Who to talk to about what",
    "Things to know before you start",
  ].includes(heading);
}

function getSectionIcon(heading: string) {
  switch (heading) {
    case "What this project is":
      return FileText;
    case "How the codebase is organised":
      return FolderTree;
    case "Where to start reading":
      return Rocket;
    case "Who to talk to about what":
      return Users;
    case "How the team works":
      return Workflow;
    case "What is actively being worked on":
      return Activity;
    case "Things to know before you start":
      return AlertTriangle;
    default:
      return BookOpen;
  }
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OnboardPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [roleHint, setRoleHint] = useState("");
  const [guide, setGuide] = useState("");
  const [repoFullName, setRepoFullName] = useState("");
  const [generatedAt, setGeneratedAt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const parsedGuide = guide ? parseGuide(guide) : null;

  const handleGenerate = async () => {
    if (!repoUrl.trim()) return;

    setError(null);
    setIsLoading(true);

    const result = await generateOnboardingGuide(repoUrl.trim(), {
      roleHint: roleHint.trim() || undefined,
    });

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setGuide(result.guide);
    setRepoFullName(result.repoFullName);
    setGeneratedAt(result.generatedAt);
    setCopied(false);
    setIsLoading(false);
  };

  const copyGuide = async () => {
    if (!guide) return;
    try {
      await navigator.clipboard.writeText(guide);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "#0b0b0b" }}
    >
      <BoxGridBackground className="z-0" />
      <main className="relative z-10 min-h-screen w-full px-4 pt-24 pb-8">
        <AppNavbar />

        <div className="max-w-6xl mx-auto space-y-6">
          <section className="space-y-2">
            <h1
              className="text-5xl"
              style={{
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "0.06em",
              }}
            >
              ONBOARD MODULE
            </h1>
            <p className="text-sm" style={{ color: "#9a9a9a" }}>
              Generate a new-contributor onboarding guide using stored analysis
              and RAG context.
            </p>
          </section>

          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          <section
            className="rounded-2xl p-6 space-y-4"
            style={{ background: "#171717", border: "2px solid #2a2a2a" }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
                value={roleHint}
                onChange={(e) => setRoleHint(e.target.value)}
                placeholder="Role hint (optional): frontend developer"
                className="px-4 py-3 rounded-xl"
                style={{
                  background: "#121212",
                  border: "1.5px solid #343434",
                  color: "#f0f0f0",
                }}
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || !repoUrl.trim()}
                className="px-4 py-2 rounded-lg inline-flex items-center gap-2"
                style={{
                  background: "#FFD93D",
                  color: "#101010",
                  fontWeight: 700,
                }}
              >
                <Sparkles size={14} />
                {isLoading ? "Generating..." : "Generate Guide"}
              </button>

              <button
                type="button"
                onClick={copyGuide}
                disabled={!guide}
                className="px-4 py-2 rounded-lg inline-flex items-center gap-2"
                style={{
                  background: "#1f1f1f",
                  border: "1px solid #3a3a3a",
                  color: guide ? "#d3d3d3" : "#7a7a7a",
                }}
              >
                {copied ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
                {copied ? "Copied" : "Copy Markdown"}
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadText(
                    guide,
                    `${(repoFullName || "onboarding-guide").replace("/", "-")}.md`,
                  )
                }
                disabled={!guide}
                className="px-4 py-2 rounded-lg inline-flex items-center gap-2"
                style={{
                  background: "#1f1f1f",
                  border: "1px solid #3a3a3a",
                  color: guide ? "#d3d3d3" : "#7a7a7a",
                }}
              >
                <Download size={14} />
                Download
              </button>
            </div>
          </section>

          <section
            className="rounded-2xl p-6"
            style={{ background: "#141414", border: "1px solid #2a2a2a" }}
          >
            {!guide && (
              <div className="py-12 text-center" style={{ color: "#8a8a8a" }}>
                <BookOpen className="mx-auto mb-3 opacity-60" size={24} />
                Your generated onboarding guide will appear here.
              </div>
            )}

            {guide && (
              <>
                <div className="mb-4 text-xs" style={{ color: "#8a8a8a" }}>
                  <span>Repository: {repoFullName}</span>
                  <span className="mx-2">•</span>
                  <span>Generated: {new Date(generatedAt).toLocaleString()}</span>
                </div>

                {parsedGuide && (
                  <article className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <section
                      className="rounded-2xl p-5"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,217,61,0.12), rgba(76,201,240,0.08))",
                        border: "1px solid rgba(255,217,61,0.35)",
                      }}
                    >
                      <h2 className="text-2xl font-semibold" style={{ color: "#fff3b3" }}>
                        {parsedGuide.title}
                      </h2>
                      {parsedGuide.tagline && (
                        <p className="mt-2 text-sm leading-relaxed" style={{ color: "#d3d3d3" }}>
                          {parsedGuide.tagline}
                        </p>
                      )}
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {parsedGuide.sections.map((section) => {
                        const SectionIcon = getSectionIcon(section.heading);
                        const lines = section.body
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean);
                        const asList = shouldRenderAsList(section.heading);

                        return (
                          <section
                            key={section.heading}
                            className="rounded-xl p-5"
                            style={{
                              background: "#101010",
                              border: "1px solid #2f2f2f",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <SectionIcon size={16} style={{ color: "#4CC9F0" }} />
                              <h3
                                className="text-base uppercase tracking-wider"
                                style={{
                                  color: "#FFD93D",
                                  fontFamily: "'Bebas Neue', cursive",
                                  letterSpacing: "0.06em",
                                }}
                              >
                                {section.heading}
                              </h3>
                            </div>

                            {asList ? (
                              <ul className="mt-3 space-y-2">
                                {lines.map((line, idx) => (
                                  <li
                                    key={`${section.heading}-${idx}`}
                                    className="flex items-start gap-2 text-sm leading-relaxed"
                                    style={{ color: "#e2e2e2" }}
                                  >
                                    <span
                                      className="mt-1.5 h-1.5 w-1.5 rounded-full"
                                      style={{ background: "#4CC9F0", flex: "0 0 6px" }}
                                    />
                                    <span>{line.replace(/^[-*•]\s*/, "")}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="mt-3 space-y-2">
                                {lines.map((line, idx) => (
                                  <p
                                    key={`${section.heading}-${idx}`}
                                    className="text-sm leading-relaxed"
                                    style={{ color: "#d8d8d8" }}
                                  >
                                    {line}
                                  </p>
                                ))}
                              </div>
                            )}
                          </section>
                        );
                      })}
                    </div>
                  </article>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
