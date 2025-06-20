import { Editor } from '@tiptap/react';
import { useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { PassiveSuggestion, ReadabilitySuggestion, SpellingSuggestion } from '../types';
import { browserSpellChecker } from '../utils/browserSpellChecker';

import { useSuggestionStore } from '../store/suggestion/suggestion.store';
import { analyzeClarity } from '../utils/clarityAnalyzer';
import { analyzeConciseness } from '../utils/concisenessAnalyzer';
import { analyzePassive } from '../utils/passiveAnalyzer';
import { analyzeReadability } from '../utils/readabilityAnalyzer';
import { usePassiveRewrite } from './usePassiveRewrite';
import { useReadabilityRewrite } from './useReadabilityRewrite';

interface UseSuggestionsProps {
  editor: Editor | null;
}

export const useSuggestions = ({ editor }: UseSuggestionsProps) => {
  const { setSuggestions } = useSuggestionStore();
  const { rewriteSentence: rewriteReadability } = useReadabilityRewrite();
  const { rewriteSentence: rewritePassive } = usePassiveRewrite();
  const processedIdsRef = useRef<Set<string>>(new Set());

  const handleAnalysis = useDebouncedCallback(async (text: string) => {
    if (!text.trim()) {
      setSuggestions('clarity', []);
      setSuggestions('conciseness', []);
      setSuggestions('readability', []);
      setSuggestions('passive', []);
      setSuggestions('spelling', []);
      return;
    }

    try {
      const [
        claritySuggestions,
        concisenessSuggestions,
        readabilitySuggestions,
        passiveSuggestions,
      ] = await Promise.all([
        analyzeClarity(text),
        analyzeConciseness(text),
        analyzeReadability(text),
        analyzePassive(text),
      ]);

      const words = text.match(/\b\w+\b/g) || [];
      const suggestionPromises = words.map(async word => {
        const isCorrect = await browserSpellChecker.correct(word);
        if (!isCorrect) {
          const suggestions = await browserSpellChecker.suggest(word);
          const wordStartIndex = text.indexOf(word);
          return {
            id: `spell-${wordStartIndex}`,
            word,
            startOffset: wordStartIndex,
            endOffset: wordStartIndex + word.length,
            type: 'spelling',
            suggestions: suggestions.slice(0, 5).map(s => ({ id: s, text: s })),
          };
        }
        return null;
      });

      const spellCheckResults = await Promise.all(suggestionPromises);
      const spellSuggestions = spellCheckResults.filter(
        (s): s is SpellingSuggestion => s !== null,
      );

      setSuggestions('clarity', claritySuggestions);
      setSuggestions('conciseness', concisenessSuggestions);
      setSuggestions('spelling', spellSuggestions);
      setSuggestions('readability', readabilitySuggestions);
      setSuggestions('passive', passiveSuggestions);

      readabilitySuggestions.forEach((suggestion: ReadabilitySuggestion) => {
        if (!processedIdsRef.current.has(suggestion.id)) {
          rewriteReadability(suggestion);
          processedIdsRef.current.add(suggestion.id);
        }
      });

      passiveSuggestions.forEach((suggestion: PassiveSuggestion) => {
        if (!processedIdsRef.current.has(suggestion.id)) {
          rewritePassive(suggestion);
          processedIdsRef.current.add(suggestion.id);
        }
      });
    } catch (error) {
      console.error('Failed to analyze text for suggestions:', error);
      setSuggestions('clarity', []);
      setSuggestions('conciseness', []);
      setSuggestions('readability', []);
      setSuggestions('passive', []);
      setSuggestions('spelling', []);
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