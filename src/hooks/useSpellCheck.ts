import { Editor } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';
import { useDocumentStore } from '../store/document/document.store';
import { SpellingSuggestion, WritingMetrics } from '../types';

interface UseSpellCheckProps {
  editor: Editor | null;
  documentId?: string;
  content?: string;
}

export const useSpellCheck = ({ editor, documentId, content }: UseSpellCheckProps) => {
  const {
    suggestions,
    dismissedSuggestionIds,
    applySuggestion,
    dismissSuggestion,
    checkSpelling,
  } = useDocumentStore();

  const [metrics, setMetrics] = useState<WritingMetrics>({
    wordCount: 0,
    characterCount: 0,
    spellingErrors: 0,
  });

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
    (text: string) => {
      checkSpelling(text);
    },
    [checkSpelling],
  );
  
  // Update decorations when store suggestions change
  useEffect(() => {
    if (!editor) return;

    const filteredSuggestions = suggestions.filter(
      s => !dismissedSuggestionIds.has(s.id),
    );

    editor.storage.spellCheckDecorations.updateDecorations(
      editor,
      filteredSuggestions,
    );
  }, [editor, suggestions, dismissedSuggestionIds]);
  
  // Spell check on document change
  useEffect(() => {
    if (editor) {
      const handleUpdate = () => {
        const text = editor.getText();
        checkText(text);
      };

      editor.on('update', handleUpdate);

      // Initial check
      handleUpdate();

      return () => {
        editor.off('update', handleUpdate);
      };
    }
    return undefined;
  }, [editor, documentId, checkText]);

  useEffect(() => {
    if (content) {
      checkText(content);
    }
  }, [content, checkText]);

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
    handleApplySuggestion,
    handleDismissSuggestion,
    checkText,
  };
}; 