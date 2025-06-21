import { Diagnostic } from '@codemirror/lint';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { autoUpdate, offset, shift, useFloating } from '@floating-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    createSuggestionDecorationExtension,
    dispatchSuggestionUpdate
} from '../../extensions/SuggestionDecorations';
import { useSuggestionStore } from '../../store/suggestion/suggestion.store';
import { AnySuggestion, SuggestionStore } from '../../store/suggestion/suggestion.types';
import { wordwiseTheme } from '../../themes/wordwiseTheme';
import { GrammarSuggestion } from '../../types';
import {
    createHarperLinterPlugin,
    harperDiagnostics,
    harperLintDeco
} from '../../utils/harperLinterSource';
import SuggestionPopover from './SuggestionPopover';

const convertDiagnosticToGrammarSuggestion = (
  diagnostic: Diagnostic,
): GrammarSuggestion => ({
  id: `${diagnostic.from}-${diagnostic.to}-${diagnostic.message}`,
  text: diagnostic.message,
  startOffset: diagnostic.from,
  endOffset: diagnostic.to,
  word: '', // Will be populated from the actual text
  type: 'grammar',
  title: 'Grammar', // Default title for CodeMirror diagnostics
  suggestions: diagnostic.actions?.map((action) => ({
    id: action.name,
    text: action.name,
  })) || [],
  raw: diagnostic, // Storing the raw diagnostic for actions
});

interface CodeMirrorEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  suggestionStore: SuggestionStore;
}

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  initialContent = '',
  onChange,
  placeholder = 'Start writing...',
  suggestionStore,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { setSuggestions } = useSuggestionStore();

  const [activeSuggestion, setActiveSuggestion] =
    useState<AnySuggestion | null>(null);

  const { x, y, refs, strategy, context } = useFloating({
    open: !!activeSuggestion,
    onOpenChange: isOpen => {
      if (!isOpen) {
        setActiveSuggestion(null);
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

  useEffect(() => {
    if (!editorRef.current) return () => {};

    const extensions: Extension[] = [
      EditorView.lineWrapping,
      wordwiseTheme,
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          handleContentChange(update.state.doc.toString());
        }
      }),
      EditorView.contentAttributes.of({ placeholder: placeholder ?? '' }),
      // Use the new factory function to create Harper plugin with suggestion store integration
      createHarperLinterPlugin(setSuggestions),
      harperLintDeco,
      harperDiagnostics,
      createSuggestionDecorationExtension(),
      EditorView.domEventHandlers({
        click: (event: MouseEvent, view: EditorView) => {
          const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
          if (pos === null) return;

          // First try to find a suggestion from our store
          const storeSuggestion = findSuggestionAtPosStable(pos);
          if (storeSuggestion) {
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

          // Fallback to Harper diagnostics (for direct Harper integration)
          const diagnostics = view.state.field(harperDiagnostics);
          const clickedDiagnostic = diagnostics.find(
            d => d.from <= pos && d.to >= pos,
          );

          if (clickedDiagnostic) {
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
          } else {
            setActiveSuggestion(null);
          }
        },
      }),
    ];

    const startState = EditorState.create({
      doc: initialContent,
      extensions,
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;
    
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent, placeholder, handleContentChange, findSuggestionAtPosStable, setSuggestions]); // refs accessed directly in click handler

  // Handle suggestion actions
  const handleAcceptSuggestion = useCallback((suggestion: AnySuggestion) => {
    if (!viewRef.current) return;

    // Handle Harper suggestions with actions
    if ('actions' in suggestion && suggestion.actions && suggestion.actions.length > 0) {
      const firstAction = suggestion.actions[0];
      const view = viewRef.current;
      
      switch (firstAction.type) {
        case 'replace':
          view.dispatch({
            changes: {
              from: suggestion.startOffset,
              to: suggestion.endOffset,
              insert: firstAction.text,
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
              insert: firstAction.text,
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
      const action = grammarSuggestion.raw.actions?.find(
        (a: { name: string }) => a.name === grammarSuggestion.suggestions?.[0]?.text,
      );
      if (action) {
        action.apply(
          viewRef.current,
          grammarSuggestion.startOffset,
          grammarSuggestion.endOffset,
        );
      }
    }

    setActiveSuggestion(null);
  }, []);

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
          onDismiss={() => setActiveSuggestion(null)}
          onIgnore={handleIgnoreSuggestion}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            zIndex: 100,
          }}
          context={context}
        />
      )}
    </div>
  );
};

export default CodeMirrorEditor; 