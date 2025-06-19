import { Editor } from '@tiptap/react';
import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useSuggestionStore } from '../store/suggestion/suggestion.store';
import { analyzeClarity } from '../utils/clarityAnalyzer';

interface UseSuggestionsProps {
  editor: Editor | null;
}

export const useSuggestions = ({ editor }: UseSuggestionsProps) => {
  const { setSuggestions } = useSuggestionStore();

  const handleAnalysis = useDebouncedCallback(async (text: string) => {
    if (!text.trim()) {
      setSuggestions('clarity', []);
      return;
    }

    try {
      const claritySuggestions = await analyzeClarity(text);
      setSuggestions('clarity', claritySuggestions);
    } catch (error) {
      console.error('Failed to analyze text for suggestions:', error);
      setSuggestions('clarity', []);
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