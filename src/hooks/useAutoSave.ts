import { useCallback, useEffect, useRef } from 'react';
import { EDITOR_CONFIG } from '../constants/editorConstants';
import { useDocumentStore } from '../store/document/document.store';
import { logger } from '../utils/logger';

/**
 * A hook for debouncing and auto-saving document content changes.
 * This hook is self-contained and does not rely on component state,
 * preventing re-renders and race conditions with the Firestore listener.
 *
 * @param documentId - The ID of the document to save.
 * @returns An object containing the debounced save function.
 */
export const useAutoSave = (documentId: string) => {
  // Use `getState` to get a non-reactive reference to the update function.
  // This prevents the hook from causing re-renders when the store changes.
  const { updateDocument } = useDocumentStore.getState();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback(
    (newContent: string) => {
      // Clear any pending save operation
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timer to save the content
      timeoutRef.current = setTimeout(async () => {
        logger.info('Auto-saving document...', { documentId });
        try {
          await updateDocument({
            id: documentId,
            content: newContent,
          });
          logger.success('Auto-save successful.', { documentId });
        } catch (error) {
          logger.error('Auto-save failed:', error);
        }
      }, EDITOR_CONFIG.AUTO_SAVE_DELAY);
    },
    [documentId, updateDocument],
  );

  // Cleanup effect to clear the timeout when the component unmounts
  // or the documentId changes, to prevent saving to the wrong document.
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [documentId],
  );

  return { debouncedSave };
}; 