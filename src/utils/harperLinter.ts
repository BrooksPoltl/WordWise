import * as harper from 'harper.js';
import { harperLinterRules } from '../constants/harperLinterConfig';
import { logger } from './logger';

// --- Singleton Scoped Variables ---

let linterInstance: harper.WorkerLinter | null = null;
const ignoredLints = new Set<string>();

const getLintId = (lint: harper.Lint) => {
  const span = lint.span();
  return `${span.start}-${span.end}-${lint.message()}`;
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
 * Runs Harper analysis on the provided text
 */
export const runHarperAnalysis = async (text: string): Promise<harper.Lint[]> => {
  try {
    const linter = await getLinter();
    if (!linter) {
      return [];
    }
    
    const lints = await linter.lint(text);
    return lints;
  } catch (error) {
    logger.error('Harper analysis failed:', error);
    return [];
  }
};

