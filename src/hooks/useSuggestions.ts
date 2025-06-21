import { Editor } from '@tiptap/react';
import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
    BaseSuggestion,
    GrammarSuggestion,
    // PassiveSuggestion,
    SuggestionAction
} from '../types';

import { useSuggestionStore } from '../store/suggestion/suggestion.store';
// import { analyzePassive } from '../utils/passiveAnalyzer';
import { getLinter, HarperLint } from '../utils/harperLinter';
import { getHarperDisplayTitle, mapHarperLintKind } from '../utils/harperMapping';
// import { usePassiveRewrite } from './usePassiveRewrite';

interface UseSuggestionsProps {
  editor: Editor | null;
}

/**
 * Converts Harper lint suggestions to our SuggestionAction format
 */
const convertHarperActions = (lint: HarperLint): SuggestionAction[] => {
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
const processHarperLints = (lints: HarperLint[]): BaseSuggestion[] =>
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
 * Runs Harper analysis on the provided text
 */
const runHarperAnalysis = async (text: string): Promise<HarperLint[]> => {
  try {
    const linter = await getLinter();
    if (!linter) {
      console.warn('Harper linter not available');
      return [];
    }
    
    const lints = await linter.lint(text);
    return lints;
  } catch (error) {
    console.error('Harper analysis failed:', error);
    return [];
  }
};

/**
 * Converts BaseSuggestion to specific typed suggestions
 */
const convertToTypedSuggestions = (suggestions: BaseSuggestion[]) => {
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
          apply: () => {}, // Will be handled by EditorV2 in Phase 2
        })) || [],
      }
    }));
    
  const claritySuggestions = suggestions
    .filter(s => s.type === 'weasel_word')
    .map(s => ({ ...s, type: 'weasel_word' as const }));
    
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

export const useSuggestions = ({ editor }: UseSuggestionsProps) => {
  const { setSuggestions } = useSuggestionStore();
  // const { rewriteSentence: rewritePassive } = usePassiveRewrite();
  // const processedIdsRef = useRef<Set<string>>(new Set());

  const handleAnalysis = useDebouncedCallback(async (text: string) => {
    if (!text.trim()) {
      setSuggestions({
        clarity: [],
        conciseness: [],
        readability: [],
        passive: [],
        grammar: [],
      });
      return;
    }

    try {
      // Run Harper analysis only (passive analyzer commented out)
      const [
        // passiveSuggestions,
        harperLints,
      ] = await Promise.all([
        // analyzePassive(text),
        runHarperAnalysis(text),
      ]);

      // Process Harper lints into our suggestion format
      const harperSuggestions = processHarperLints(harperLints);
      const typedHarperSuggestions = convertToTypedSuggestions(harperSuggestions);

      setSuggestions({
        clarity: typedHarperSuggestions.clarity,
        conciseness: typedHarperSuggestions.conciseness,
        readability: typedHarperSuggestions.readability,
        passive: [], // passiveSuggestions,
        grammar: typedHarperSuggestions.grammar,
      });

      // Commented out passive voice rewriting
      // passiveSuggestions.forEach((suggestion: PassiveSuggestion) => {
      //   if (!processedIdsRef.current.has(suggestion.id)) {
      //     rewritePassive(suggestion);
      //     processedIdsRef.current.add(suggestion.id);
      //   }
      // });
    } catch (error) {
      console.error('Failed to analyze text for suggestions:', error);
      setSuggestions({
        clarity: [],
        conciseness: [],
        readability: [],
        passive: [],
        grammar: [],
      });
    }
  }, 500);

  useEffect(() => {
    if (editor) {
      const onUpdate = () => {
        const text = editor.getText();
        handleAnalysis(text);
      };

      editor.on('update', onUpdate);
      onUpdate(); // Initial analysis

      return () => {
        editor.off('update', onUpdate);
      };
    }
    return () => {}; // Return an empty cleanup function if no editor
  }, [editor, handleAnalysis]);
}; 