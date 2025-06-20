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
import { useAuthStore } from '../store/auth/auth.store';
import { useDocumentStore } from '../store/document/document.store';
import { useSuggestionStore } from '../store/suggestion/suggestion.store';
import {
    AnySuggestion
} from '../store/suggestion/suggestion.types';
import {
    ConcisenessSuggestion,
    PassiveSuggestion,
    ReadabilitySuggestion,
    SpellingSuggestion,
    SuggestionOption
} from '../types';
import { getSentenceBoundaries } from '../utils/sentenceBoundaries';
import { AdvisoryModal } from './editor/AdvisoryModal';
import DocumentSettingsBar from './editor/DocumentSettingsBar';
import EditorHeader from './editor/EditorHeader';
import EditorToolbar from './editor/EditorToolbar';
import SuggestionPopover from './editor/SuggestionPopover';
import UpdateContextModal from './editor/UpdateContextModal';


interface TextEditorProps {
  documentId: string;
  onTitleChange: (title: string) => void;
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
}) => {
  const { user } = useAuthStore();
  const { currentDocument, loading, updateDocument } = useDocumentStore();
  const { debouncedSave } = useAutoSave(documentId);
  const contentSetRef = useRef(false);
  const {
    editor,
    title,
    setTitle,
    updateContent,
    isProgrammaticUpdate,
  } = useTextEditor({
    initialContent: currentDocument?.content || '',
  });
  const {
    detectedTone,
    detectTone,
  } = useToneAnalysis();

  const { visibility } = useSuggestionStore(state => ({
    visibility: state.visibility,
  }));
  useSuggestions({ editor });

  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [popoverState, setPopoverState] = useState<PopoverState>({
    isOpen: false,
    suggestionId: null,
    from: 0,
    to: 0,
  });
  const [hoveredSuggestionId, setHoveredSuggestionId] = useState<string | null>(
    null,
  );

  const visibilityRef = useRef(visibility);
  useEffect(() => {
    visibilityRef.current = visibility;
  }, [visibility]);

  const { spelling, clarity, conciseness, readability, passive } =
    useSuggestionStore(
      state => ({
        spelling: state.spelling,
        clarity: state.clarity,
        conciseness: state.conciseness,
        readability: state.readability,
        passive: state.passive,
      }),
      (oldState, newState) =>
        oldState.spelling === newState.spelling &&
        oldState.clarity === newState.clarity &&
        oldState.conciseness === newState.conciseness &&
        oldState.readability === newState.readability &&
        oldState.passive === newState.passive,
    );

  const allSuggestionsFromStore = useMemo(
    () => [
      ...spelling,
      ...clarity,
      ...conciseness,
      ...readability,
      ...passive,
    ],
    [spelling, clarity, conciseness, readability, passive],
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

  const handleContextSave = async (newContext: string) => {
    if (!documentId) return;
    await updateDocument({
      id: documentId,
      context: newContext,
    });
    setIsContextModalOpen(false);
  };

  const handleDocumentTypeChange = async (newType: string) => {
    if (!documentId) {
      return;
    }
    
    try {
      await updateDocument({
        id: documentId,
        documentType: newType,
      });
    } catch (error) {
      // Error handling is done in the updateDocument function
    }
  };

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
  }, [editor, allSuggestionsFromStore, hoveredSuggestionId, visibility]);

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
      | (ReadabilitySuggestion & { suggestions: SuggestionOption[] })
      | (PassiveSuggestion & { suggestions: SuggestionOption[] }) =>
      (s.type === 'spelling' ||
        s.type === 'conciseness' ||
        s.type === 'readability' ||
        s.type === 'passive') &&
      s.suggestions !== undefined &&
      s.suggestions.length > 0;

    if (isReplacementSuggestion(suggestion)) {
      const replacementText = suggestion.suggestions[0].text;
      
      // For passive suggestions only, replace the entire sentence
      if (suggestion.type === 'passive') {
        const currentText = editor.getText();
        const { start, end } = getSentenceBoundaries(
          currentText, 
          suggestion.startOffset, 
          suggestion.endOffset
        );
        
        // Remove trailing punctuation from AI response since original sentence has it
        const cleanedReplacementText = replacementText.replace(/[.!?]$/, '');
        
        editor
          .chain()
          .focus()
          .command(({ tr }) => {
            tr.replaceWith(start, end, editor.schema.text(cleanedReplacementText));
            return true;
          })
          .run();
      } else {
        // For spelling, conciseness, and readability, replace just the highlighted text
        editor
          .chain()
          .focus()
          .command(({ tr }) => {
            tr.replaceWith(popoverState.from, popoverState.to, editor.schema.text(replacementText));
            return true;
          })
          .run();
      }

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
    <div className="flex flex-col h-full bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <EditorHeader
          title={title}
          onTitleChange={handleTitleChange}
          loading={loading}
          detectedTone={detectedTone}
          documentContent={editor?.getText() || ''}
        />
        <EditorToolbar editor={editor} />
        <DocumentSettingsBar
          onOpenContextModal={() => setIsContextModalOpen(true)}
          currentDocumentType={currentDocument?.documentType}
          userRole={user?.role}
          onDocumentTypeChange={handleDocumentTypeChange}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {editor && (
          <EditorContent editor={editor} />
        )}
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
      <UpdateContextModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        onSave={handleContextSave}
        initialContext={currentDocument?.context || ''}
        loading={loading}
      />
      <AdvisoryModal />
    </div>
  );
};

export default TextEditor;
