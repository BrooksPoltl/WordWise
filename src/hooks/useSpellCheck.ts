import { Editor } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDocumentStore } from '../store/document/document.store';
import { SpellingSuggestion, WritingMetrics } from '../types';
import { logger } from '../utils/logger';
import spellChecker from '../utils/spellChecker';

interface UseSpellCheckProps {
  editor: Editor | null;
  documentId?: string;
}

export const useSpellCheck = ({ editor, documentId }: UseSpellCheckProps) => {
  const {
    suggestions,
    dismissedSuggestionIds,
    applySuggestion,
    dismissSuggestion,
    checkSpelling,
    addSuggestion,
  } = useDocumentStore();

  const [metrics, setMetrics] = useState<WritingMetrics>({
    wordCount: 0,
    characterCount: 0,
    spellingErrors: 0,
  });
  const [isChecking, setIsChecking] = useState(false);
  const isCheckingRef = useRef(isChecking);
  isCheckingRef.current = isChecking;

  const checkWord = useCallback(
    async (word: string, startOffset: number) => {
      try {
        const newSuggestion = await spellChecker.checkWord(word, startOffset);
        if (newSuggestion) {
          addSuggestion(newSuggestion);
        }
      } catch (error) {
        logger.error('Single word spell check failed', error);
      }
    },
    [addSuggestion],
  );

  // Handle applying suggestions
  const handleApplySuggestion = useCallback(
    (suggestion: SpellingSuggestion, replacement: string) => {
      if (!editor) return;
      applySuggestion(suggestion.id, replacement);
    },
    [editor, applySuggestion],
  );

  // Handle dismissing suggestions
  const handleDismissSuggestion = useCallback(
    (suggestionId: string) => {
      dismissSuggestion(suggestionId);
    },
    [dismissSuggestion],
  );

  // Main spell check function, now connected to the store
  const checkText = useCallback(
    (content: string) => {
      if (isCheckingRef.current) return;

      setIsChecking(true);
      checkSpelling(content).finally(() => {
        setIsChecking(false);
      });
    },
    [checkSpelling],
  );
  
  // Update decorations when store suggestions change
  useEffect(() => {
    if (!editor) return;

    const filteredSuggestions = suggestions.filter(
      s => !dismissedSuggestionIds.has(s.id),
    );

    if (filteredSuggestions.length > 0) {
      editor.storage.spellCheckDecorations.updateDecorations(
        editor,
        filteredSuggestions,
      );
    } else {
      editor.storage.spellCheckDecorations.clearDecorations(editor);
    }
  }, [editor, suggestions, dismissedSuggestionIds]);
  
  // Initial spell check on load
  useEffect(() => {
    if (editor && documentId) {
      const initialContent = editor.getText();
      if (initialContent.trim().length > 0) {
        checkText(initialContent);
      }
    }
  }, [editor, documentId, checkText]);

  // Update metrics when suggestions change
  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      setMetrics({
        wordCount: text.split(/\s+/).filter(Boolean).length,
        characterCount: text.length,
        spellingErrors: suggestions.length,
      });
    }
  }, [suggestions, editor]);

  return {
    suggestions,
    metrics,
    checkWord,
    handleApplySuggestion,
    handleDismissSuggestion,
    checkText,
  };
}; 