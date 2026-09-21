/**
 * High-performance string similarity and fuzzy matching engine
 * Used for matching noisy OCR/LLM extracted vendor names and item descriptions
 * against tenant master databases.
 */
export class FuzzyMatcher {
  /**
   * Computes Levenshtein edit distance between two strings
   */
  public static levenshteinDistance(a: string, b: string): number {
    const s1 = a.toLowerCase().trim();
    const s2 = b.toLowerCase().trim();

    const m = s1.length;
    const n = s2.length;

    if (m === 0) return n;
    if (n === 0) return m;

    const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) d[i][0] = i;
    for (let j = 0; j <= n; j++) d[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1, // deletion
          d[i][j - 1] + 1, // insertion
          d[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return d[m][n];
  }

  /**
   * Calculates similarity ratio from 0.0 (no match) to 1.0 (exact match)
   * Uses a hybrid of token-set overlap and Levenshtein edit distance.
   */
  public static calculateSimilarity(s1: string, s2: string): number {
    const str1 = s1.toLowerCase().trim();
    const str2 = s2.toLowerCase().trim();

    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;

    // Direct substring match
    if (str1.includes(str2) || str2.includes(str1)) {
      const minLen = Math.min(str1.length, str2.length);
      const maxLen = Math.max(str1.length, str2.length);
      return Math.max(0.85, minLen / maxLen);
    }

    // Token set overlap (Jaccard similarity on alphanumeric tokens)
    const tokenize = (s: string) => s.split(/[\s\-_,./\\]+/).filter(Boolean);
    const tokens1 = new Set(tokenize(str1));
    const tokens2 = new Set(tokenize(str2));

    let commonTokens = 0;
    for (const t1 of tokens1) {
      for (const t2 of tokens2) {
        if (t1 === t2 || (t1.length >= 3 && t2.includes(t1)) || (t2.length >= 3 && t1.includes(t2))) {
          commonTokens++;
          break;
        }
      }
    }

    const minTokenCount = Math.min(tokens1.size, tokens2.size);
    const tokenScore = minTokenCount > 0 ? commonTokens / minTokenCount : 0;

    // Levenshtein character distance
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    const charScore = Math.max(0, 1 - distance / maxLength);

    // Hybrid score weighted towards token overlap for multi-word descriptions
    return Math.max(tokenScore * 0.9, charScore);
  }

  /**
   * Finds the best match from a candidate list for a query string
   */
  public static findBestMatch<T>(
    query: string,
    candidates: T[],
    getName: (item: T) => string,
    threshold = 0.6
  ): { match: T; score: number } | null {
    let bestMatch: T | null = null;
    let highestScore = 0;

    for (const candidate of candidates) {
      const candidateName = getName(candidate);
      const score = this.calculateSimilarity(query, candidateName);

      if (score > highestScore && score >= threshold) {
        highestScore = score;
        bestMatch = candidate;
      }
    }

    return bestMatch ? { match: bestMatch, score: Math.round(highestScore * 100) / 100 } : null;
  }
}
