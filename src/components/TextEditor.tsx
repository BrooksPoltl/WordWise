import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { Editor, EditorContent } from '@tiptap/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useAutoSave } from '../hooks/useAutoSave';
import { useSpellCheck } from '../hooks/useSpellCheck';
import { useTextEditor } from '../hooks/useTextEditor';
import { useToneAnalysis } from '../hooks/useToneAnalysis';
import { useDocumentStore } from '../store/document/document.store';
import {
  AnySuggestion,
  SuggestionCategory,
} from '../store/suggestion/suggestion.types';
import {
  ConcisenessSuggestion,
  ReadabilitySuggestion,
  SpellingSuggestion,
  SuggestionOption,
} from '../types';
import EditorHeader from './editor/EditorHeader';
import EditorToolbar from './editor/EditorToolbar';
import SuggestionPopover from './editor/SuggestionPopover';
import ToneModal from './editor/ToneModal';

interface TextEditorProps {
  documentId: string;
  onTitleChange: (title: string) => void;
  setEditor: (editor: Editor | null) => void;
  suggestions: AnySuggestion[];
  suggestionVisibility: Record<SuggestionCategory, boolean>;
}

interface PopoverState {
  isOpen: boolean;
  suggestion: AnySuggestion | null;
  from: number;
  to: number;
}

const TextEditor: React.FC<TextEditorProps> = ({
  documentId,
  onTitleChange,
  setEditor,
  suggestions,
  suggestionVisibility,
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
  useSpellCheck({ editor });
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

  const [popoverState, setPopoverState] = useState<PopoverState>({
    isOpen: false,
    suggestion: null,
    from: 0,
    to: 0,
  });

  const { refs, floatingStyles, context } = useFloating({
    placement: 'top',
    whileElementsMounted: autoUpdate,
    middleware: [offset(10), flip(), shift()],
    open: popoverState.isOpen,
    onOpenChange: open => setPopoverState(p => ({ ...p, isOpen: open })),
  });

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      onTitleChange(newTitle);
    },
    [setTitle, onTitleChange],
  );

  useEffect(() => {
    setEditor(editor);
  }, [editor, setEditor]);

  useEffect(() => {
    setTitle(currentDocument?.title || '');
  }, [currentDocument?.title, setTitle]);

  useEffect(() => {
    if (editor) {
      editor.storage.suggestionDecorations.updateDecorations(
        editor,
        suggestions,
        suggestionVisibility,
      );
    }
  }, [editor, suggestions, suggestionVisibility]);

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
    }: {
      editor: Editor;
    }) => {
      if (isProgrammaticUpdate.current) {
        isProgrammaticUpdate.current = false;
        return;
      }
      const text = editorInstance.getText();
      debouncedSave(text);
      detectTone(text);
    };

    editor.on('transaction', handleUpdate);

    return () => {
      editor.off('transaction', handleUpdate);
    };
  }, [
    editor,
    isProgrammaticUpdate,
    debouncedSave,
    detectTone,
  ]);

  useEffect(() => {
    if (!editor?.view.dom) return undefined;

    const handleSuggestionClick = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { suggestion, from, to } = customEvent.detail;

      if (!suggestion) return;

      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);

      refs.setPositionReference({
        getBoundingClientRect: () => ({
          width: end.left - start.left,
          height: end.bottom - start.top,
          x: start.left,
          y: start.top,
          top: start.top,
          left: start.left,
          right: end.right,
          bottom: end.bottom,
        }),
      });

      setPopoverState({
        isOpen: true,
        suggestion,
        from,
        to,
      });
    };

    const editorDom = editor.view.dom;
    editorDom.addEventListener('suggestionClick', handleSuggestionClick);

    return () => {
      editorDom.removeEventListener(
        'suggestionClick',
        handleSuggestionClick,
      );
    };
  }, [editor, refs]);

  const handleAcceptSuggestion = (suggestion: AnySuggestion) => {
    if (!editor) return;

    const isReplacementSuggestion = (
      s: AnySuggestion,
    ): s is
      | (SpellingSuggestion & { suggestions: SuggestionOption[] })
      | (ConcisenessSuggestion & { suggestions: SuggestionOption[] })
      | (ReadabilitySuggestion & { suggestions: SuggestionOption[] }) =>
      (s.type === 'spelling' ||
        s.type === 'conciseness' ||
        s.type === 'readability') &&
      s.suggestions !== undefined &&
      s.suggestions.length > 0;

    if (isReplacementSuggestion(suggestion)) {
      const replacementText = suggestion.suggestions[0].text;
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          tr.replaceWith(popoverState.from, popoverState.to, editor.schema.text(replacementText));
          return true;
        })
        .run();

      setPopoverState({
        isOpen: false,
        suggestion: null,
        from: 0,
        to: 0,
      });
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 relative">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden h-full">
          <div className="border-b border-gray-200 p-4">
            <EditorHeader
              title={title}
              onTitleChange={handleTitleChange}
              loading={loading}
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
        {popoverState.isOpen && popoverState.suggestion && (
          <SuggestionPopover
            ref={refs.setFloating}
            suggestion={popoverState.suggestion}
            onAccept={handleAcceptSuggestion}
            onDismiss={() =>
              setPopoverState(p => ({ ...p, isOpen: false, suggestion: null }))
            }
            style={floatingStyles}
            context={context}
          />
        )}
      </div>

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
