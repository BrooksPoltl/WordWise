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
  documentId: string,
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
      if (!enabled || !documentId) {
        return;
      }

      if (content.trim().length < minContentLength) {
        return;
      }

      refreshComments(content, documentId);
    };

    debouncedRefreshRef.current = debounce(refreshFunction, ADVISORY_AUTO_REFRESH_DELAY);

    return () => {
      // Cleanup on unmount
      debouncedRefreshRef.current?.cancel();
      debouncedRefreshRef.current = null;
    };
  }, [enabled, minContentLength, refreshComments, documentId]);

  // Handle content changes and initial load
  useEffect(() => {
    // Skip if no documentId
    if (!documentId) {
      return;
    }

    // Skip the first initialization only if content is empty
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      previousContentRef.current = documentContent;
      
      // If we have substantial content on initial load, generate advisory comments immediately
      if (documentContent && documentContent.trim().length >= minContentLength) {
        refreshComments(documentContent, documentId);
      }
      return;
    }

    // Only refresh if content actually changed and we have a debounced function
    if (documentContent !== previousContentRef.current && debouncedRefreshRef.current) {
      debouncedRefreshRef.current(documentContent);
      previousContentRef.current = documentContent;
    }
  }, [documentContent, refreshComments, minContentLength, documentId]);

  // Manual refresh function
  const manualRefresh = useCallback(() => {
    if (!enabled || !documentId) {
      return;
    }

    refreshComments(documentContent, documentId);
  }, [enabled, documentContent, refreshComments, documentId]);

  return {
    manualRefresh,
    isEnabled: enabled,
  };
}; 