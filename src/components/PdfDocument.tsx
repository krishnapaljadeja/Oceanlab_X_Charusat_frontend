/**
 * PdfDocument.tsx
 * Uses @react-pdf/renderer to produce a properly-formatted PDF.
 * NOTE: This file is only ever imported via a dynamic client-side import,
 * so it won't execute until needed.
 */
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { AnalysisResponse } from "@/lib/types";
import { toParas } from "@/lib/utils";

Font.registerHyphenationCallback((word) => [word]); // disable hyphenation

// ─── Accent palette ────────────────────────────────────────────────────────────
const A = {
  yellow: "#F5C518",
  cyan: "#4CC9F0",
  pink: "#FF6B9D",
  green: "#6BCB77",
  orange: "#FF8C42",
  purple: "#c084fc",
  dark: "#0f1117",
  card: "#1c1f2a",
  border: "#2d3048",
  muted: "#8892a4",
  text: "#e2e8f0",
  subtext: "#94a3b8",
};

const CHAPTER_COLORS = [A.yellow, A.cyan, A.pink, A.green, A.orange];

const s = StyleSheet.create({
  // ─── Page ───────────────────────────────────────────────────────────────────
  page: {
    backgroundColor: A.dark,
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: A.text,
  },
  pageInner: { paddingHorizontal: 40 },

  // ─── Cover ──────────────────────────────────────────────────────────────────
  coverPage: {
    backgroundColor: A.dark,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  coverTop: {
    backgroundColor: "#12151f",
    paddingHorizontal: 40,
    paddingTop: 60,
    paddingBottom: 50,
    borderBottomWidth: 3,
    borderBottomColor: A.yellow,
  },
  coverTag: {
    fontSize: 9,
    letterSpacing: 3,
    color: A.yellow,
    textTransform: "uppercase",
    marginBottom: 14,
    fontFamily: "Helvetica-Bold",
  },
  coverTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 44,
    color: "#ffffff",
    lineHeight: 1.1,
    marginBottom: 10,
  },
  coverFullName: {
    fontFamily: "Helvetica",
    fontSize: 13,
    color: A.muted,
    marginBottom: 24,
  },
  coverDesc: {
    fontSize: 11,
    color: A.subtext,
    lineHeight: 1.6,
    maxWidth: 440,
    marginBottom: 32,
  },
  pillRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e2233",
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: A.border,
  },
  pillLabel: { fontSize: 8, color: A.muted, marginRight: 4 },
  pillValue: { fontSize: 9, color: A.text, fontFamily: "Helvetica-Bold" },

  coverBottom: {
    paddingHorizontal: 40,
    paddingTop: 36,
  },
  coverOverviewTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 2.5,
    color: A.yellow,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  coverOverviewText: {
    fontSize: 11,
    color: A.subtext,
    lineHeight: 1.65,
    maxWidth: 480,
  },

  // ─── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 16,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: A.border,
    paddingTop: 8,
  },
  footerLeft: { fontSize: 8, color: "#3d4466" },
  footerRight: { fontSize: 8, color: "#3d4466" },

  // ─── Section header ─────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  sectionNumber: {
    width: 26,
    height: 26,
    borderRadius: 4,
    backgroundColor: A.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionNumberText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#000",
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    color: "#ffffff",
    letterSpacing: 1,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: A.border,
    marginBottom: 18,
  },

  // ─── Cards & blocks ─────────────────────────────────────────────────────────
  card: {
    backgroundColor: A.card,
    borderRadius: 6,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: A.border,
  },
  cardTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#ffffff",
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 8,
    color: A.muted,
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 9.5,
    color: A.subtext,
    lineHeight: 1.55,
  },

  // Chapter-specific
  chapterCard: {
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: A.border,
    backgroundColor: A.card,
  },
  chapterMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chapterNum: {
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  chapterPeriod: {
    fontSize: 8,
    color: A.muted,
    backgroundColor: "#1e2233",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  chapterTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#ffffff",
    marginBottom: 8,
  },
  chapterBody: {
    fontSize: 9.5,
    color: A.subtext,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  keyEventsLabel: {
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  keyEventRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  keyEventBullet: { fontSize: 9, marginRight: 5, width: 8 },
  keyEventText: { fontSize: 9, color: "#8892a4", flex: 1, lineHeight: 1.45 },

  // ─── Phases table ───────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e2233",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#1e2233",
  },
  tableRowAlt: {
    backgroundColor: "#171a26",
  },
  th: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: A.muted,
    letterSpacing: 1,
  },
  td: { fontSize: 9, color: A.subtext },
  c1: { width: "28%" },
  c2: { width: "20%" },
  c3: { width: "14%" },
  c4: { width: "14%" },
  c5: { width: "24%" },

  velocityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },

  // ─── Milestones ─────────────────────────────────────────────────────────────
  milestoneRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-start",
  },
  milestoneLine: {
    width: 2,
    backgroundColor: A.yellow,
    marginRight: 12,
    borderRadius: 1,
    minHeight: 36,
  },
  milestoneDate: {
    fontSize: 8,
    color: A.yellow,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  milestoneTitle: {
    fontSize: 10,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  milestoneSig: { fontSize: 9, color: A.subtext, lineHeight: 1.45 },

  // ─── Contributors ───────────────────────────────────────────────────────────
  contribGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  contribCard: {
    width: "31%",
    marginRight: "2%",
    marginBottom: 10,
    backgroundColor: A.card,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: A.border,
  },
  contribInitial: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  contribInitialText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: "#000",
  },
  contribName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#fff",
    marginBottom: 2,
  },
  contribLogin: { fontSize: 8, color: A.muted, marginBottom: 4 },
  contribStat: { fontSize: 8, color: A.subtext },

  // ─── Stats row ───────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    backgroundColor: A.card,
    borderRadius: 6,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: A.border,
    alignItems: "center",
  },
  statValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    color: "#fff",
    marginBottom: 2,
  },
  statLabel: { fontSize: 8, color: A.muted, textAlign: "center" },

  // ─── Commit type breakdown ───────────────────────────────────────────────────
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  breakdownLabel: { fontSize: 9, color: A.subtext, width: 70 },
  breakdownBar: { height: 8, borderRadius: 4, marginHorizontal: 8 },
  breakdownCount: { fontSize: 9, color: A.muted },

  // ─── Observations & current state ────────────────────────────────────────────
  quoteBlock: {
    borderLeftWidth: 3,
    borderLeftColor: A.purple,
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: "#16192a",
    borderRadius: 4,
  },
  quoteText: { fontSize: 10, color: A.subtext, lineHeight: 1.65 },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function velocityColor(v: string) {
  if (v === "high") return A.green;
  if (v === "medium") return A.yellow;
  return A.orange;
}

function contribColor(i: number) {
  return [A.yellow, A.cyan, A.pink, A.green, A.orange][i % 5];
}

const TYPE_COLORS: Record<string, string> = {
  feat: A.cyan,
  fix: A.orange,
  refactor: A.purple,
  test: A.green,
  docs: A.yellow,
  infra: A.pink,
  deps: "#94a3b8",
};

function PageFooter({ repoName }: { repoName: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerLeft}>Git History Teller — {repoName}</Text>
      <Text
        style={s.footerRight}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

// ─── Main Document ────────────────────────────────────────────────────────────

export default function PdfDocument({ data }: { data: AnalysisResponse }) {
  const { repoMeta, summary, narrative } = data;
  const maxBreakdown = Math.max(
    ...Object.values(summary.commitTypeBreakdown).filter((v) => v > 0),
    1,
  );

  const commitTypeEntries = Object.entries(summary.commitTypeBreakdown)
    .filter(([type, v]) => type !== "unknown" && v > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <Document
      title={`${repoMeta.fullName} — Git History`}
      author="Git History Teller"
      subject="Repository Analysis Report"
    >
      {/* ═══════════════════ PAGE 1: COVER ═══════════════════ */}
      <Page size="A4" style={s.page}>
        <View style={s.coverTop}>
          <Text style={s.coverTag}>Git History Teller · Repository Report</Text>
          <Text style={s.coverTitle}>{repoMeta.name.toUpperCase()}</Text>
          <Text style={s.coverFullName}>{repoMeta.fullName}</Text>
          {repoMeta.description ? (
            <Text style={s.coverDesc}>{repoMeta.description}</Text>
          ) : null}

          {/* Stat pills */}
          <View style={s.pillRow}>
            {[
              { l: "Stars", v: repoMeta.stars.toLocaleString() },
              { l: "Forks", v: repoMeta.forks.toLocaleString() },
              {
                l: "Language",
                v: repoMeta.language ?? "Mixed",
              },
              {
                l: "Commits analysed",
                v: summary.analyzedCommitCount.toLocaleString(),
              },
              {
                l: "Contributors",
                v: summary.topContributors.length.toString(),
              },
              {
                l: "Date range",
                v: `${fmt(summary.dateRange.first)} → ${fmt(summary.dateRange.last)}`,
              },
            ].map(({ l, v }) => (
              <View key={l} style={s.pill}>
                <Text style={s.pillLabel}>{l}:</Text>
                <Text style={s.pillValue}>{v}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Project overview on the cover */}
        {narrative.projectOverview ? (
          <View style={[s.coverBottom, s.pageInner]}>
            <Text style={s.coverOverviewTitle}>Project Overview</Text>
            <Text style={s.coverOverviewText}>{narrative.projectOverview}</Text>
          </View>
        ) : null}

        <PageFooter repoName={repoMeta.fullName} />
      </Page>

      {/* ═══════════════════ PAGE 2: THE STORY ═══════════════════ */}
      <Page size="A4" style={s.page}>
        <View style={s.pageInner}>
          <View style={{ height: 32 }} />
          <View style={s.sectionHeader}>
            <View style={s.sectionNumber}>
              <Text style={s.sectionNumberText}>1</Text>
            </View>
            <Text style={s.sectionTitle}>THE STORY</Text>
          </View>
          <View style={s.divider} />

          {narrative.narrativeChapters.map((ch, i) => {
            const color = CHAPTER_COLORS[i % CHAPTER_COLORS.length];
            const paras = toParas(ch.story);
            return (
              <View
                key={i}
                style={[
                  s.chapterCard,
                  { borderTopWidth: 3, borderTopColor: color },
                ]}
              >
                <View style={s.chapterMeta}>
                  <Text style={[s.chapterNum, { color }]}>Chapter {i + 1}</Text>
                  <Text style={s.chapterPeriod}>{ch.period}</Text>
                </View>
                <Text style={s.chapterTitle}>{ch.title}</Text>
                {paras.map((p, pi) => (
                  <Text
                    key={pi}
                    style={[s.chapterBody, pi > 0 ? { marginTop: 5 } : {}]}
                  >
                    {p}
                  </Text>
                ))}
                {ch.keyEvents.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={[s.keyEventsLabel, { color }]}>
                      Key Events
                    </Text>
                    {ch.keyEvents.map((ev, ei) => (
                      <View key={ei} style={s.keyEventRow}>
                        <Text style={[s.keyEventBullet, { color }]}>▸</Text>
                        <Text style={s.keyEventText}>{ev}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <PageFooter repoName={repoMeta.fullName} />
      </Page>

      {/* ═══════════════════ PAGE 3: PHASES ═══════════════════ */}
      {summary.phases.length > 0 && (
        <Page size="A4" style={s.page}>
          <View style={s.pageInner}>
            <View style={{ height: 32 }} />
            <View style={s.sectionHeader}>
              <View style={[s.sectionNumber, { backgroundColor: A.cyan }]}>
                <Text style={s.sectionNumberText}>2</Text>
              </View>
              <Text style={s.sectionTitle}>DEVELOPMENT PHASES</Text>
            </View>
            <View style={s.divider} />

            {/* Table */}
            <View style={s.tableHeader}>
              <Text style={[s.th, s.c1]}>PHASE</Text>
              <Text style={[s.th, s.c2]}>PERIOD</Text>
              <Text style={[s.th, s.c3]}>COMMITS</Text>
              <Text style={[s.th, s.c4]}>VELOCITY</Text>
              <Text style={[s.th, s.c5]}>TOP CONTRIBUTORS</Text>
            </View>
            {summary.phases.map((ph, i) => (
              <View
                key={i}
                style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
              >
                <View
                  style={[s.c1, { flexDirection: "row", alignItems: "center" }]}
                >
                  <View
                    style={[
                      s.velocityDot,
                      { backgroundColor: velocityColor(ph.velocity) },
                    ]}
                  />
                  <Text style={[s.td, { flex: 1 }]}>{ph.label}</Text>
                </View>
                <Text style={[s.td, s.c2]}>{fmt(ph.startDate)}</Text>
                <Text style={[s.td, s.c3]}>{ph.commitCount}</Text>
                <Text
                  style={[
                    s.td,
                    s.c4,
                    {
                      color: velocityColor(ph.velocity),
                      fontFamily: "Helvetica-Bold",
                    },
                  ]}
                >
                  {ph.velocity.toUpperCase()}
                </Text>
                <Text style={[s.td, s.c5]}>
                  {ph.contributors.slice(0, 3).join(", ")}
                </Text>
              </View>
            ))}
            <View style={{ height: 24 }} />

            {/* Commit type breakdown */}
            <View style={s.sectionHeader}>
              <View style={[s.sectionNumber, { backgroundColor: A.orange }]}>
                <Text style={s.sectionNumberText}>↗</Text>
              </View>
              <Text style={s.sectionTitle}>COMMIT TYPE BREAKDOWN</Text>
            </View>
            <View style={s.divider} />
            <View style={s.card}>
              {commitTypeEntries.map(([type, count]) => {
                const barWidth = Math.max(
                  4,
                  Math.round((count / maxBreakdown) * 220),
                );
                const color = TYPE_COLORS[type] ?? A.muted;
                return (
                  <View key={type} style={s.breakdownRow}>
                    <Text style={s.breakdownLabel}>{type.toUpperCase()}</Text>
                    <View
                      style={[
                        s.breakdownBar,
                        { width: barWidth, backgroundColor: color },
                      ]}
                    />
                    <Text style={s.breakdownCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
          <PageFooter repoName={repoMeta.fullName} />
        </Page>
      )}

      {/* ═══════════════════ PAGE 4: MILESTONES ═══════════════════ */}
      {(narrative.milestoneHighlights.length > 0 ||
        summary.milestones.length > 0) && (
        <Page size="A4" style={s.page}>
          <View style={s.pageInner}>
            <View style={{ height: 32 }} />
            <View style={s.sectionHeader}>
              <View style={[s.sectionNumber, { backgroundColor: A.green }]}>
                <Text style={s.sectionNumberText}>3</Text>
              </View>
              <Text style={s.sectionTitle}>KEY MILESTONES</Text>
            </View>
            <View style={s.divider} />
            {narrative.milestoneHighlights.map((ml, i) => (
              <View key={i} style={s.milestoneRow}>
                <View style={s.milestoneLine} />
                <View style={{ flex: 1 }}>
                  <Text style={s.milestoneDate}>{fmt(ml.date)}</Text>
                  <Text style={s.milestoneTitle}>{ml.title}</Text>
                  <Text style={s.milestoneSig}>{ml.significance}</Text>
                </View>
              </View>
            ))}
          </View>
          <PageFooter repoName={repoMeta.fullName} />
        </Page>
      )}

      {/* ═══════════════════ PAGE 5: CONTRIBUTORS ═══════════════════ */}
      <Page size="A4" style={s.page}>
        <View style={s.pageInner}>
          <View style={{ height: 32 }} />
          <View style={s.sectionHeader}>
            <View style={[s.sectionNumber, { backgroundColor: A.pink }]}>
              <Text style={s.sectionNumberText}>4</Text>
            </View>
            <Text style={s.sectionTitle}>CONTRIBUTORS</Text>
          </View>
          <View style={s.divider} />

          {/* Insights */}
          {narrative.contributorInsights && (
            <View
              style={[
                s.quoteBlock,
                { borderLeftColor: A.cyan, marginBottom: 18 },
              ]}
            >
              {toParas(narrative.contributorInsights).map((p, i) => (
                <Text
                  key={i}
                  style={[s.quoteText, i > 0 ? { marginTop: 6 } : {}]}
                >
                  {p}
                </Text>
              ))}
            </View>
          )}

          {/* Contributor cards grid */}
          <View style={s.contribGrid}>
            {summary.topContributors.slice(0, 9).map((c, i) => {
              const color = contribColor(i);
              return (
                <View
                  key={c.login}
                  style={[
                    s.contribCard,
                    { borderTopWidth: 3, borderTopColor: color },
                  ]}
                >
                  <View style={[s.contribInitial, { backgroundColor: color }]}>
                    <Text style={s.contribInitialText}>
                      {c.login.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={s.contribName}>{c.name}</Text>
                  <Text style={s.contribLogin}>@{c.login}</Text>
                  <Text style={s.contribStat}>{c.commitCount} commits</Text>
                  {c.primaryAreas.length > 0 && (
                    <Text style={[s.contribStat, { marginTop: 2 }]}>
                      {c.primaryAreas.slice(0, 2).join(", ")}
                    </Text>
                  )}
                  <Text
                    style={[s.contribStat, { marginTop: 2, color: A.muted }]}
                  >
                    Last: {fmt(c.lastCommitDate)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        <PageFooter repoName={repoMeta.fullName} />
      </Page>

      {/* ═══════════════════ PAGE 6: ARCHITECTURE & CURRENT STATE ═══════════════════ */}
      <Page size="A4" style={s.page}>
        <View style={s.pageInner}>
          <View style={{ height: 32 }} />
          <View style={s.sectionHeader}>
            <View style={[s.sectionNumber, { backgroundColor: A.purple }]}>
              <Text style={s.sectionNumberText}>5</Text>
            </View>
            <Text style={s.sectionTitle}>ARCHITECTURAL OBSERVATIONS</Text>
          </View>
          <View style={s.divider} />
          {narrative.architecturalObservations ? (
            <View style={[s.quoteBlock, { borderLeftColor: A.purple }]}>
              {toParas(narrative.architecturalObservations).map((p, i) => (
                <Text
                  key={i}
                  style={[s.quoteText, i > 0 ? { marginTop: 6 } : {}]}
                >
                  {p}
                </Text>
              ))}
            </View>
          ) : null}

          <View style={{ height: 24 }} />
          <View style={s.sectionHeader}>
            <View style={[s.sectionNumber, { backgroundColor: A.green }]}>
              <Text style={s.sectionNumberText}>6</Text>
            </View>
            <Text style={s.sectionTitle}>CURRENT STATE</Text>
          </View>
          <View style={s.divider} />
          {narrative.currentState ? (
            <View style={[s.quoteBlock, { borderLeftColor: A.green }]}>
              {toParas(narrative.currentState).map((p, i) => (
                <Text
                  key={i}
                  style={[s.quoteText, i > 0 ? { marginTop: 6 } : {}]}
                >
                  {p}
                </Text>
              ))}
            </View>
          ) : null}

          {/* Data confidence note */}
          {narrative.dataConfidenceNote && (
            <View
              style={{
                marginTop: 24,
                padding: 10,
                backgroundColor: "#1e2233",
                borderRadius: 4,
                borderWidth: 1,
                borderColor: A.border,
              }}
            >
              <Text
                style={{
                  fontSize: 8,
                  color: A.muted,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 4,
                  fontFamily: "Helvetica-Bold",
                }}
              >
                Data Confidence
              </Text>
              <Text style={{ fontSize: 9, color: A.subtext, lineHeight: 1.55 }}>
                {narrative.dataConfidenceNote}
              </Text>
            </View>
          )}

          {/* Stats summary row */}
          <View style={{ height: 30 }} />
          <View style={s.statsRow}>
            {[
              {
                label: "Commits analysed",
                value: summary.analyzedCommitCount.toLocaleString(),
                color: A.yellow,
              },
              {
                label: "Contributors",
                value: summary.topContributors.length.toString(),
                color: A.cyan,
              },
              {
                label: "Milestones",
                value: summary.milestones.length.toString(),
                color: A.pink,
              },
              {
                label: "Quality score",
                value: `${summary.commitQualityScore}/10`,
                color: A.green,
              },
            ].map(({ label, value, color }) => (
              <View
                key={label}
                style={[
                  s.statBox,
                  { borderTopWidth: 3, borderTopColor: color },
                ]}
              >
                <Text style={[s.statValue, { color }]}>{value}</Text>
                <Text style={s.statLabel}>{label.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>
        <PageFooter repoName={repoMeta.fullName} />
      </Page>
    </Document>
  );
}
