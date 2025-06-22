import * as harper from 'harper.js';
import { harperLinterRules } from '../constants/harperLinterConfig';
import { logger } from './logger';

// --- Singleton Scoped Variables ---

let linterInstance: harper.WorkerLinter | null = null;
const ignoredLints = new Set<string>();

const getLintId = (lint: harper.Lint) => {
  const problemText = lint.get_problem_text ? lint.get_problem_text().trim() : '';
  const lintKind = lint.lint_kind();
  // Use problem text + lint kind instead of position + message for more stable IDs
  // Trim whitespace to avoid issues with leading/trailing spaces
  return `${problemText}-${lintKind}`;
};

export const ignoreLint = (lint: harper.Lint) => {
  const id = getLintId(lint);
  ignoredLints.add(id);
};

export const isLintIgnored = (lint: harper.Lint) => {
  const id = getLintId(lint);
  return ignoredLints.has(id);
};

/**
 * Gets the singleton instance of the Harper linter.
 * Initializes it on the first call.
 * @returns {Promise<harper.WorkerLinter | null>} A promise that resolves to the linter instance.
 */
export const getLinter = async (): Promise<harper.WorkerLinter | null> => {
  if (linterInstance) {
    return linterInstance;
  }

  try {
    // Use the built-in binary from harper.js instead of creating BinaryModule manually
    const linter = new harper.WorkerLinter({
      binary: harper.binary,
    });

    await linter.setLintConfig(harperLinterRules);
    

    linterInstance = linter;
    return linterInstance;
  } catch (e) {
    logger.error('Failed to initialize Harper linter.', e);
    return null;
  }
};

export const reconfigureLinter = async (newConfig: harper.LintConfig) => {
  const linter = await getLinter();

  if (linter) {
    await linter.setLintConfig(newConfig);
  }
};

export type {
  Lint as HarperLint,
  LintConfig as HarperLintConfig,
  Suggestion as HarperSuggestion,
  WorkerLinter as HarperWorkerLinter
} from 'harper.js';

export const { Lint } = harper;

/**
 * Creates a mapping between normalized text positions and original text positions
 */
const createPositionMapping = (originalText: string, normalizedText: string) => {
  const mapping: { normalizedPos: number; originalPos: number }[] = [];
  
  let originalPos = 0;
  let normalizedPos = 0;
  
  // Build character-by-character mapping
  while (originalPos < originalText.length && normalizedPos < normalizedText.length) {
    const originalChar = originalText[originalPos];
    const normalizedChar = normalizedText[normalizedPos];
    
    if (originalChar === normalizedChar) {
      // Characters match, record the mapping
      mapping.push({ normalizedPos, originalPos });
      originalPos += 1;
      normalizedPos += 1;
    } else {
      // Characters don't match, this means normalization removed/changed something
      // Skip the original character and continue
      originalPos += 1;
    }
  }
  
  // Add final mapping for end of text
  mapping.push({ normalizedPos: normalizedText.length, originalPos: originalText.length });
  
  return mapping;
};

/**
 * Maps a position from normalized text back to original text
 */
const mapPositionToOriginal = (
  normalizedPos: number, 
  mapping: { normalizedPos: number; originalPos: number }[]
): number => {
  // Find the closest mapping entry
  for (let i = 0; i < mapping.length; i += 1) {
    if (mapping[i].normalizedPos >= normalizedPos) {
      return mapping[i].originalPos;
    }
  }
  
  // If not found, return the last position
  return mapping[mapping.length - 1]?.originalPos || 0;
};

/**
 * Normalizes text for Harper analysis by cleaning up whitespace issues
 */
const normalizeTextForHarper = (text: string): string => text
    // Remove leading/trailing whitespace from the entire document
    .trim()
    // Normalize line breaks to \n
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive leading whitespace from each line (keep max 2 spaces for basic indentation)
    .split('\n')
    .map(line => {
      const trimmed = line.trimStart();
      const leadingSpaces = line.length - trimmed.length;
      // Keep up to 2 spaces for basic indentation, remove the rest
      return leadingSpaces > 2 ? `  ${trimmed}` : line;
    })
    .join('\n')
    // Normalize multiple consecutive spaces to single spaces (except at line starts)
    .replace(/([^\n]) {2,}/g, '$1 ')
    // Remove trailing spaces from lines
    .replace(/ +$/gm, '');

/**
 * Runs Harper analysis on the provided text
 */
export const runHarperAnalysis = async (text: string): Promise<harper.Lint[]> => {
  try {
    const linter = await getLinter();
    if (!linter) {
      return [];
    }
    
    // Normalize the text first
    const normalizedText = normalizeTextForHarper(text);
    const wasNormalized = normalizedText !== text;
    
    // Create position mapping if text was normalized
    const positionMapping = wasNormalized ? createPositionMapping(text, normalizedText) : null;
    
    const lints = await linter.lint(normalizedText);
    
    // If we normalized the text, we need to adjust lint positions back to original text
    if (wasNormalized && lints.length > 0 && positionMapping) {
      // Create new lints with adjusted positions
      const adjustedLints = lints.map(lint => {
        const originalSpan = lint.span();
        const adjustedStart = mapPositionToOriginal(originalSpan.start, positionMapping);
        const adjustedEnd = mapPositionToOriginal(originalSpan.end, positionMapping);
        
        // Create a new lint object with adjusted span
        // Note: This is a bit of a hack since Harper's Lint objects are immutable
        // We'll create a wrapper that mimics the Lint interface
        return {
          span: () => ({ start: adjustedStart, end: adjustedEnd }),
          message: () => lint.message(),
          lint_kind: () => lint.lint_kind(),
          suggestions: () => lint.suggestions(),
          get_problem_text: () => text.substring(adjustedStart, adjustedEnd),
        } as harper.Lint;
      });
      
      return adjustedLints;
    }
    
    return lints;
  } catch (error) {
    logger.error('Harper analysis failed:', error);
    return [];
  }
};

