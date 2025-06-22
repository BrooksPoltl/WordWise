import * as harper from 'harper.js';
import { BaseSuggestion, GrammarSuggestion, SuggestionAction } from '../types';

/**
 * Maps Harper lint kinds to our internal suggestion categories
 */
export const mapHarperLintKind = (lintKind: string): BaseSuggestion['type'] => {
  const kind = lintKind.toLowerCase().replace(/_/g, ' '); // Normalize to space-separated words

  // Style and Word Choice Lints (Clarity - Blue)
  if (kind.includes('style') || kind.includes('word choice') || kind.includes('capitalization') || kind.includes('miscellaneous')) {
    return 'style';
  }

  // Conciseness-related lints (Green)
  if (kind.includes('redundancy') || kind.includes('repetition')) {
    return 'conciseness';
  }

  // Readability-related lints (Purple)
  if (kind.includes('readability')) {
    return 'readability';
  }

  // Grammar-related lints (Red)
  if (
    kind.includes('spelling') ||
    kind.includes('grammar') ||
    kind.includes('punctuation') ||
    kind.includes('compounding') ||
    kind.includes('regional') ||
    kind.includes('formatting')
  ) {
    return 'grammar';
  }

  // Fallback for any unhandled cases to a generic style suggestion
  return 'style';
};

/**
 * Gets display-friendly title for Harper lint kinds
 */
export const getHarperDisplayTitle = (lintKind: string): string =>
  // Convert snake_case or camelCase to Title Case
  lintKind
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to space
    .replace(/_/g, ' ') // snake_case to space
    .replace(/\b\w/g, l => l.toUpperCase()); // Title Case

/**
 * Converts Harper lint suggestions to our SuggestionAction format
 */
export const convertHarperActions = (lint: harper.Lint): SuggestionAction[] => {
  const actions: SuggestionAction[] = [];
  
  // Get Harper's suggestions and convert them
  const suggestions = lint.suggestions();
  suggestions.forEach(suggestion => {
    const replacementText = suggestion.get_replacement_text();
    if (replacementText) {
      actions.push({
        type: 'replace',
        text: replacementText
      });
    }
  });
  
  // Add remove action if no suggestions provided (for redundant words, etc.)
  if (actions.length === 0) {
    const lintKind = lint.lint_kind().toLowerCase();
    if (lintKind.includes('redundancy') || lintKind.includes('repetition')) {
      actions.push({ type: 'remove' });
    }
  }
  
  return actions;
};

/**
 * Processes Harper lints into our BaseSuggestion format
 */
export const processHarperLints = (lints: harper.Lint[]): BaseSuggestion[] =>
  lints.map((lint) => {
    const span = lint.span();
    const lintKind = lint.lint_kind();
    const problemText = lint.get_problem_text();
    
    return {
      id: `harper-${span.start}-${span.end}-${lintKind}`,
      type: mapHarperLintKind(lintKind),
      title: getHarperDisplayTitle(lintKind),
      word: problemText,
      text: problemText,
      startOffset: span.start,
      endOffset: span.end,
      actions: convertHarperActions(lint),
      explanation: lint.message(),
    };
  });

/**
 * Converts BaseSuggestion to specific typed suggestions
 */
export const convertToTypedSuggestions = (suggestions: BaseSuggestion[]) => {
  const grammarSuggestions: GrammarSuggestion[] = suggestions
    .filter(s => s.type === 'grammar')
    .map(s => ({ 
      ...s, 
      type: 'grammar' as const,
      raw: {
        from: s.startOffset,
        to: s.endOffset,
        severity: 'warning' as const,
        message: s.explanation || s.title,
        actions: s.actions?.map(action => ({
          name: action.type === 'replace' ? action.text : 'Remove',
          apply: () => {}, // Will be handled by EditorV2
        })) || [],
      }
    }));
    
  const claritySuggestions = suggestions
    .filter(s => s.type === 'style')
    .map(s => ({ ...s, type: 'style' as const }));
    
  const concisenessSuggestions = suggestions
    .filter(s => s.type === 'conciseness')
    .map(s => ({ ...s, type: 'conciseness' as const }));
    
  const readabilitySuggestions = suggestions
    .filter(s => s.type === 'readability')
    .map(s => ({ ...s, type: 'readability' as const }));

  return {
    grammar: grammarSuggestions,
    clarity: claritySuggestions,
    conciseness: concisenessSuggestions,
    readability: readabilitySuggestions,
  };
}; 