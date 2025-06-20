import { httpsCallable } from 'firebase/functions';
import { useCallback, useRef, useState } from 'react';
import { functions } from '../config';
import { PassiveSuggestion } from '../types';
import { logger } from '../utils/logger';

// TODO: Implement updatePassiveSuggestion in suggestion.actions.ts
// import { updatePassiveSuggestion } from '../store/suggestion/suggestion.actions';

export const usePassiveRewrite = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rewriteCache = useRef(new Map<string, string>());

  const rewriteSentence = useCallback(async (suggestion: PassiveSuggestion) => {
    if (rewriteCache.current.has(suggestion.text)) {
      const cachedRewrite = rewriteCache.current.get(suggestion.text)!;
      // TODO: Call updatePassiveSuggestion(suggestion.id, cachedRewrite);
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
        rewriteCache.current.set(suggestion.text, data.text);
        // TODO: Call updatePassiveSuggestion(suggestion.id, data.text);
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