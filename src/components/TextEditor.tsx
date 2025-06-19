import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { Editor, EditorContent } from '@tiptap/react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAutoSave } from '../hooks/useAutoSave';
import { useSuggestions } from '../hooks/useSuggestions';
import { useTextEditor } from '../hooks/useTextEditor';
import { useToneAnalysis } from '../hooks/useToneAnalysis';
import { useDocumentStore } from '../store/document/document.store';
import { useSuggestionStore } from '../store/suggestion/suggestion.store';
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
  suggestionVisibility: Record<SuggestionCategory, boolean>;
}

interface PopoverState {
  isOpen: boolean;
  suggestionId: string | null;
  from: number;
  to: number;
}

const TextEditor: React.FC<TextEditorProps> = ({
  documentId,
  onTitleChange,
  setEditor,
  suggestionVisibility,
}) => {
  const { currentDocument, loading } = useDocumentStore();
  const { debouncedSave } = useAutoSave(documentId);
  const contentSetRef = useRef(false);
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
    detectedTone,
    selectedTone,
    isToneModalOpen,
    refactoredContent,
    detectTone,
    handleToneSelection,
    applyRefactoredContent,
    closeToneModal,
  } = useToneAnalysis({ editor });

  useSuggestions({ editor });

  const [popoverState, setPopoverState] = useState<PopoverState>({
    isOpen: false,
    suggestionId: null,
    from: 0,
    to: 0,
  });
  const [hoveredSuggestionId, setHoveredSuggestionId] = useState<string | null>(
    null,
  );

  const visibilityRef = useRef(suggestionVisibility);
  useEffect(() => {
    visibilityRef.current = suggestionVisibility;
  }, [suggestionVisibility]);

  const { spelling, clarity, conciseness, readability } = useSuggestionStore(
    state => ({
      spelling: state.spelling,
      clarity: state.clarity,
      conciseness: state.conciseness,
      readability: state.readability,
    }),
    (oldState, newState) =>
      JSON.stringify(oldState) === JSON.stringify(newState),
  );

  const allSuggestionsFromStore = useMemo(
    () => [...spelling, ...clarity, ...conciseness, ...readability],
    [spelling, clarity, conciseness, readability],
  );

  const activeSuggestion = popoverState.suggestionId
    ? allSuggestionsFromStore.find(s => s.id === popoverState.suggestionId)
    : null;

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
        visibilityRef.current,
        hoveredSuggestionId,
      );
    }
  }, [editor, allSuggestionsFromStore, hoveredSuggestionId]);

  useEffect(() => {
    if (currentDocument?.content && !contentSetRef.current) {
      updateContent(currentDocument.content);
      contentSetRef.current = true;
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
        suggestionId: suggestion.id,
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

  useEffect(() => {
    if (!editor?.view.dom) return undefined;

    const editorDom = editor.view.dom;

    const handleSuggestionHover = (event: Event) => {
      const customEvent = event as CustomEvent;
      setHoveredSuggestionId(customEvent.detail.suggestionId);
    };

    const handleSuggestionLeave = () => {
      setHoveredSuggestionId(null);
    };

    editorDom.addEventListener('suggestionHover', handleSuggestionHover);
    editorDom.addEventListener('suggestionLeave', handleSuggestionLeave);

    return () => {
      editorDom.removeEventListener('suggestionHover', handleSuggestionHover);
      editorDom.removeEventListener('suggestionLeave', handleSuggestionLeave);
    };
  }, [editor]);

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
        suggestionId: null,
        from: 0,
        to: 0,
      });
    }
  };

  if (loading || !editor) {
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
        {popoverState.isOpen && activeSuggestion && (
          <SuggestionPopover
            ref={refs.setFloating}
            suggestion={activeSuggestion}
            onAccept={handleAcceptSuggestion}
            onDismiss={() => setPopoverState(p => ({ ...p, isOpen: false }))}
            style={floatingStyles}
            context={context}
          />
        )}
      </div>

      <ToneModal
        isOpen={isToneModalOpen}
        onClose={closeToneModal}
        refactoredContent={refactoredContent}
        onApply={applyRefactoredContent}
        selectedTone={selectedTone}
      />
    </div>
  );
};

export default TextEditor;
