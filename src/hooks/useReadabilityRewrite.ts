import { httpsCallable } from 'firebase/functions';
import { useCallback, useState } from 'react';
import { functions } from '../config';
import { updateReadabilitySuggestion } from '../store/suggestion/suggestion.actions';
import { ReadabilitySuggestion } from '../types';

export const useReadabilityRewrite = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rewriteSentence = useCallback(
    async (suggestion: ReadabilitySuggestion) => {
      setIsLoading(true);
      setError(null);
      try {
        const readabilityRewrite = httpsCallable(functions, 'readabilityRewrite');
        const result = await readabilityRewrite({ text: suggestion.text });
        const data = result.data as { success: boolean; text: string };

        if (data.success && data.text) {
          updateReadabilitySuggestion(suggestion.id, data.text);
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