import { useCallback, useEffect, useRef } from 'react';
import { ADVISORY_AUTO_REFRESH_DELAY } from '../constants/advisoryConstants';
import { useAdvisoryStore } from '../store/advisory';
import { debounce } from '../utils/debounce';

export interface UseAdvisoryAutoRefreshOptions {
  enabled?: boolean;
  minContentLength?: number;
}

export const useAdvisoryAutoRefresh = (
  documentContent: string,
  options: UseAdvisoryAutoRefreshOptions = {}
) => {
  const { 
    enabled = true, 
    minContentLength = 50 
  } = options;
  
  const { refreshComments } = useAdvisoryStore();
  const previousContentRef = useRef<string>('');
  const isInitializedRef = useRef(false);

  // Create a stable debounced refresh function using useRef
  const debouncedRefreshRef = useRef<ReturnType<typeof debounce> | null>(null);

  // Initialize the debounced function once
  useEffect(() => {
    const refreshFunction = (content: string) => {
      if (!enabled) {
        return;
      }

      if (content.trim().length < minContentLength) {
        return;
      }

      refreshComments(content);
    };

    debouncedRefreshRef.current = debounce(refreshFunction, ADVISORY_AUTO_REFRESH_DELAY);

    return () => {
      // Cleanup on unmount
      debouncedRefreshRef.current?.cancel();
      debouncedRefreshRef.current = null;
    };
  }, [enabled, minContentLength, refreshComments]);

  // Handle content changes
  useEffect(() => {
    // Skip the first initialization
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      previousContentRef.current = documentContent;
      return;
    }

    // Only refresh if content actually changed and we have a debounced function
    if (documentContent !== previousContentRef.current && debouncedRefreshRef.current) {
      debouncedRefreshRef.current(documentContent);
      previousContentRef.current = documentContent;
    }
  }, [documentContent]);

  // Manual refresh function
  const manualRefresh = useCallback(() => {
    if (!enabled) {
      return;
    }

    refreshComments(documentContent);
  }, [enabled, documentContent, refreshComments]);

  return {
    manualRefresh,
    isEnabled: enabled,
  };
}; 