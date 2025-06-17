import React, { useEffect, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useDocumentStore } from '../store/documentStore';
import { useAuthStore } from '../store/authStore';
import { SpellingSuggestion, WritingMetrics } from '../types';
import { spellChecker } from '../utils/spellChecker';
import SuggestionSidebar from './SuggestionSidebar';

interface TextEditorProps {
  documentId: string;
  onTitleChange: (title: string) => void;
  showSidebar?: boolean;
}

const TextEditor: React.FC<TextEditorProps> = ({ documentId, onTitleChange, showSidebar = true }) => {
  const { user } = useAuthStore();
  const { currentDocument, updateDocument, loading } = useDocumentStore();
  const [suggestions, setSuggestions] = useState<SpellingSuggestion[]>([]);
  const [metrics, setMetrics] = useState<WritingMetrics>({
    wordCount: 0,
    characterCount: 0,
    spellingErrors: 0
  });
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState<string>(currentDocument?.title || '');

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
        }, 3000); // Save after 3 seconds of inactivity
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
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-6',
      },
    },
  });

  // Handle spell checking
  const handleTextChange = useCallback((content: string) => {
    debouncedSave(content);
    
    // Get plain text from editor for spell checking
    const plainTextForSpellCheck = editor ? editor.getText() : content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Update metrics
    const newMetrics = spellChecker.calculateMetrics(plainTextForSpellCheck);
    setMetrics(newMetrics);
    
    // Check for suggestions using plain text
    spellChecker.checkText(plainTextForSpellCheck, (newSuggestions) => {
      // Filter out dismissed suggestions
      const filteredSuggestions = newSuggestions.filter(
        suggestion => !dismissedSuggestions.has(suggestion.id)
      );
      
      setSuggestions(filteredSuggestions);
      
      // Update metrics with suggestion counts
      setMetrics(prev => ({
        ...prev,
        spellingErrors: filteredSuggestions.length
      }));
    });
  }, [debouncedSave, dismissedSuggestions, editor]);

  // Set up editor update handler
  useEffect(() => {
    if (editor) {
      const handleUpdate = ({ editor }: { editor: any }) => {
        const content = editor.getHTML();
        handleTextChange(content);
      };

      editor.on('update', handleUpdate);

      return () => {
        editor.off('update', handleUpdate);
      };
    }
  }, [editor, handleTextChange]);

  // Update editor content when document changes
  useEffect(() => {
    if (editor && currentDocument?.content !== editor.getHTML()) {
      editor.commands.setContent(currentDocument?.content || '');
      // Trigger spell check for initial content
      if (currentDocument?.content) {
        handleTextChange(currentDocument.content);
      }
    }
  }, [editor, currentDocument?.content, handleTextChange]);

  // Handle applying suggestions
  const handleApplySuggestion = useCallback((suggestion: SpellingSuggestion, replacement: string) => {
    if (!editor) return;

    // Tiptap's document positions are 1-based, whereas our offsets are 0-based.
    const from = (suggestion.startOffset ?? NaN) + 1;
    const to = (suggestion.endOffset ?? NaN) + 1;

    if (!Number.isNaN(from) && !Number.isNaN(to) && from < to) {
      // Use precise offsets when available
      editor.chain().focus()
        .setTextSelection({ from, to })
        .insertContent(replacement)
        .run();
    } else {
      // Fallback: locate and replace the first occurrence of the word in the plain text
      const plainText = editor.getText();
      const index = plainText.indexOf(suggestion.word);
      if (index !== -1) {
        const fallbackFrom = index + 1; // convert to 1-based
        const fallbackTo = index + suggestion.word.length + 1;
        editor.chain().focus()
          .setTextSelection({ from: fallbackFrom, to: fallbackTo })
          .insertContent(replacement)
          .run();
      } else {
        console.warn('Could not find word in editor for replacement:', suggestion.word);
      }
    }
    // Remove the applied suggestion from local state and shift offsets of the remaining ones.
    const diff = replacement.length - suggestion.word.length;
    setSuggestions(prev =>
      prev
        // discard the suggestion we just fixed
        .filter(s => s.id !== suggestion.id)
        // shift offsets for any that appear after the replaced range
        .map(s => {
          if (diff !== 0 && s.startOffset > suggestion.endOffset) {
            return {
              ...s,
              startOffset: s.startOffset + diff,
              endOffset: s.endOffset + diff,
              // optionally update id so it reflects new offsets (keep uniqueness)
              id: s.id.startsWith('spell-') ? `spell-${s.startOffset + diff}-${s.endOffset + diff}` : s.id
            } as SpellingSuggestion;
          }
          return s;
        })
    );
  }, [editor]);

  // Handle dismissing suggestions
  const handleDismissSuggestion = useCallback((suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);

  // Sync local title state when the currentDocument changes (e.g., switching files or first load)
  useEffect(() => {
    setTitle(currentDocument?.title || '');
  }, [currentDocument?.title]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const wordCount = editor.storage.characterCount.words();
  const characterCount = editor.storage.characterCount.characters();

  // Update metrics with real-time counts from editor
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      wordCount,
      characterCount
    }));
  }, [wordCount, characterCount]);

  return (
    <div className="flex h-full">
      {/* Main Editor */}
      <div className={`flex-1 ${showSidebar ? 'mr-4' : ''}`}>
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden h-full">
          {/* Editor Toolbar */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setTitle(newTitle);
                  onTitleChange(newTitle);
                }}
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
                {suggestions.length > 0 && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>{suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}</span>
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
          <div className="min-h-[500px] flex-1">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Suggestion Sidebar */}
      {showSidebar && (
        <div className="h-full">
          <SuggestionSidebar
            suggestions={suggestions}
            metrics={metrics}
            onApplySuggestion={handleApplySuggestion}
            onDismissSuggestion={handleDismissSuggestion}
          />
        </div>
      )}
    </div>
  );
};

export default TextEditor; 