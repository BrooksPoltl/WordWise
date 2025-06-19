import { Editor } from '@tiptap/react';
import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useSuggestionStore } from '../store/suggestion/suggestion.store';
import { analyzeClarity } from '../utils/clarityAnalyzer';
import { analyzeConciseness } from '../utils/concisenessAnalyzer';
import { logger } from '../utils/logger';

interface UseSuggestionsProps {
  editor: Editor | null;
}

export const useSuggestions = ({ editor }: UseSuggestionsProps) => {
  const { setSuggestions } = useSuggestionStore();

  const handleAnalysis = useDebouncedCallback(async (text: string) => {
    logger.info('Analyzing text for suggestions...', { text });
    if (!text.trim()) {
      logger.info('Text is empty, clearing suggestions.');
      setSuggestions('clarity', []);
      setSuggestions('conciseness', []);
      return;
    }

    try {
      const claritySuggestions = await analyzeClarity(text);
      setSuggestions('clarity', claritySuggestions);

      const concisenessSuggestions = await analyzeConciseness(text);
      setSuggestions('conciseness', concisenessSuggestions);

      logger.success('Analysis complete.', {
        clarity: claritySuggestions.length,
        conciseness: concisenessSuggestions.length,
      });
    } catch (error) {
      logger.error('Failed to analyze text for suggestions:', error);
      setSuggestions('clarity', []);
      setSuggestions('conciseness', []);
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