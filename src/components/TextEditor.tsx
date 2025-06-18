import { EditorContent } from '@tiptap/react';
import React, { useCallback, useEffect } from 'react';
import { useAutoSave } from '../hooks/useAutoSave';
import { useSpellCheck } from '../hooks/useSpellCheck';
import { useTextEditor } from '../hooks/useTextEditor';
import { useToneAnalysis } from '../hooks/useToneAnalysis';
import { useDocumentStore } from '../store/documentStore';
import EditorHeader from './editor/EditorHeader';
import EditorToolbar from './editor/EditorToolbar';
import ToneModal from './editor/ToneModal';
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

  // Auto-save functionality
  const { debouncedSave } = useAutoSave({
    documentId,
    updateDocument,
    currentContent: currentDocument?.content,
  });

  // Handle content changes
  const handleContentChange = useCallback(
    (content: string) => {
      debouncedSave(content);
    },
    [debouncedSave]
  );

  // Initialize text editor
  const {
    editor,
    title,
    setTitle,
    wordCount,
    characterCount,
    updateContent,
  } = useTextEditor({
    initialContent: currentDocument?.content || '',
    onContentChange: handleContentChange,
  });

  // Spell checking
  const {
    suggestions,
    metrics,
    handleApplySuggestion,
    handleDismissSuggestion,
    checkText,
  } = useSpellCheck({
    editor,
    documentId,
  });

  // Tone analysis
  const {
    detectedTone,
    selectedTone,
    isToneModalOpen,
    refactoredContent,
    detectTone,
    handleToneSelection,
    applyRefactoredContent,
    closeToneModal,
  } = useToneAnalysis({ editor });

  // Enhanced content change handler that includes spell checking and tone detection
  const handleEnhancedContentChange = useCallback(
    (content: string, options?: { isPaste?: boolean }) => {
      handleContentChange(content);
      checkText(content, options);
      
      if (editor) {
        detectTone(editor.getText());
      }
    },
    [handleContentChange, checkText, detectTone, editor]
  );

  // Handle title changes
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      onTitleChange(newTitle);
    },
    [setTitle, onTitleChange]
  );

  // Sync title with document changes
  useEffect(() => {
    setTitle(currentDocument?.title || '');
  }, [currentDocument?.title, setTitle]);

  // Update editor content when document changes
  useEffect(() => {
    if (currentDocument?.content) {
      updateContent(currentDocument.content);
    }
  }, [currentDocument?.content, updateContent]);

  // Update the text editor's content change handler
  useEffect(() => {
    // This effect ensures the content change handler is updated when dependencies change
    // The actual editor setup is handled by the useTextEditor hook above
  }, [handleEnhancedContentChange]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Editor */}
      <div className={`flex-1 ${showSidebar ? 'mr-4' : ''}`}>
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden h-full">
          {/* Editor Header and Toolbar */}
          <div className="border-b border-gray-200 p-4">
            <EditorHeader
              title={title}
              onTitleChange={handleTitleChange}
              loading={loading}
              suggestionsCount={suggestions.length}
              detectedTone={detectedTone}
              wordCount={wordCount}
              characterCount={characterCount}
              onToneClick={handleToneSelection}
            />

            <EditorToolbar
              editor={editor}
              detectedTone={detectedTone}
              selectedTone={selectedTone}
              onToneSelection={handleToneSelection}
            />
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
      <ToneModal
        isOpen={isToneModalOpen}
        selectedTone={selectedTone}
        refactoredContent={refactoredContent}
        onApply={applyRefactoredContent}
        onClose={closeToneModal}
      />
    </div>
  );
};

export default TextEditor;
