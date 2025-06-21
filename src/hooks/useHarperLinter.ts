import { useCallback, useEffect, useState } from 'react';
import { useSuggestionStore } from '../store/suggestion/suggestion.store';
import { SpellingSuggestion } from '../types';
import {
    getLinter,
    HarperLint,
    HarperWorkerLinter,
} from '../utils/harperLinter';

// Re-exporting for use in other components
export type { HarperLintConfig as LintConfig } from '../utils/harperLinter';

export const useHarperLinter = (doc: { toString: () => string }) => {
  const [linter, setLinter] = useState<HarperWorkerLinter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setSuggestions = useSuggestionStore(
    state => state.setSpellingSuggestions,
  );

  const runLinter = useCallback(async () => {
    if (linter && doc) {
      const lints = await linter.lint(doc.toString());
      const suggestions: SpellingSuggestion[] = lints.map(
        (lint: HarperLint) => {
          const span = lint.span();
          return {
            id: `${span.start}-${span.end}-${lint.message()}`,
            startOffset: span.start,
            endOffset: span.end,
            word: doc.toString().slice(span.start, span.end),
            type: 'spelling',
            suggestions: lint.suggestions().map(s => {
              const text = s.get_replacement_text();
              return { id: text, text };
            }),
            raw: lint,
          };
        },
      );
      setSuggestions(suggestions);
    }
  }, [linter, doc, setSuggestions]);

  // Effect to initialize and reconfigure the linter
  useEffect(() => {
    let isMounted = true;
    getLinter().then(linterInstance => {
      if (isMounted && linterInstance) {
        setLinter(linterInstance);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Effect to run the linter when the document changes
  useEffect(() => {
    runLinter();
  }, [runLinter]);

  return { linter, isLoading, forceReLint: runLinter };
};
