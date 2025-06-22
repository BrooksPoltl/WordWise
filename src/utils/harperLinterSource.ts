import { Diagnostic } from '@codemirror/lint';
import { StateEffect, StateField } from '@codemirror/state';
import {
  EditorView,
  ViewPlugin,
  ViewUpdate
} from '@codemirror/view';
import { EDITOR_CONFIG } from '../constants/editorConstants';
import type { SuggestionState } from '../store/suggestion/suggestion.types';
import { debounce } from './debounce';
import {
  HarperLint,
  ignoreLint,
  isLintIgnored,
  runHarperAnalysis,
} from './harperLinter';
import { convertToTypedSuggestions, processHarperLints } from './harperMapping';
import { logger } from './logger';

export const setHarperDiagnostics = StateEffect.define<Diagnostic[]>();
export const harperDiagnostics = StateField.define<Diagnostic[]>({
  create: () => [],
  update(value, tr) {
    let newValue = value;
    for (const effect of tr.effects) {
      if (effect.is(setHarperDiagnostics)) {
        return effect.value;
      }
    }
    // Adjust diagnostic positions on document changes
    newValue = newValue
      .map(d => ({ ...d, from: tr.changes.mapPos(d.from), to: tr.changes.mapPos(d.to) }))
      .filter(d => d.from < d.to);

    return newValue;
  },
});

export const createHarperLinterPlugin = (onSuggestionsUpdate: (suggestions: SuggestionState) => void) => 
  ViewPlugin.fromClass(
    class {
      debouncedRunLinter: () => void;

      constructor(private readonly view: EditorView) {
        this.debouncedRunLinter = debounce(() => this.runLinter(), EDITOR_CONFIG.LINTER_DEBOUNCE_DELAY);
        this.debouncedRunLinter();
      }

      update(update: ViewUpdate) {
        if (update.docChanged) {
          this.debouncedRunLinter();
        }
      }

      runLinter = async () => {
        const docString = this.view.state.doc.toString();
        
        // Use our runHarperAnalysis function which includes text normalization and debugging
        const lints = await runHarperAnalysis(docString);

        if (this.view.state.doc.toString() === docString) {
          try {
            const harperSuggestions = processHarperLints(lints.filter(lint => !isLintIgnored(lint)));
            const typedHarperSuggestions = convertToTypedSuggestions(harperSuggestions);
            
            onSuggestionsUpdate({
              clarity: typedHarperSuggestions.clarity,
              conciseness: typedHarperSuggestions.conciseness,
              readability: typedHarperSuggestions.readability,
              passive: [], // No passive analysis for now
              grammar: typedHarperSuggestions.grammar,
            });
          } catch (error) {
            logger.error('Failed to update suggestion store:', error);
          }

          const diagnostics: Diagnostic[] = lints
            .filter(lint => !isLintIgnored(lint))
            .map((lint: HarperLint) => {
              const span = lint.span();
              return {
                from: span.start,
                to: span.end,
                severity: 'warning',
                message: JSON.stringify({
                  title: lint.lint_kind(),
                  text: lint.message(),
                  type: lint.lint_kind().toLowerCase(),
                }),
                actions: [
                  ...lint.suggestions().map(s => ({
                    name: s.get_replacement_text(),
                    apply: (v: EditorView, from: number, to: number) => {
                      v.dispatch({
                        changes: { from, to, insert: s.get_replacement_text() },
                      });
                    },
                  })),
                  {
                    name: 'Ignore',
                    apply: () => {
                      ignoreLint(lint);
                      this.runLinter();
                    },
                  },
                ],
              };
            });
            
          this.view.dispatch({ effects: setHarperDiagnostics.of(diagnostics) });
        }
      };
    },
  );