import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useDocumentStore } from '../store/documentStore';
import { useAuthStore } from '../store/authStore';
import { SpellingSuggestion, WritingMetrics } from '../types';
import { spellChecker } from '../utils/spellChecker';
import { 
  getSuggestionIdFromElement,
  highlightSpecificSuggestion,
  removeSpellingHighlights
} from '../utils/textHighlighter';
import SpellErrorMark from '../extensions/SpellErrorMark';
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

  // Flag to avoid recursive updates when we dispatch transactions that only manipulate marks
  const isApplyingMarksRef = useRef(false);
  const lastSuggestionsSignatureRef = useRef('');

  // Convert a plain-text offset to a ProseMirror position
  const getPosFromPlainOffset = useCallback((editorInstance: any, offset: number): number | null => {
    let result: number | null = null;
    let accumulated = 0;
    editorInstance.state.doc.descendants((node: any, posHere: number) => {
      if (node.isText) {
        const nextAccum = accumulated + node.text.length;
        if (offset < nextAccum) {
          // Position of this character inside the document is the start of the
          // text node (posHere) plus the character index within that node.
          result = posHere + (offset - accumulated);
          return false; // stop traversal
        }
        accumulated = nextAccum;
      }
      return true;
    });
    return result;
  }, []);

  const applySpellErrorMarks = useCallback((editorInstance: any, suggestionsList: SpellingSuggestion[]) => {
    // Compute a simple signature of suggestions to avoid redundant transactions
    const newSignature = suggestionsList
      .map(({ id, startOffset, endOffset }) => `${id}-${startOffset}-${endOffset}`)
      .join('|');

    if (newSignature === lastSuggestionsSignatureRef.current) {
      return; // nothing changed
    }

    const { state, view } = editorInstance;
    const markType = state.schema.marks.spellError;
    if (!markType) return;

    let tr = state.tr;
    // Clear previous error marks
    tr = tr.removeMark(0, state.doc.content.size, markType);

    suggestionsList.forEach(({ id, startOffset, endOffset }) => {
      const from = getPosFromPlainOffset(editorInstance, startOffset);
      const to = getPosFromPlainOffset(editorInstance, endOffset);
      if (from !== null && to !== null && from < to) {
        tr = tr.addMark(from, to, markType.create({ suggestionId: id }));
      }
    });

    if (tr.docChanged || tr.storedMarks || tr.steps.length) {
      isApplyingMarksRef.current = true;
      view.dispatch(tr);
      lastSuggestionsSignatureRef.current = newSignature;
    }
  }, [getPosFromPlainOffset]);

  const clearSpellErrorMarks = useCallback((editorInstance: any) => {
    const { state, view } = editorInstance;
    const markType = state.schema.marks.spellError;
    if (!markType) return;
    const tr = state.tr.removeMark(0, state.doc.content.size, markType);
    if (tr.docChanged) {
      isApplyingMarksRef.current = true;
      view.dispatch(tr);
    }
    lastSuggestionsSignatureRef.current = '';
  }, []);

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
      SpellErrorMark,
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
    // Strip highlighting before saving
    const contentToSave = removeSpellingHighlights(content);
    debouncedSave(contentToSave);
    
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
      
      // Apply highlighting to the editor content
      if (editor && filteredSuggestions.length > 0) {
        applySpellErrorMarks(editor, filteredSuggestions);
      } else if (editor) {
        clearSpellErrorMarks(editor);
      }
    });
  }, [debouncedSave, dismissedSuggestions, editor, applySpellErrorMarks, clearSpellErrorMarks]);

  // Set up editor update handler
  useEffect(() => {
    if (editor) {
      const handleUpdate = ({ editor }: { editor: any }) => {
        if (isApplyingMarksRef.current) {
          // Reset flag and ignore this synthetic update
          isApplyingMarksRef.current = false;
          return;
        }
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

  // Handle applying suggestions with simplified logic
  const handleApplySuggestion = useCallback((suggestion: SpellingSuggestion, replacement: string) => {
    if (!editor) return;

    // Remove all highlighting first
    clearSpellErrorMarks(editor);
    
    // Find and replace the word using plain text approach
    const plainText = editor.getText();
    const wordStart = plainText.indexOf(suggestion.word);
    if (wordStart !== -1) {
      const replacementFrom = wordStart + 1; // Tiptap is 1-based
      const replacementTo = wordStart + suggestion.word.length + 1;
      
      editor.chain()
        .setTextSelection({ from: replacementFrom, to: replacementTo })
        .insertContent(replacement)
        .run();
    }

    // Use the simplified spell checker service to update suggestions
    setSuggestions(prev => spellChecker.applySuggestion(prev, suggestion, replacement));
    
    // Trigger a new spell check to update highlighting
    setTimeout(() => {
      const content = editor.getHTML();
      handleTextChange(content);
    }, 100);
  }, [editor, handleTextChange, clearSpellErrorMarks]);

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
          <div 
            className="min-h-[500px] flex-1"
            onClick={(e) => {
              // Handle clicks on highlighted spelling errors
              const target = e.target as HTMLElement;
              const suggestionId = getSuggestionIdFromElement(target);
              if (suggestionId) {
                const suggestion = suggestions.find(s => s.id === suggestionId);
                if (suggestion) {
                  // Highlight the suggestion in the sidebar and scroll to it
                  highlightSpecificSuggestion(suggestionId);
                  const suggestionElement = document.querySelector(`[data-sidebar-suggestion="${suggestionId}"]`);
                  if (suggestionElement) {
                    suggestionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }
              }
            }}
          >
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