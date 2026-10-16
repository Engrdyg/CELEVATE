/** Near-duplicate detection for question stems. */

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/\$[^$]*\$/g, " ") // drop inline math
    .replace(/[0-9]+(\.[0-9]+)?/g, " # ") // numbers become a placeholder so numeric variants compare equal
    .replace(/[^a-z#\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shingles(text: string, n = 3) {
  const words = normalize(text).split(" ").filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i <= words.length - n; i++) out.add(words.slice(i, i + n).join(" "));
  if (words.length < n) out.add(words.join(" "));
  return out;
}

export function similarity(a: string, b: string) {
  const A = shingles(a);
  const B = shingles(b);
  let inter = 0;
  for (const s of A) if (B.has(s)) inter++;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

export interface DuplicatePair {
  a: string;
  b: string;
  score: number;
  kind: "exact" | "numeric-variant" | "similar";
}

/**
 * Flags pairs whose stems are identical after normalisation ("exact" when the raw
 * text is also identical, "numeric-variant" when only the numbers differ) or whose
 * word-shingle Jaccard similarity exceeds `threshold`.
 */
export function findDuplicates(items: { id: string; stem: string }[], threshold = 0.6): DuplicatePair[] {
  const pairs: DuplicatePair[] = [];
  const norm = items.map((i) => ({ ...i, n: normalize(i.stem), raw: i.stem.replace(/\s+/g, " ").trim().toLowerCase() }));
  for (let i = 0; i < norm.length; i++) {
    for (let j = i + 1; j < norm.length; j++) {
      const x = norm[i];
      const y = norm[j];
      if (x.raw === y.raw) {
        pairs.push({ a: x.id, b: y.id, score: 1, kind: "exact" });
      } else if (x.n === y.n) {
        pairs.push({ a: x.id, b: y.id, score: 1, kind: "numeric-variant" });
      } else {
        const s = similarity(x.stem, y.stem);
        if (s >= threshold) pairs.push({ a: x.id, b: y.id, score: Math.round(s * 100) / 100, kind: "similar" });
      }
    }
  }
  return pairs.sort((p, q) => q.score - p.score);
}
