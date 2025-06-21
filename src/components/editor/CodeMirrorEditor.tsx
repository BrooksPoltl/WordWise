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
import {
    getLinter,
    Lint,
    HarperLintConfig as LintConfig,
} from '../../utils/harperLinter';
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
  config?: LintConfig;
}

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  initialContent = '',
  onChange,
  placeholder = 'Start writing...',
  config,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const decorationsCompartment = useRef(new Compartment());

  const [content, setContent] = useState(initialContent);
  const [activeSuggestion, setActiveSuggestion] =
    useState<AnySuggestion | null>(null);

  useHarperLinter(content, config);

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
      const linter = await getLinter();

      if (
        linter &&
        'raw' in suggestionToIgnore &&
        suggestionToIgnore.raw instanceof Lint
      ) {
        await linter.ignoreLint(content, suggestionToIgnore.raw);
        setActiveSuggestion(null);
      }
    },
    [content],
  );

  const handleEditorClick = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const suggestionElement = target.closest('.harper-suggestion');

      if (suggestionElement) {
        const suggestionId =
          suggestionElement.getAttribute('data-suggestion-id');
        const suggestion = spellingSuggestions.find(s => s.id === suggestionId);

        if (suggestion) {
          // Set the reference for Floating UI
          refs.setReference({
            getBoundingClientRect: () => suggestionElement.getBoundingClientRect(),
          });
          setActiveSuggestion(suggestion);
          return true; // We handled it, but don't prevent default
        }
      }

      // If we click anywhere else, close the popover.
      setActiveSuggestion(null);
      return false;
    },
    [spellingSuggestions, refs],
  );

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
        click: event => handleEditorClick(event),
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