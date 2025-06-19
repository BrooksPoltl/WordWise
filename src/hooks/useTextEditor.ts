import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useRef, useState } from 'react';
import { SuggestionDecorations } from '../extensions/SuggestionDecorations';

interface UseTextEditorProps {
  initialContent?: string;
}

export const useTextEditor = ({ initialContent = '' }: UseTextEditorProps) => {
  const [title, setTitle] = useState<string>('');
  const isProgrammaticUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
      CharacterCount,
      SuggestionDecorations,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-6',
      },
    },
  });

  // Update editor content when external content changes
  const updateContent = useCallback(
    (content: string) => {
      if (editor) {
        const editorContent = editor.getHTML();
        if (content !== editorContent) {
          isProgrammaticUpdate.current = true;
          editor.commands.setContent(content, false, {
            preserveWhitespace: 'full',
          });
        }
      }
    },
    [editor],
  );

  // Get word and character counts
  const wordCount = editor?.storage.characterCount.words() || 0;
  const characterCount = editor?.storage.characterCount.characters() || 0;

  return {
    editor,
    title,
    setTitle,
    wordCount,
    characterCount,
    updateContent,
    isProgrammaticUpdate,
  };
}; 