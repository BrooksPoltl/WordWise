import { Editor } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';
import { EDITOR_CONFIG } from '../constants/editorConstants';
import { getSuggestionById } from '../extensions/SpellCheckDecorations';
import { SpellingSuggestion, WritingMetrics } from '../types';
import { spellChecker } from '../utils/spellChecker';

interface UseSpellCheckProps {
  editor: Editor | null;
  documentId?: string;
}

export const useSpellCheck = ({ editor, documentId }: UseSpellCheckProps) => {
  const [suggestions, setSuggestions] = useState<SpellingSuggestion[]>([]);
  const [metrics, setMetrics] = useState<WritingMetrics>({
    wordCount: 0,
    characterCount: 0,
    spellingErrors: 0,
  });
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(
    new Set()
  );

  // Main spell check function
  const checkText = useCallback(
    (content: string, options?: { isPaste?: boolean; forceCheck?: boolean }) => {
      if (!editor) return;

      // Get plain text from editor for spell checking
      const plainTextForSpellCheck = editor
        ? editor.getText()
        : content
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

      // Update metrics
      const newMetrics = spellChecker.calculateMetrics(plainTextForSpellCheck);
      setMetrics(newMetrics);

      // Handle different spell check scenarios
      if (options?.isPaste || options?.forceCheck) {
        spellChecker.checkText(
          plainTextForSpellCheck,
          (newSuggestions) => {
            const filteredSuggestions = newSuggestions.filter(
              suggestion => !dismissedSuggestions.has(suggestion.id)
            );
            setSuggestions(filteredSuggestions);
          },
          options
        );
      }
    },
    [editor, dismissedSuggestions]
  );

  // Handle applying suggestions
  const handleApplySuggestion = useCallback(
    (suggestion: SpellingSuggestion, replacement: string) => {
      if (!editor) return;

      // Find and replace the word using ProseMirror positions
      const from = suggestion.startOffset + 1; // Convert to 1-based for Tiptap
      const to = suggestion.endOffset + 1;

      // Apply the replacement
      editor
        .chain()
        .setTextSelection({ from, to })
        .insertContent(replacement)
        .run();

      // Update suggestions list
      setSuggestions(prev =>
        spellChecker.applySuggestion(prev, suggestion, replacement)
      );
    },
    [editor]
  );

  // Handle dismissing suggestions
  const handleDismissSuggestion = useCallback((suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);

  // Handle space-triggered spell check
  const checkWordAtCursor = useCallback(() => {
    if (!editor || !editor.view.hasFocus()) return;

    const cursorPosition = editor.state.selection.from;
    const plainText = editor.getText();

    spellChecker.checkWordAt(
      plainText,
      cursorPosition,
      newSuggestions => {
        const filteredSuggestions = newSuggestions.filter(
          suggestion => !dismissedSuggestions.has(suggestion.id)
        );

        if (filteredSuggestions.length > 0) {
          const newSuggestion = filteredSuggestions[0];
          setSuggestions(prevSuggestions => {
            const otherSuggestions = prevSuggestions.filter(
              s => s.startOffset !== newSuggestion.startOffset
            );
            return [...otherSuggestions, newSuggestion];
          });
        }
      }
    );
  }, [editor, dismissedSuggestions]);

  // Clean up invalid suggestions after deletion
  const cleanupSuggestions = useCallback(() => {
    if (!editor || !editor.view.hasFocus()) return;
    
    const plainText = editor.getText();
    const currentSuggestions = suggestions;
    
    // Filter out suggestions that no longer apply
    const validSuggestions = currentSuggestions.filter(suggestion => {
      if (suggestion.endOffset > plainText.length) {
        return false;
      }
      
      const actualText = plainText.substring(
        suggestion.startOffset,
        suggestion.endOffset
      );
      
      return actualText.toLowerCase() === suggestion.word.toLowerCase();
    });
    
    if (validSuggestions.length !== currentSuggestions.length) {
      setSuggestions(validSuggestions);
    }
  }, [editor, suggestions]);

  // Handle spell suggestion clicks
  const handleSpellClick = useCallback(
    (event: CustomEvent) => {
      const { suggestionId } = event.detail;
      const suggestion = getSuggestionById(suggestions, suggestionId);
      if (suggestion && suggestion.suggestions.length > 0) {
        // Auto-apply the first suggestion for now
        handleApplySuggestion(suggestion, suggestion.suggestions[0]);
      }
    },
    [suggestions, handleApplySuggestion]
  );

  // Set up keyboard event handlers
  useEffect(() => {
    if (!editor) return undefined;

    const keydownHandler = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        setTimeout(() => {
          checkWordAtCursor();
        }, EDITOR_CONFIG.SPELL_CHECK_DELAY);
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        setTimeout(() => {
          cleanupSuggestions();
        }, EDITOR_CONFIG.SPELL_CHECK_DELAY);
      }
    };

    editor.view.dom.addEventListener('keydown', keydownHandler);
    return () => {
      editor.view.dom.removeEventListener('keydown', keydownHandler);
    };
  }, [editor, checkWordAtCursor, cleanupSuggestions]);

  // Set up spell click handler
  useEffect(() => {
    if (!editor) return undefined;

    editor.view.dom.addEventListener(
      'spellSuggestionClick',
      handleSpellClick as EventListener
    );
    return () => {
      editor.view.dom.removeEventListener(
        'spellSuggestionClick',
        handleSpellClick as EventListener
      );
    };
  }, [editor, handleSpellClick]);

  // Update decorations when suggestions change
  useEffect(() => {
    if (!editor) return;

    const filteredSuggestions = suggestions.filter(
      s => !dismissedSuggestions.has(s.id)
    );

    if (filteredSuggestions.length > 0) {
      editor.storage.spellCheckDecorations.updateDecorations(
        editor,
        filteredSuggestions
      );
    } else {
      editor.storage.spellCheckDecorations.clearDecorations(editor);
    }
  }, [editor, suggestions, dismissedSuggestions]);

  // Initial spell check when editor loads with content
  useEffect(() => {
    if (editor && editor.getText().trim().length > 0) {
      const plainText = editor.getText();
      
      spellChecker.checkText(
        plainText,
        (initialSuggestions) => {
          const filteredSuggestions = initialSuggestions.filter(
            suggestion => !dismissedSuggestions.has(suggestion.id)
          );
          setSuggestions(filteredSuggestions);
        },
        { forceCheck: true }
      );
    }
  }, [editor, documentId, dismissedSuggestions]);

  return {
    suggestions,
    metrics,
    dismissedSuggestions,
    handleApplySuggestion,
    handleDismissSuggestion,
    checkText,
  };
}; 