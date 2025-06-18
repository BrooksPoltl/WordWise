import { useCallback, useRef } from 'react';
import { EDITOR_CONFIG } from '../constants/editorConstants';

interface UseAutoSaveProps {
  documentId: string;
  updateDocument: (payload: { id: string; content: string }) => Promise<void>;
  currentContent?: string;
}

export const useAutoSave = ({ documentId, updateDocument, currentContent }: UseAutoSaveProps) => {
  const contentRef = useRef(currentContent);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  contentRef.current = currentContent;

  const debouncedSave = useCallback(
    (content: string) => {
      // Clear the previous timeout if it exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set a new timeout
      timeoutRef.current = setTimeout(async () => {
        if (documentId && content !== contentRef.current) {
          try {
            await updateDocument({
              id: documentId,
              content,
            });
          } catch (error) {
            console.error('Auto-save failed:', error);
          }
        }
        timeoutRef.current = null;
      }, EDITOR_CONFIG.AUTO_SAVE_DELAY);
    },
    [documentId, updateDocument]
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { debouncedSave, cleanup };
}; 