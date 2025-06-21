import { useEffect, useState } from 'react';
import { HarperLinterHook, HarperLinterState, HarperSuggestion, Lint, WorkerLinter } from '../types/harper';

// Global state to prevent multiple Harper loads
let globalLinter: WorkerLinter | null = null;
let globalState: HarperLinterState | null = null;
let globalError: string | null = null;
let isLoading = false;

export const useHarperLinter = (): HarperLinterHook => {
  const [linter, setLinter] = useState<WorkerLinter | null>(globalLinter);
  const [state, setState] = useState<HarperLinterState>(globalState || 'loading');
  const [error, setError] = useState<string | null>(globalError);

  useEffect(() => {
    const loadHarper = async () => {
      // If already loaded, use global instance
      if (globalLinter && globalState === 'ready') {
        setLinter(globalLinter);
        setState('ready');
        setError(null);
        return;
      }

      // If currently loading, wait
      if (isLoading) {
        return;
      }

      // If in error state, use global error
      if (globalState === 'error') {
        setState('error');
        setError(globalError);
        return;
      }

      try {
        isLoading = true;
        
        // Load Harper from CDN using script tag
        const script = document.createElement('script');
        script.type = 'module';
        script.innerHTML = `
          try {
            const { WorkerLinter } = await import('https://unpkg.com/harper.js@0.13.0/dist/harper.js');
            window.HarperWorkerLinter = WorkerLinter;
            window.dispatchEvent(new CustomEvent('harperLoaded'));
          } catch (e) {
            window.dispatchEvent(new CustomEvent('harperError', { detail: e }));
          }
        `;
        document.head.appendChild(script);
        
        // Wait for Harper to load
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Harper loading timeout'));
          }, 15000);
          
          let handleLoad: () => void;
          let handleError: () => void;
          
          const cleanup = () => {
            clearTimeout(timeout);
            window.removeEventListener('harperLoaded', handleLoad);
            window.removeEventListener('harperError', handleError);
          };
          
          handleError = () => {
            cleanup();
            reject(new Error('Harper script failed to load'));
          };
          
          handleLoad = () => {
            cleanup();
            resolve();
          };
          
          window.addEventListener('harperLoaded', handleLoad, { once: true });
          window.addEventListener('harperError', handleError, { once: true });
        });
        
        // Create linter instance
        const WorkerLinterClass = window.HarperWorkerLinter;
        if (!WorkerLinterClass) {
          throw new Error('Harper WorkerLinter not found');
        }
        
        const linterInstance = new WorkerLinterClass();
        
        // Update global state
        globalLinter = linterInstance;
        globalState = 'ready';
        globalError = null;
        isLoading = false;
        
        // Update local state
        setLinter(linterInstance);
        setState('ready');
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load Harper grammar checker';
        
        // Update global state
        globalState = 'error';
        globalError = errorMessage;
        isLoading = false;
        
        // Update local state
        setState('error');
        setError(errorMessage);
      }
    };

    loadHarper();
  }, []);

  const lint = async (text: string): Promise<HarperSuggestion[]> => {
    if (!linter || state !== 'ready') {
      return [];
    }

    try {
      const lints = await linter.lint(text);
      
      return lints.map((lintItem: Lint, index: number): HarperSuggestion => {
        const span = lintItem.span();
        const suggestions = lintItem.suggestions();
        
        return {
          id: `harper-${span.start}-${span.end}-${index}`,
          type: 'harper',
          message: lintItem.message(),
          span,
          problemText: lintItem.get_problem_text(),
          replacements: suggestions.map((s: { text: string }) => s.text),
          startOffset: span.start,
          endOffset: span.end,
        };
      });
    } catch (err) {
      return [];
    }
  };

  return {
    linter,
    state,
    error,
    lint,
  };
}; 