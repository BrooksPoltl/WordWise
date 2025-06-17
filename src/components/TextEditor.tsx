import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useDocumentStore } from '../store/documentStore';
import { useAuthStore } from '../store/authStore';

interface TextEditorProps {
  documentId: string;
  onTitleChange: (title: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ documentId, onTitleChange }) => {
  const { user } = useAuthStore();
  const { currentDocument, updateDocument, loading } = useDocumentStore();

  // Debounced save function
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (content: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (documentId && content !== currentDocument?.content) {
            try {
              await updateDocument({
                id: documentId,
                content,
              });
            } catch (error) {
              console.error('Auto-save failed:', error);
            }
          }
        }, 1000); // Save after 1 second of inactivity
      };
    })(),
    [documentId, currentDocument?.content, updateDocument]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
      CharacterCount,
    ],
    content: currentDocument?.content || '',
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      debouncedSave(content);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-6',
      },
    },
  });

  // Update editor content when document changes
  useEffect(() => {
    if (editor && currentDocument?.content !== editor.getHTML()) {
      editor.commands.setContent(currentDocument?.content || '');
    }
  }, [editor, currentDocument?.content]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const wordCount = editor.storage.characterCount.words();
  const characterCount = editor.storage.characterCount.characters();

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      {/* Editor Toolbar */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={currentDocument?.title || ''}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Document title..."
            className="text-2xl font-bold border-none outline-none bg-transparent flex-1 mr-4"
            disabled={loading}
          />
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {loading && (
              <div className="flex items-center space-x-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span>Saving...</span>
              </div>
            )}
            <span>{wordCount} words</span>
            <span>{characterCount} characters</span>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('bold')
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 rounded text-sm font-medium italic transition-colors ${
              editor.isActive('italic')
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            I
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-3 py-1 rounded text-sm font-medium line-through transition-colors ${
              editor.isActive('strike')
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            S
          </button>
          
          <div className="w-px h-6 bg-gray-300"></div>
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('paragraph')
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            P
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1. List
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[500px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TextEditor; 