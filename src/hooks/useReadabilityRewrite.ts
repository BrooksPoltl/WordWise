import { httpsCallable } from 'firebase/functions';
import { useCallback, useRef, useState } from 'react';
import { functions } from '../config';
import { updateSuggestion } from '../store/suggestion/suggestion.actions';
import { ReadabilitySuggestion } from '../types';

export const useReadabilityRewrite = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rewriteCache = useRef(new Map<string, string>());

  const rewriteSentence = useCallback(
    async (suggestion: ReadabilitySuggestion) => {
      if (rewriteCache.current.has(suggestion.text)) {
        const cachedRewrite = rewriteCache.current.get(suggestion.text);
        if (cachedRewrite) {
          updateSuggestion('readability', suggestion.id, cachedRewrite);
          return;
        }
      }

      setIsLoading(true);
      setError(null);
      try {
        const readabilityRewrite = httpsCallable(functions, 'readabilityRewrite');
        const result = await readabilityRewrite({ text: suggestion.text });
        const data = result.data as { success: boolean; text: string };

        if (data.success && data.text) {
          rewriteCache.current.set(suggestion.text, data.text);
          updateSuggestion('readability', suggestion.id, data.text);
        }
      } catch (err) {
        setError('Failed to rewrite sentence. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { rewriteSentence, isLoading, error };
}; 