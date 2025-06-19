import { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { useSuggestionStore } from '../store/suggestion/suggestion.store';
import { analyzeClarity } from '../utils/clarityAnalyzer';
import { analyzeConciseness } from '../utils/concisenessAnalyzer';
import { logger } from '../utils/logger';
import { analyzeReadability } from '../utils/readabilityAnalyzer';
import { useReadabilityRewrite } from './useReadabilityRewrite';

interface UseSuggestionsProps {
  editor: Editor | null;
}

export const useSuggestions = ({ editor }: UseSuggestionsProps) => {
  const { setSuggestions } = useSuggestionStore();
  const { rewriteSentence } = useReadabilityRewrite();
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

  const handleAnalysis = useDebouncedCallback(async (text: string) => {
    if (!text.trim()) {
      setSuggestions('clarity', []);
      setSuggestions('conciseness', []);
      setSuggestions('readability', []);
      return;
    }

    try {
      const claritySuggestions = await analyzeClarity(text);
      setSuggestions('clarity', claritySuggestions);

      const concisenessSuggestions = await analyzeConciseness(text);
      setSuggestions('conciseness', concisenessSuggestions);

      const readabilitySuggestions = await analyzeReadability(text);
      setSuggestions('readability', readabilitySuggestions);

      readabilitySuggestions.forEach(suggestion => {
        if (!processedIds.has(suggestion.id)) {
          rewriteSentence(suggestion);
          setProcessedIds(prev => new Set(prev).add(suggestion.id));
        }
      });
    } catch (error) {
      logger.error('Failed to analyze text for suggestions:', error);
      setSuggestions('clarity', []);
      setSuggestions('conciseness', []);
      setSuggestions('readability', []);
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