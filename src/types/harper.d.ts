// Harper.js TypeScript definitions
// Based on Harper documentation and the existing POC

export interface Span {
  start: number;
  end: number;
}

export interface Suggestion {
  text: string;
  start_offset: number;
  end_offset: number;
}

export interface Lint {
  message(): string;
  span(): Span;
  lint_kind_pretty(): string;
  get_problem_text(): string;
  suggestions(): Suggestion[];
}

export interface WorkerLinter {
  lint(text: string): Promise<Lint[]>;
}

// Harper-specific suggestion type for CodeMirror integration
export interface HarperSuggestion {
  id: string;
  type: 'harper';
  message: string;
  span: Span;
  problemText: string;
  replacements: string[];
  startOffset: number;
  endOffset: number;
}

// Global window type extension for Harper
declare global {
  interface Window {
    HarperWorkerLinter?: typeof WorkerLinter;
  }
}

export type HarperLinterState = 'loading' | 'ready' | 'error';

export interface HarperLinterHook {
  linter: WorkerLinter | null;
  state: HarperLinterState;
  error: string | null;
  lint: (text: string) => Promise<HarperSuggestion[]>;
} 