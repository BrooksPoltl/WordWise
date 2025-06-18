import { useCallback, useEffect, useRef } from 'react';
import { EDITOR_CONFIG } from '../constants/editorConstants';
import { useDocumentStore } from '../store/document/document.store';
import { logger } from '../utils/logger';

/**
 * A hook for debouncing and auto-saving document content changes.
 *
 * @param documentId - The ID of the document to save.
 * @returns An object containing the debounced save function and a cleanup function.
 */
export const useAutoSave = (documentId: string) => {
  const { updateDocument, currentDocument } = useDocumentStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string | undefined>(
    currentDocument?.content,
  );

  // Keep lastSavedContentRef in sync with the document from the store
  useEffect(() => {
    lastSavedContentRef.current = currentDocument?.content;
  }, [currentDocument?.content]);

  const debouncedSave = useCallback(
    (newContent: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        if (newContent !== lastSavedContentRef.current) {
          logger.info('Auto-saving document...', { documentId });
          try {
            await updateDocument({
              id: documentId,
              content: newContent,
            });
            lastSavedContentRef.current = newContent; // Update after successful save
            logger.success('Auto-save successful.', { documentId });
          } catch (error) {
            logger.error('Auto-save failed:', error);
          }
        }
      }, EDITOR_CONFIG.AUTO_SAVE_DELAY);
    },
    [documentId, updateDocument],
  );

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  return { debouncedSave };
}; 