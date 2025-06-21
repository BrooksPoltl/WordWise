import { Editor } from '@tiptap/react';
import { useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
    PassiveSuggestion,
    ReadabilitySuggestion
} from '../types';

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
      setSuggestions({
        clarity: [],
        conciseness: [],
        readability: [],
        passive: [],
        spelling: [],
      });
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

      setSuggestions({
        clarity: claritySuggestions,
        conciseness: concisenessSuggestions,
        readability: readabilitySuggestions,
        passive: passiveSuggestions,
        spelling: [], // Will be replaced with Harper suggestions in Phase 1
      });

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
      setSuggestions({
        clarity: [],
        conciseness: [],
        readability: [],
        passive: [],
        spelling: [], // Will be replaced with Harper suggestions in Phase 1
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