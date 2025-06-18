/**
 * Simple text difference utility for optimizing spell check updates
 */

export interface TextChange {
  type: 'insert' | 'delete' | 'replace';
  start: number;
  end: number;
  text: string;
}

export interface DiffResult {
  hasChanged: boolean;
  changes: TextChange[];
  similarityScore: number;
}

/**
 * Compare two texts and determine if they've changed significantly
 * Returns information about changes to help optimize spell checking
 */
export function diffTexts(oldText: string, newText: string): DiffResult {
  // Quick equality check
  if (oldText === newText) {
    return {
      hasChanged: false,
      changes: [],
      similarityScore: 1.0,
    };
  }

  // Calculate similarity score using word-based comparison
  const similarityScore = calculateWordSimilarity(oldText, newText);

  // If texts are very similar, consider it a minor change
  const hasSignificantChange = similarityScore < 0.85;

  // For now, we'll use a simple approach - if significantly different, re-check everything
  // This could be enhanced with more sophisticated diffing algorithms if needed
  const changes: TextChange[] = hasSignificantChange
    ? [
        {
          type: 'replace',
          start: 0,
          end: oldText.length,
          text: newText,
        },
      ]
    : [];

  return {
    hasChanged: hasSignificantChange,
    changes,
    similarityScore,
  };
}

/**
 * Calculate similarity between two texts based on word overlap
 */
function calculateWordSimilarity(text1: string, text2: string): number {
  const words1 = new Set(getWords(text1));
  const words2 = new Set(getWords(text2));

  if (words1.size === 0 && words2.size === 0) {
    return 1.0;
  }

  const union = new Set([...words1, ...words2]);
  const intersection = new Set([...words1].filter(word => words2.has(word)));

  return intersection.size / union.size;
}

/**
 * Extract words from text
 */
function getWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 0);
}

/**
 * Check if a change affects a specific text region
 */
export function doesChangeAffectRegion(
  change: TextChange,
  regionStart: number,
  regionEnd: number
): boolean {
  return !(change.end <= regionStart || change.start >= regionEnd);
}
