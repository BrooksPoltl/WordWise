import { markdown } from '@codemirror/lang-markdown';
import {
    Compartment,
    EditorState,
    Extension,
    RangeSetBuilder
} from '@codemirror/state';
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
} from '@codemirror/view';
import { autoUpdate, offset, shift, useFloating } from '@floating-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHarperLinter } from '../../hooks/useHarperLinter';
import { useSuggestionStore } from '../../store/suggestion/suggestion.store';
import { AnySuggestion } from '../../store/suggestion/suggestion.types';
import { wordwiseTheme } from '../../themes/wordwiseTheme';
import SuggestionPopover from './SuggestionPopover';

const suggestionDecoration = (suggestion: AnySuggestion) =>
  Decoration.mark({
    class: 'harper-suggestion',
    attributes: {
      'data-suggestion-id': suggestion.id,
      'data-suggestion-type': suggestion.type,
    },
  });

const buildDecorations = (
  view: EditorView,
  suggestions: AnySuggestion[],
): DecorationSet => {
  const builder = new RangeSetBuilder<Decoration>();
  for (const s of suggestions) {
    if (s.startOffset < view.viewport.to && s.endOffset > view.viewport.from) {
      builder.add(s.startOffset, s.endOffset, suggestionDecoration(s));
    }
  }
  return builder.finish();
};

const suggestionDecorations = (suggestions: AnySuggestion[]) =>
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = buildDecorations(view, suggestions);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = buildDecorations(update.view, suggestions);
        }
      }
    },
    {
      decorations: (v: { decorations: DecorationSet }) => v.decorations,
    },
  );

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
  const decorationsCompartment = useRef(new Compartment());
  const { linter, forceReLint } = useHarperLinter({
    toString: () => initialContent,
  });

  const [content, setContent] = useState(initialContent);
  const [activeSuggestion, setActiveSuggestion] =
    useState<AnySuggestion | null>(null);

  const spellingSuggestions = useSuggestionStore(state => state.spelling);

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
      setContent(newContent);
      onChange?.(newContent);
    },
    [onChange],
  );

  const handleApplySuggestion = useCallback((_suggestion: AnySuggestion) => {
    // TODO: Re-implement suggestion application without the deprecated method.
    // This will likely involve dispatching a transaction to the editor view.
    // For now, this function is a no-op.
  }, []);

  const handleIgnoreSuggestion = useCallback(
    async (suggestionToIgnore: AnySuggestion) => {
      // Duck-typing to check if it's a valid HarperLint object
      if (
        linter &&
        suggestionToIgnore.raw &&
        typeof suggestionToIgnore.raw.span === 'function' &&
        typeof suggestionToIgnore.raw.suggestions === 'function'
      ) {
        await linter.ignoreLint(content, suggestionToIgnore.raw);
        setActiveSuggestion(null);
        forceReLint();
      }
    },
    [linter, content, forceReLint],
  );

  const handleEditorClick = useCallback(
    (event: MouseEvent) => {
      const suggestionElement = (event.target as HTMLElement).closest(
        '[data-suggestion-id]',
      );

      if (suggestionElement) {
        const suggestionId =
          suggestionElement.getAttribute('data-suggestion-id');
        const suggestion = spellingSuggestions.find(s => s.id === suggestionId);

        if (suggestion) {
          const domRect = suggestionElement.getBoundingClientRect();
          refs.setReference({
            getBoundingClientRect: () => domRect,
          });
          setActiveSuggestion(suggestion);
          return true;
        }
      }

      setActiveSuggestion(null);
      return false;
    },
    [spellingSuggestions, refs],
  );

  const clickHandlerRef = useRef(handleEditorClick);
  useEffect(() => {
    clickHandlerRef.current = handleEditorClick;
  }, [handleEditorClick]);

  // This useEffect is for creating and destroying the editor instance.
  useEffect(() => {
    if (!editorRef.current) return () => {};

    const extensions: Extension[] = [
      EditorView.lineWrapping,
      markdown(),
      wordwiseTheme,
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          handleContentChange(update.state.doc.toString());
        }
      }),
      EditorView.domEventHandlers({
        click: event => clickHandlerRef.current(event),
      }),
      EditorView.contentAttributes.of({ placeholder: placeholder ?? '' }),
      decorationsCompartment.current.of(suggestionDecorations([])),
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
  }, []);

  // This effect is responsible for updating the decorations from the store
  useEffect(() => {
    if (!viewRef.current) return;

    viewRef.current.dispatch({
      effects: decorationsCompartment.current.reconfigure(
        suggestionDecorations(spellingSuggestions),
      ),
    });
  }, [spellingSuggestions]);

  return (
    <div className="relative w-full h-full">
      <div ref={editorRef} className="w-full h-full" />
      {activeSuggestion && (
        <SuggestionPopover
          ref={refs.setFloating as React.Ref<HTMLDivElement>}
          suggestion={activeSuggestion}
          onAccept={handleApplySuggestion}
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