import { Diagnostic } from '@codemirror/lint';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { autoUpdate, offset, shift, useFloating } from '@floating-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnySuggestion } from '../../store/suggestion/suggestion.types';
import { wordwiseTheme } from '../../themes/wordwiseTheme';
import { GrammarSuggestion } from '../../types';
import {
    harperDiagnostics,
    harperLintDeco,
    harperLinterPlugin
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
}

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  initialContent = '',
  onChange,
  placeholder = 'Start writing...',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

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
      harperLinterPlugin,
      harperLintDeco,
      harperDiagnostics,
      EditorView.domEventHandlers({
        click: (event: MouseEvent, view: EditorView) => {
          const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
          if (pos === null) return;

          const diagnostics = view.state.field(harperDiagnostics);
          const clickedDiagnostic = diagnostics.find(
            d => d.from <= pos && d.to >= pos,
          );

          if (clickedDiagnostic) {
            const suggestion = convertDiagnosticToGrammarSuggestion(clickedDiagnostic);

            // This is the magic. We set the floating-ui reference to a virtual
            // element that represents the clicked text.
            refs.setReference({
              getBoundingClientRect: () => {
                const rect = view.coordsAtPos(pos);
                if (!rect) {
                  return new DOMRect(0, 0, 0, 0);
                }
                // Construct a DOMRect-like object for floating-ui
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
  }, [initialContent, placeholder, handleContentChange, refs]);

  return (
    <div className="relative w-full h-full">
      <div ref={editorRef} className="w-full h-full" />
      {activeSuggestion && (
        <SuggestionPopover
          ref={refs.setFloating as React.Ref<HTMLDivElement>}
          suggestion={activeSuggestion}
          onAccept={suggestion => {
            if (!('raw' in suggestion)) return;
            const grammarSuggestion = suggestion as GrammarSuggestion;
            const action = grammarSuggestion.raw.actions?.find(
              (a: { name: string }) => a.name === grammarSuggestion.suggestions?.[0]?.text,
            );
            if (action && viewRef.current) {
              action.apply(
                viewRef.current,
                grammarSuggestion.startOffset,
                grammarSuggestion.endOffset,
              );
              setActiveSuggestion(null);
            }
          }}
          onDismiss={() => setActiveSuggestion(null)}
          onIgnore={suggestion => {
            if (!('raw' in suggestion)) return;
            const grammarSuggestion = suggestion as GrammarSuggestion;
            const ignoreAction = grammarSuggestion.raw.actions?.find(
              (a: { name: string }) => a.name === 'Ignore',
            );
            if (ignoreAction && viewRef.current) {
              ignoreAction.apply(
                viewRef.current,
                grammarSuggestion.startOffset,
                grammarSuggestion.endOffset,
              );
              setActiveSuggestion(null);
            }
          }}
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