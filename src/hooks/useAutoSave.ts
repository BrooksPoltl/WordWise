import { useCallback, useEffect, useRef } from 'react';
import { EDITOR_CONFIG } from '../constants/editorConstants';
import { autoSaveDocument } from '../store/document/document.actions';

/**
 * A hook for debouncing and auto-saving document content changes.
 * Uses fire-and-forget auto-save for optimal performance.
 *
 * @param documentId - The ID of the document to save.
 * @returns An object containing the debounced save function.
 */
export const useAutoSave = (documentId: string) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback(
    (newContent: string) => {
      // Clear any pending save operation
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timer to save the content
      timeoutRef.current = setTimeout(() => {
    
        
        // Fire-and-forget auto-save - no await, no state updates needed
        autoSaveDocument(documentId, { content: newContent });
        
        
      }, EDITOR_CONFIG.AUTO_SAVE_DELAY);
    },
    [documentId],
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