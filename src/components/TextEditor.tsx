import { Transaction } from '@tiptap/pm/state';
import { ReplaceStep } from '@tiptap/pm/transform';
import { Editor, EditorContent } from '@tiptap/react';
import React, { useCallback, useEffect } from 'react';
import { EDITOR_CONFIG } from '../constants/editorConstants';
import { useAutoSave } from '../hooks/useAutoSave';
import { useSpellCheck } from '../hooks/useSpellCheck';
import { useTextEditor } from '../hooks/useTextEditor';
import { useToneAnalysis } from '../hooks/useToneAnalysis';
import { useDocumentStore } from '../store/document/document.store';
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
  const { currentDocument, loading } = useDocumentStore();
  const { debouncedSave } = useAutoSave(documentId);
  const {
    editor,
    title,
    setTitle,
    wordCount,
    characterCount,
    updateContent,
    isProgrammaticUpdate,
  } = useTextEditor({
    initialContent: currentDocument?.content || '',
  });
  const {
    suggestions,
    metrics,
    checkWord,
    handleApplySuggestion,
    handleDismissSuggestion,
    checkText,
  } = useSpellCheck({
    editor,
    documentId,
  });
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

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      onTitleChange(newTitle);
    },
    [setTitle, onTitleChange],
  );

  useEffect(() => {
    setTitle(currentDocument?.title || '');
  }, [currentDocument?.title, setTitle]);

  useEffect(() => {
    if (currentDocument?.content) {
      updateContent(currentDocument.content);
    }
  }, [currentDocument?.content, updateContent]);

  // Set up editor update handler
  useEffect(() => {
    if (!editor) return undefined;

    const handleUpdate = ({
      editor: editorInstance,
      transaction,
    }: {
      editor: Editor;
      transaction: Transaction;
    }) => {
      if (isProgrammaticUpdate.current) {
        isProgrammaticUpdate.current = false;
        return;
      }
      const text = editorInstance.getText();
      debouncedSave(text);
      detectTone(text);

      if (transaction.docChanged && transaction.steps.length > 0) {
        const lastStep = transaction.steps[transaction.steps.length - 1];
        if (lastStep instanceof ReplaceStep && lastStep.slice.size > 0) {
          const insertedText = lastStep.slice.content.textBetween(
            0,
            lastStep.slice.content.size,
            '',
          );
          if (insertedText.trim() === '' && insertedText.includes(' ')) {
            const cursorPosition = lastStep.from;
            const textBeforeCursor = text.slice(0, cursorPosition);
            const match = textBeforeCursor.match(/(\w+)$/);
            if (match) {
              const word = match[1];
              const startOffset = cursorPosition - word.length;
              checkWord(word, startOffset);
            }
          }
        }
      }
    };

    editor.on('transaction', handleUpdate);

    const pasteHandler = () => {
      setTimeout(() => {
        checkText(editor.getText());
      }, EDITOR_CONFIG.PASTE_CHECK_DELAY);
    };
    editor.view.dom.addEventListener('paste', pasteHandler);

    return () => {
      editor.off('transaction', handleUpdate);
      editor.view.dom.removeEventListener('paste', pasteHandler);
    };
  }, [
    editor,
    isProgrammaticUpdate,
    debouncedSave,
    detectTone,
    checkWord,
    checkText,
  ]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className={`flex-1 ${showSidebar ? 'mr-4' : ''}`}>
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden h-full">
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

          <div className="min-h-[500px] flex-1">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

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
