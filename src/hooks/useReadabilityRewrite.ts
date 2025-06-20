import { httpsCallable } from 'firebase/functions';
import { useCallback, useState } from 'react';
import { functions } from '../config';
import { updateSuggestion } from '../store/suggestion/suggestion.actions';
import { ReadabilitySuggestion } from '../types';
import { rewriteCache } from '../utils/rewriteCache';

export const useReadabilityRewrite = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rewriteSentence = useCallback(async (suggestion: ReadabilitySuggestion) => {
    // Check cache first
    const cachedRewrite = rewriteCache.get('readability', suggestion.text);
    if (cachedRewrite) {
      updateSuggestion('readability', suggestion.id, cachedRewrite);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const readabilityRewrite = httpsCallable(functions, 'readabilityRewrite');
      const result = await readabilityRewrite({ text: suggestion.text });
      const data = result.data as { success: boolean; text: string };

      if (data.success && data.text) {
        // Cache the result
        rewriteCache.set('readability', suggestion.text, data.text);
        updateSuggestion('readability', suggestion.id, data.text);
      }
    } catch (err) {
      console.error('Failed to rewrite sentence:', err);
      setError('Failed to rewrite sentence. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { rewriteSentence, isLoading, error };
}; 