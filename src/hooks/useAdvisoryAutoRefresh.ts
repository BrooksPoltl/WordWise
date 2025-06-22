import { useCallback, useEffect, useRef } from 'react';
import { ADVISORY_MIN_CONTENT_LENGTH } from '../constants/advisoryConstants';
import { useAdvisoryStore } from '../store/advisory';

export interface UseAdvisoryAutoRefreshOptions {
  enabled?: boolean;
  enableContentChangeRefresh?: boolean;
  minContentLength?: number;
}

export const useAdvisoryAutoRefresh = (
  documentContent: string,
  documentId: string,
  options: UseAdvisoryAutoRefreshOptions = {}
) => {
  const { 
    enabled = true,
    enableContentChangeRefresh = false,
    minContentLength = ADVISORY_MIN_CONTENT_LENGTH 
  } = options;
  
  const { refreshComments } = useAdvisoryStore();
  const previousContentRef = useRef<string>('');
  const isInitializedRef = useRef(false);

  // Handle initial load
  useEffect(() => {
    // Skip if no documentId or disabled
    if (!enabled || !documentId) {
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

    // Only refresh on content changes if enableContentChangeRefresh is true
    if (enableContentChangeRefresh && documentContent !== previousContentRef.current) {
      refreshComments(documentContent, documentId);
    }
    
    // Always update the previous content reference
    previousContentRef.current = documentContent;
  }, [documentContent, refreshComments, minContentLength, documentId, enabled, enableContentChangeRefresh]);

  // Manual refresh function - immediate, no debouncing needed
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