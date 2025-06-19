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
import { useSuggestionStore } from '../store/suggestion/suggestion.store';
import { SpellingSuggestion } from '../types';
import { logger } from '../utils/logger';
import EditorHeader from './editor/EditorHeader';
import EditorToolbar from './editor/EditorToolbar';
import SuggestionPopover from './editor/SuggestionPopover';
import ToneModal from './editor/ToneModal';

interface TextEditorProps {
  documentId: string;
  onTitleChange: (title: string) => void;
}

interface PopoverState {
  isOpen: boolean;
  suggestion: SpellingSuggestion | null;
  from: number;
  to: number;
}

const TextEditor: React.FC<TextEditorProps> = ({
  documentId,
  onTitleChange,
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
  const spellingSuggestions = useSuggestionStore(state => state.spelling);
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
    setTitle(currentDocument?.title || '');
  }, [currentDocument?.title, setTitle]);

  useEffect(() => {
    if (editor) {
      editor.storage.spellCheckDecorations.updateDecorations(
        editor,
        spellingSuggestions,
      );
    }
  }, [editor, spellingSuggestions]);

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

      logger.debug('Setting popover state', { from, to, suggestion });
      setPopoverState({
        isOpen: true,
        suggestion,
        from,
        to,
      });
    };

    const editorDom = editor.view.dom;
    editorDom.addEventListener('spellSuggestionClick', handleSuggestionClick);

    return () => {
      editorDom.removeEventListener(
        'spellSuggestionClick',
        handleSuggestionClick,
      );
    };
  }, [editor, refs]);

  const handleAcceptSuggestion = (suggestion: SpellingSuggestion) => {
    if (!editor || !suggestion.suggestions.length) return;

    const replacement = suggestion.suggestions[0].text;
    const { from, to } = popoverState;

    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        tr.replaceWith(from, to, editor.schema.text(replacement));
        return true;
      })
      .run();

    setPopoverState({
      isOpen: false,
      suggestion: null,
      from: 0,
      to: 0,
    });
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
            style={floatingStyles}
            suggestion={popoverState.suggestion}
            onAccept={handleAcceptSuggestion}
            onDismiss={() =>
              setPopoverState(prev => ({ ...prev, isOpen: false }))
            }
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
