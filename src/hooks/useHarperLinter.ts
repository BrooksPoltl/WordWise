import { useEffect, useState } from 'react';
import { useSuggestionStore } from '../store/suggestion/suggestion.store';
import { SpellingSuggestion } from '../types';
import {
    getLinter,
    HarperLint,
    HarperWorkerLinter,
} from '../utils/harperLinter';

// Re-exporting for use in other components
export type { HarperLintConfig as LintConfig } from '../utils/harperLinter';

export const useHarperLinter = (
  doc: { toString: () => string },
  configOverrides: Record<string, boolean | null> = {},
) => {
  const [linter, setLinter] = useState<HarperWorkerLinter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to initialize and reconfigure the linter
  useEffect(() => {
    const manageLinter = async () => {
      setIsLoading(true);
      const linterInstance = await getLinter();

      if (linterInstance) {
        // Every time the config overrides change, we get the linter's default
        // config and merge our overrides on top, then apply it.
        const defaultConfigJSON = await linterInstance.getLintConfigAsJSON();
        const defaultConfig = JSON.parse(defaultConfigJSON);
        const mergedRules = { ...defaultConfig, ...configOverrides };
        linterInstance.setLintConfigWithJSON(JSON.stringify(mergedRules));

        // Finally, set the configured instance in our state.
        setLinter(linterInstance);
      }

      setIsLoading(false);
    };

    manageLinter();
  }, [configOverrides]);

  // Effect to run the linter when the document changes
  useEffect(() => {
    if (linter && doc) {
      linter.lint(doc.toString()).then((lints: HarperLint[]) => {
        const suggestions: SpellingSuggestion[] = lints.map((lint: HarperLint) => {
          const span = lint.span();
          return {
            id: `${span.start}-${span.end}-${lint.message()}`,
            word: lint.get_problem_text(),
            startOffset: span.start,
            endOffset: span.end,
            suggestions: lint.suggestions().map((s, index) => {
              const text = s.get_replacement_text();
              return { id: `${text}-${index}`, text };
            }),
            type: lint.lint_kind() === 'Spelling' ? 'spelling' : 'grammar',
            raw: lint,
          };
        });
        useSuggestionStore.getState().setSpellingSuggestions(suggestions);
      });
    }
  }, [doc, linter]);

  return { isLoading };
};
