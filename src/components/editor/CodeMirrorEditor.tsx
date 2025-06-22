import { defaultKeymap } from '@codemirror/commands';
import { Diagnostic } from '@codemirror/lint';
import { EditorState, Extension, Prec } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { autoUpdate, offset, shift, useFloating } from '@floating-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  createSuggestionDecorationExtension,
  dispatchSuggestionUpdate
} from '../../extensions/SuggestionDecorations';
import { WysiwygDecorations } from '../../extensions/WysiwygDecorations';
import { useEditorStore } from '../../store/editor/editor.store';
import { useSuggestionStore } from '../../store/suggestion/suggestion.store';
import { AnySuggestion, SuggestionStore } from '../../store/suggestion/suggestion.types';
import { wordwiseTheme } from '../../themes/wordwiseTheme';
import { GrammarSuggestion, SuggestionAction } from '../../types';
import {
  createHarperLinterPlugin,
  harperDiagnostics,
} from '../../utils/harperLinterSource';
import SuggestionPopover from './SuggestionPopover';

const convertDiagnosticToGrammarSuggestion = (
  diagnostic: Diagnostic,
): GrammarSuggestion => {
  try {
    const { title, text, type } = JSON.parse(diagnostic.message);
    return {
      id: `${diagnostic.from}-${diagnostic.to}-${text}`,
      text,
      startOffset: diagnostic.from,
      endOffset: diagnostic.to,
      word: '', // Will be populated from the actual text
      type: type || 'grammar',
      title: title || 'Grammar',
      explanation: text, // Use the parsed text as explanation
      actions: diagnostic.actions?.map(action => ({
        type: 'replace' as const,
        text: action.name,
      })) || [],
      suggestions:
        diagnostic.actions?.map(action => ({
          id: action.name,
          text: action.name,
        })) || [],
      raw: diagnostic, // Storing the raw diagnostic for actions
    };
  } catch (e) {
    // Fallback for messages that are not JSON
    return {
      id: `${diagnostic.from}-${diagnostic.to}-${diagnostic.message}`,
      text: diagnostic.message,
      startOffset: diagnostic.from,
      endOffset: diagnostic.to,
      word: '', // Will be populated from the actual text
      type: 'grammar',
      title: 'Grammar', // Default title for CodeMirror diagnostics
      explanation: diagnostic.message, // Use the message as explanation
      actions: diagnostic.actions?.map(action => ({
        type: 'replace' as const,
        text: action.name,
      })) || [],
      suggestions:
        diagnostic.actions?.map(action => ({
          id: action.name,
          text: action.name,
        })) || [],
      raw: diagnostic, // Storing the raw diagnostic for actions
    };
  }
};

export interface CodeMirrorEditorRef {
  view: EditorView | null;
}

interface CodeMirrorEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  suggestionStore: SuggestionStore;
  onViewReady?: (view: EditorView) => void;
}

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  initialContent = '',
  onChange,
  placeholder = 'Start writing...',
  suggestionStore,
  onViewReady,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { setSuggestions } = useSuggestionStore();
  const editorMode = useEditorStore((state) => state.mode);

  const analysisSessionRef = useRef<object | null>(null);
  const suggestionInteractionLock = useRef(false);

  const [activeSuggestion, setActiveSuggestion] =
    useState<AnySuggestion | null>(null);

  const { x, y, refs, strategy } = useFloating({
    open: !!activeSuggestion,
    onOpenChange: isOpen => {
      if (!isOpen) {
        setActiveSuggestion(null);
        suggestionInteractionLock.current = false;
      }
    },
    placement: 'top',
    strategy: 'fixed',
    middleware: [offset(8), shift()],
    whileElementsMounted: autoUpdate,
  });

  const handleContentChange = useCallback(
    (newContent: string) => {
      onChange?.(newContent);
    },
    [onChange],
  );

  // Race-condition-safe suggestion setter
  const setSuggestionsWithSession = useCallback((suggestions: Parameters<SuggestionStore['setSuggestions']>[0] | ((setter: (results: Parameters<SuggestionStore['setSuggestions']>[0]) => void) => void)) => {
    const currentSession = {};
    analysisSessionRef.current = currentSession;
    
    // Create a wrapper that checks session validity
    const sessionAwareSetter = (results: Parameters<SuggestionStore['setSuggestions']>[0]) => {
      // Only update if this is still the current session
      if (analysisSessionRef.current === currentSession) {
        setSuggestions(results);
      }
      // Silently ignore stale results
    };
    
    // If suggestions is a function (callback style), wrap it
    if (typeof suggestions === 'function') {
      suggestions(sessionAwareSetter);
      return;
    }
    // Direct call
    sessionAwareSetter(suggestions);
  }, [setSuggestions]);

  // Find suggestion at a given position - create a stable version for the editor
  const findSuggestionAtPosStable = useCallback((pos: number): AnySuggestion | null => {
    // Get current suggestions directly without depending on getVisibleSuggestions
    const { grammar, clarity, conciseness, readability, passive, visibility } = suggestionStore;
    const allSuggestions: AnySuggestion[] = [
      ...(visibility.grammar ? grammar : []),
      ...(visibility.clarity ? clarity : []),
      ...(visibility.conciseness ? conciseness : []),
      ...(visibility.readability ? readability : []),
      ...(visibility.passive ? passive : []),
    ];
    return allSuggestions.find(
      suggestion => suggestion.startOffset <= pos && suggestion.endOffset >= pos
    ) || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to keep it stable for editor - intentionally not including suggestionStore

  // Update decorations when suggestion store changes
  useEffect(() => {
    if (viewRef.current) {
      const allSuggestions = [
        ...suggestionStore.grammar,
        ...suggestionStore.clarity,
        ...suggestionStore.conciseness,
        ...suggestionStore.readability,
        ...suggestionStore.passive,
      ];
      
      dispatchSuggestionUpdate(
        viewRef.current,
        allSuggestions,
        suggestionStore.visibility
      );
    }
  }, [suggestionStore]);

  // Clear activeSuggestion if it no longer exists in the store
  useEffect(() => {
    if (suggestionInteractionLock.current) return;

    if (activeSuggestion) {
      // Get all current suggestions from store
      const { grammar, clarity, conciseness, readability, passive } = suggestionStore;
      const allCurrentSuggestions: AnySuggestion[] = [
        ...grammar,
        ...clarity, 
        ...conciseness,
        ...readability,
        ...passive,
      ];
      
      // Check if the active suggestion still exists
      const stillExists = allCurrentSuggestions.some(s => s.id === activeSuggestion.id);
      
      if (!stillExists) {
        setActiveSuggestion(null); // Clear stale suggestion
      }
    }
  }, [suggestionStore, activeSuggestion]);

  // This effect synchronizes the editor content with the `initialContent` prop.
  // It's crucial for scenarios where the document is loaded asynchronously.
  useEffect(() => {
    if (viewRef.current && initialContent !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: initialContent,
        },
      });
    }
  }, [initialContent]);

  useEffect(() => {
    if (!editorRef.current) return () => {};

    const extensions: Extension[] = [
      EditorView.lineWrapping,
      wordwiseTheme,
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          handleContentChange(update.state.doc.toString());
          // Clear active suggestion on document changes to prevent stale positions
          // This ensures we don't have stale popover positions
          setActiveSuggestion(null);
        }
      }),
      EditorView.contentAttributes.of({ placeholder: placeholder ?? '' }),
      createHarperLinterPlugin(setSuggestionsWithSession),
      harperDiagnostics,
      createSuggestionDecorationExtension(),
      Prec.high(EditorView.domEventHandlers({
        click: (event: MouseEvent, view: EditorView) => {
          const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
          if (pos === null) return;

          const storeSuggestion = findSuggestionAtPosStable(pos);
          if (storeSuggestion) {
            event.preventDefault();
            event.stopPropagation();
            suggestionInteractionLock.current = true;
            refs.setReference({
              getBoundingClientRect: () => {
                const rect = view.coordsAtPos(pos);
                if (!rect) {
                  return new DOMRect(0, 0, 0, 0);
                }
                return {
                  width: rect.right - rect.left,
                  height: rect.bottom - rect.top,
                  x: rect.left,
                  y: rect.top,
                  top: rect.top,
                  left: rect.left,
                  right: rect.right,
                  bottom: rect.bottom,
                };
              },
            });
            setActiveSuggestion(storeSuggestion);
            return;
          }

          const diagnostics = view.state.field(harperDiagnostics);
          const clickedDiagnostic = diagnostics.find(
            d => d.from <= pos && d.to >= pos,
          );

          if (clickedDiagnostic) {
            event.preventDefault();
            event.stopPropagation();
            suggestionInteractionLock.current = true;
            const suggestion = convertDiagnosticToGrammarSuggestion(clickedDiagnostic);

            refs.setReference({
              getBoundingClientRect: () => {
                const rect = view.coordsAtPos(pos);
                if (!rect) {
                  return new DOMRect(0, 0, 0, 0);
                }
                return {
                  width: rect.right - rect.left,
                  height: rect.bottom - rect.top,
                  x: rect.left,
                  y: rect.top,
                  top: rect.top,
                  left: rect.left,
                  right: rect.right,
                  bottom: rect.bottom,
                };
              },
            });
            setActiveSuggestion(suggestion);
            return;
          } 
          
          setActiveSuggestion(null);
        },
      })),
      Prec.high(keymap.of(defaultKeymap)),
    ];

    if (editorMode === 'wysiwyg') {
      extensions.push(WysiwygDecorations());
    }

    const startState = EditorState.create({
      doc: initialContent,
      extensions,
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;
    onViewReady?.(view);
    
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent, placeholder, handleContentChange, findSuggestionAtPosStable, setSuggestionsWithSession, onViewReady, editorMode]); // refs accessed directly in click handler

  // Handle suggestion actions
  const handleAcceptSuggestion = useCallback(
    (suggestion: AnySuggestion, action?: SuggestionAction) => {
      if (!viewRef.current) return;

      // Use the provided action if available, otherwise default to the first action
      const selectedAction =
        action ||
        ('actions' in suggestion &&
          suggestion.actions &&
          suggestion.actions.length > 0
          ? suggestion.actions[0]
          : undefined);

      if (selectedAction) {
        const view = viewRef.current;
        switch (selectedAction.type) {
          case 'replace':
            view.dispatch({
              changes: {
                from: suggestion.startOffset,
                to: suggestion.endOffset,
                insert: selectedAction.text,
              },
            });
            break;
          case 'remove':
            view.dispatch({
              changes: {
                from: suggestion.startOffset,
                to: suggestion.endOffset,
                insert: '',
              },
            });
            break;
          case 'insert_after':
            view.dispatch({
              changes: {
                from: suggestion.endOffset,
                to: suggestion.endOffset,
                insert: selectedAction.text,
              },
            });
            break;
          default:
            // Unknown action type, do nothing
            break;
        }
      }
      // Handle legacy grammar suggestions with raw diagnostics
      else if ('raw' in suggestion) {
        const grammarSuggestion = suggestion as GrammarSuggestion;
        const legacyAction = grammarSuggestion.raw.actions?.find(
          (a: { name: string }) =>
            a.name === grammarSuggestion.suggestions?.[0]?.text,
        );
        if (legacyAction) {
          legacyAction.apply(
            viewRef.current,
            grammarSuggestion.startOffset,
            grammarSuggestion.endOffset,
          );
        }
      }

      setActiveSuggestion(null);
    },
    [],
  );

  const handleIgnoreSuggestion = useCallback((suggestion: AnySuggestion) => {
    if (!viewRef.current) return;

    // Handle legacy grammar suggestions with ignore action
    if ('raw' in suggestion) {
      const grammarSuggestion = suggestion as GrammarSuggestion;
      const ignoreAction = grammarSuggestion.raw.actions?.find(
        (a: { name: string }) => a.name === 'Ignore',
      );
      if (ignoreAction) {
        ignoreAction.apply(
          viewRef.current,
          grammarSuggestion.startOffset,
          grammarSuggestion.endOffset,
        );
      }
    }

    setActiveSuggestion(null);
  }, []);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={editorRef} 
        className="w-full h-full"
        style={{
          minHeight: '200px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px'
        }}
      />
      {activeSuggestion && (
        <SuggestionPopover
          ref={refs.setFloating as React.Ref<HTMLDivElement>}
          suggestion={activeSuggestion}
          onAccept={handleAcceptSuggestion}
          onIgnore={handleIgnoreSuggestion}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            zIndex: 100,
          }}
        />
      )}
    </div>
  );
};

CodeMirrorEditor.displayName = 'CodeMirrorEditor';

export default CodeMirrorEditor; 