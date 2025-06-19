import { Editor } from '@tiptap/react';
import { useCallback, useEffect } from 'react';
import { useDocumentStore } from '../store/document/document.store';
import { useSuggestionStore } from '../store/suggestion/suggestion.store';

interface UseSpellCheckProps {
  editor: Editor | null;
}

export const useSpellCheck = ({ editor }: UseSpellCheckProps) => {
  const { checkSpelling, suggestions } = useDocumentStore();
  const setSpellingSuggestions = useSuggestionStore(
    state => state.setSpellingSuggestions,
  );

  const checkText = useCallback(
    (text: string) => {
      checkSpelling(text);
    },
    [checkSpelling],
  );

  useEffect(() => {
    setSpellingSuggestions(suggestions);
  }, [suggestions, setSpellingSuggestions]);

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
  }, [editor, checkText]);
}; 