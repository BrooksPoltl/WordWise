import { httpsCallable } from 'firebase/functions';
import { useCallback, useState } from 'react';
import { functions } from '../config';
import { updateSuggestion } from '../store/suggestion/suggestion.actions';
import { PassiveSuggestion } from '../types';
import { logger } from '../utils/logger';
import { rewriteCache } from '../utils/rewriteCache';

// TODO: Implement updatePassiveSuggestion in suggestion.actions.ts
// import { updatePassiveSuggestion } from '../store/suggestion/suggestion.actions';

export const usePassiveRewrite = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rewriteSentence = useCallback(async (suggestion: PassiveSuggestion) => {
    // Check cache first
    const cachedRewrite = rewriteCache.get('passive', suggestion.text);
    if (cachedRewrite) {
      updateSuggestion('passive', suggestion.id, cachedRewrite);
      logger.info('Using cached rewrite for passive suggestion:', cachedRewrite);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const passiveRewrite = httpsCallable(functions, 'passiveRewrite');
      const result = await passiveRewrite({ text: suggestion.text });
      const data = result.data as { success: boolean; text: string };

      if (data.success && data.text) {
        // Cache the result
        rewriteCache.set('passive', suggestion.text, data.text);
        updateSuggestion('passive', suggestion.id, data.text);
        logger.success('Successfully rewritten passive sentence:', data.text);
      }
    } catch (err) {
      logger.error('Failed to rewrite sentence.', err);
      setError('Failed to rewrite sentence. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { rewriteSentence, isLoading, error };
}; 