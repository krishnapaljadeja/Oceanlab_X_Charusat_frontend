/**
 * Splits a long text string into readable paragraphs.
 *
 * Priority:
 *  1. Natural paragraph breaks (\n\n) – used when the model includes them
 *  2. Sentence-boundary grouping – fallback for single-blob text, groups
 *     every `sentencesPerGroup` sentences into one paragraph.
 */
export function toParas(text: string, sentencesPerGroup = 3): string[] {
  if (!text?.trim()) return [];

  const naturalParas = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  if (naturalParas.length > 1) return naturalParas.map((p) => p.trim());

  // No double-newlines – split on sentence endings and regroup
  const sentences = text.match(/[^.!?]+[.!?]+["']?\s*/g) ?? [text];
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += sentencesPerGroup) {
    const chunk = sentences
      .slice(i, i + sentencesPerGroup)
      .join("")
      .trim();
    if (chunk) out.push(chunk);
  }
  return out.length ? out : [text.trim()];
}
