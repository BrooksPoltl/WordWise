import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SpellCheckDecorations,
  getSuggestionById,
} from '../extensions/SpellCheckDecorations';
import { useDocumentStore } from '../store/documentStore';
import { SpellingSuggestion, Tone, WritingMetrics } from '../types';
import { spellChecker } from '../utils/spellChecker';
import { toneAnalyzer } from '../utils/toneAnalyzer';
import SuggestionSidebar from './SuggestionSidebar';

interface TextEditorProps {
  documentId: string;
  onTitleChange: (title: string) => void;
  showSidebar?: boolean;
}

const TextEditor: React.FC<TextEditorProps> = ({
  documentId,
  onTitleChange,
  showSidebar = true,
}) => {
  const { currentDocument, updateDocument, loading } = useDocumentStore();
  const [suggestions, setSuggestions] = useState<SpellingSuggestion[]>([]);
  const [metrics, setMetrics] = useState<WritingMetrics>({
    wordCount: 0,
    characterCount: 0,
    spellingErrors: 0,
  });
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [title, setTitle] = useState<string>(currentDocument?.title || '');
  const [detectedTone, setDetectedTone] = useState<Tone | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
  const [isToneModalOpen, setIsToneModalOpen] = useState(false);
  const [refactoredContent, setRefactoredContent] = useState<string>('');

  const contentRef = useRef(currentDocument?.content);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  contentRef.current = currentDocument?.content;

  // Debounced save function
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
      }, 3000); // Save after 3 seconds of inactivity
    },
    [documentId, updateDocument]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
      CharacterCount,
      SpellCheckDecorations,
    ],
    content: currentDocument?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-6',
      },
    },
  });

  // Handle spell checking and text changes
  const handleTextChange = useCallback(
    (content: string) => {
      debouncedSave(content);

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

      // Trigger tone detection (debounced inside service)
      toneAnalyzer.detectTone(plainTextForSpellCheck, tone => {
        if (tone) {
          setDetectedTone(tone);
        }
      });
    },
    [debouncedSave, editor]
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

  // Update editor content when document changes
  useEffect(() => {
    if (editor && currentDocument) {
      const editorContent = editor.getHTML();
      const storeContent = currentDocument.content || '';

      if (storeContent !== editorContent) {
        // Content has changed from another source, so update the editor
        editor.commands.setContent(storeContent, false);
        handleTextChange(storeContent);
      }
    }
  }, [editor, currentDocument, handleTextChange]);

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

      // Trigger a new spell check
      setTimeout(() => {
        const content = editor.getHTML();
        handleTextChange(content);
      }, 100);
    },
    [editor, handleTextChange]
  );

  // Handle dismissing suggestions
  const handleDismissSuggestion = useCallback((suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);

  // Sync local title state when the currentDocument changes
  useEffect(() => {
    setTitle(currentDocument?.title || '');
  }, [currentDocument?.title]);

  // Handle paste events
  useEffect(() => {
    if (!editor) return undefined;
    
    const pasteHandler = () => {
      setTimeout(() => {
        handleTextChange(editor.getHTML());
      }, 100);
    };
    editor.view.dom.addEventListener('paste', pasteHandler);
    return () => {
      editor.view.dom.removeEventListener('paste', pasteHandler);
    };
  }, [editor, handleTextChange]);

  // Handle space-triggered spell check
  useEffect(() => {
    if (!editor) return undefined;

    const keydownHandler = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        setTimeout(() => {
          if (!editor.view.hasFocus()) return;

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
        }, 50);
      }
    };

    editor.view.dom.addEventListener('keydown', keydownHandler);
    return () => {
      editor.view.dom.removeEventListener('keydown', keydownHandler);
    };
  }, [editor, dismissedSuggestions]);

  // Handle spell suggestion clicks
  useEffect(() => {
    if (!editor) return undefined;

    const handleSpellClick = (event: CustomEvent) => {
      const { suggestionId } = event.detail;
      const suggestion = getSuggestionById(suggestions, suggestionId);
      if (suggestion && suggestion.suggestions.length > 0) {
        // Auto-apply the first suggestion for now
        // You could show a dropdown menu here instead
        handleApplySuggestion(suggestion, suggestion.suggestions[0]);
      }
    };

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
  }, [editor, suggestions, handleApplySuggestion]);

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

  // Get counts safely
  const wordCount = editor?.storage.characterCount.words() || 0;
  const characterCount = editor?.storage.characterCount.characters() || 0;

  // Update metrics with real-time counts from editor
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      wordCount,
      characterCount,
    }));
  }, [wordCount, characterCount]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Tone related helpers
  const TONE_OPTIONS: Tone[] = [
    'Formal',
    'Informal',
    'Friendly',
    'Professional',
    'Humorous',
    'Serious',
    'Academic',
    'Conversational',
    'Persuasive',
    'Empathetic',
  ];

  const toneEmojiMap: Record<Tone, string> = {
    Formal: '🎓',
    Informal: '😎',
    Friendly: '😊',
    Professional: '💼',
    Humorous: '😂',
    Serious: '🧐',
    Academic: '📚',
    Conversational: '🗨️',
    Persuasive: '🗣️',
    Empathetic: '🤗',
  } as const;

  const handleToneSelection = async (tone: Tone) => {
    if (!editor) return;
    setSelectedTone(tone);
    try {
      const rewritten = await toneAnalyzer.rewriteText(editor.getText(), tone);
      setRefactoredContent(rewritten);
      setIsToneModalOpen(true);
    } catch (error) {
      console.error('Tone rewrite failed:', error);
    }
  };

  const applyRefactoredContent = () => {
    if (editor && refactoredContent && selectedTone) {
      // Convert plain text with newlines to HTML preserving paragraphs and line breaks
      const htmlContent = refactoredContent
        .split(/\n{2,}/) // paragraphs separated by blank lines
        .map(paragraph => {
          // within paragraph replace single newlines with <br/>
          const withBreaks = paragraph.replace(/\n/g, '<br />');
          return `<p>${withBreaks}</p>`;
        })
        .join('');

      editor.commands.setContent(htmlContent, false);
      // Update detected tone to reflect new selection immediately
      setDetectedTone(selectedTone);
      setIsToneModalOpen(false);
      setSelectedTone(null);
    }
  };

  const closeToneModal = () => {
    setIsToneModalOpen(false);
  };

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
                onChange={e => {
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
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
                    <span>Saving...</span>
                  </div>
                )}
                {suggestions.length > 0 && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>
                      {suggestions.length} suggestion
                      {suggestions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                {/* Tone indicator */}
                {detectedTone && (
                  <div
                    role="button"
                    tabIndex={0}
                    className="flex items-center space-x-1 cursor-pointer"
                    title="Click to change tone"
                    onClick={() => handleToneSelection(detectedTone as Tone)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleToneSelection(detectedTone as Tone);
                      }
                    }}
                  >
                    <span>{toneEmojiMap[detectedTone]}</span>
                    <span>{detectedTone}</span>
                  </div>
                )}
                <span>{wordCount} words</span>
                <span>{characterCount} characters</span>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center space-x-2">
              <button type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  editor.isActive('bold')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                B
              </button>
              <button type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-3 py-1 rounded text-sm font-medium italic transition-colors ${
                  editor.isActive('italic')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                I
              </button>
              <button type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`px-3 py-1 rounded text-sm font-medium line-through transition-colors ${
                  editor.isActive('strike')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                S
              </button>

              <div className="w-px h-6 bg-gray-300" />

              <button type="button"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  editor.isActive('heading', { level: 1 })
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                H1
              </button>
              <button type="button"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  editor.isActive('heading', { level: 2 })
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                H2
              </button>
              <button type="button"
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  editor.isActive('paragraph')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                P
              </button>

              <div className="w-px h-6 bg-gray-300" />

              <button type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  editor.isActive('bulletList')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                • List
              </button>
              <button type="button"
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

            {/* Tone selection dropdown */}
            <div className="mt-2">
              <label
                htmlFor="tone-select"
                className="mr-2 text-sm text-gray-600"
              >
                Tone:
                <select
                  id="tone-select"
                  className="ml-2 border border-gray-300 rounded p-1 text-sm"
                  value={(selectedTone || detectedTone || '') as string}
                  onChange={e => handleToneSelection(e.target.value as Tone)}
                >
                  <option value="" disabled>
                    Select tone
                  </option>
                  {TONE_OPTIONS.map(tone => (
                    <option key={tone} value={tone}>
                      {tone}
                    </option>
                  ))}
                </select>
              </label>
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

      {/* Tone Modal */}
      {isToneModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
            <h2 className="text-lg font-semibold mb-4">
              Preview {selectedTone} Tone
            </h2>
            <div className="h-96 overflow-y-auto border border-gray-200 rounded p-4 mb-4 whitespace-pre-wrap">
              {refactoredContent}
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button"
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={closeToneModal}
              >
                Cancel
              </button>
              <button type="button"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={applyRefactoredContent}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEditor;
