import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import { Editor, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useState } from 'react';
import { EDITOR_CONFIG } from '../constants/editorConstants';
import { SpellCheckDecorations } from '../extensions/SpellCheckDecorations';

interface UseTextEditorProps {
  initialContent?: string;
  onContentChange?: (content: string, options?: { isPaste?: boolean }) => void;
}

export const useTextEditor = ({ initialContent = '', onContentChange }: UseTextEditorProps) => {
  const [title, setTitle] = useState<string>('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
      CharacterCount,
      SpellCheckDecorations,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-6',
      },
    },
  });

  // Handle text changes
  const handleTextChange = useCallback(
    (content: string, options?: { isPaste?: boolean }) => {
      onContentChange?.(content, options);
    },
    [onContentChange]
  );

  // Set up editor update handler
  useEffect(() => {
    if (!editor) return undefined;
    
    const handleUpdate = ({ editor: editorInstance }: { editor: unknown }) => {
      const content = (editorInstance as Editor).getHTML();
      handleTextChange(content);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, handleTextChange]);

  // Handle paste events
  useEffect(() => {
    if (!editor) return undefined;
    
    const pasteHandler = () => {
      setTimeout(() => {
        handleTextChange(editor.getHTML(), { isPaste: true });
      }, EDITOR_CONFIG.TONE_REWRITE_DELAY);
    };

    editor.view.dom.addEventListener('paste', pasteHandler);
    return () => {
      editor.view.dom.removeEventListener('paste', pasteHandler);
    };
  }, [editor, handleTextChange]);

  // Update editor content when external content changes
  const updateContent = useCallback((content: string) => {
    if (editor) {
      const editorContent = editor.getHTML();
      if (content !== editorContent) {
        editor.commands.setContent(content, false);
        handleTextChange(content);
      }
    }
  }, [editor, handleTextChange]);

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
  };
}; 