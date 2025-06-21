import * as harper from 'harper.js';
import { harperLinterRules } from '../constants/harperLinterConfig';
import { logger } from './logger';

// --- Singleton Scoped Variables ---

let linterInstance: harper.WorkerLinter | null = null;

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
    logger.info('Initializing Harper linter for the first time...');
    const linter = new harper.WorkerLinter({
      binary: new harper.BinaryModule(
        'https://cdn.jsdelivr.net/npm/harper.js/dist/harper_wasm_bg.wasm',
      ),
      dialect: harper.Dialect.American,
    });

    await linter.setLintConfig(harperLinterRules);
    logger.info('Default Harper Linter Config set.');

    linterInstance = linter;
    logger.success('Harper linter singleton initialized successfully.');
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
    logger.info('Harper linter reconfigured with new rules.', newConfig);
  }
};

export type {
    Lint as HarperLint,
    LintConfig as HarperLintConfig, Suggestion as HarperSuggestion, WorkerLinter as HarperWorkerLinter
} from 'harper.js';

export const { Lint } = harper;

