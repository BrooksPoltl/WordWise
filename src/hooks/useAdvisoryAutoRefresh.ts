import { useCallback, useEffect, useRef } from 'react';
import { ADVISORY_AUTO_REFRESH_DELAY } from '../constants/advisoryConstants';
import { useAdvisoryStore } from '../store/advisory';
import { debounce } from '../utils/debounce';
import { logger } from '../utils/logger';

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
        logger.debug('Advisory auto-refresh disabled');
        return;
      }

      if (content.trim().length < minContentLength) {
        logger.debug(`Content too short for advisory analysis: ${content.trim().length} < ${minContentLength}`);
        return;
      }

      logger.info(`🔍 Starting advisory comment refresh for content (${content.length} chars)`);
      refreshComments(content);
    };

    debouncedRefreshRef.current = debounce(refreshFunction, ADVISORY_AUTO_REFRESH_DELAY);
    logger.debug(`Advisory auto-refresh initialized with ${ADVISORY_AUTO_REFRESH_DELAY}ms delay`);

    return () => {
      // Cleanup on unmount
      debouncedRefreshRef.current?.cancel();
      debouncedRefreshRef.current = null;
      logger.debug('Advisory auto-refresh cleanup completed');
    };
  }, [enabled, minContentLength, refreshComments]);

  // Handle content changes
  useEffect(() => {
    // Skip the first initialization
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      previousContentRef.current = documentContent;
      logger.debug('Advisory auto-refresh initialized, skipping first content');
      return;
    }

    // Only refresh if content actually changed and we have a debounced function
    if (documentContent !== previousContentRef.current && debouncedRefreshRef.current) {
      const currentTime = Date.now();
      logger.debug(`📝 Document content changed (${previousContentRef.current.length} -> ${documentContent.length} chars), scheduling advisory refresh in ${ADVISORY_AUTO_REFRESH_DELAY}ms at ${currentTime}`);
      debouncedRefreshRef.current(documentContent);
      previousContentRef.current = documentContent;
    }
  }, [documentContent]);

  // Manual refresh function
  const manualRefresh = useCallback(() => {
    if (!enabled) {
      logger.debug('Advisory auto-refresh disabled, skipping manual refresh');
      return;
    }

    logger.info('🚀 Manual advisory comment refresh triggered');
    refreshComments(documentContent);
  }, [enabled, documentContent, refreshComments]);

  return {
    manualRefresh,
    isEnabled: enabled,
  };
}; 