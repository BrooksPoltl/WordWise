import { markdown } from '@codemirror/lang-markdown';
import { Compartment, EditorState, Extension, RangeSetBuilder, StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet } from '@codemirror/view';
import { EditorView, basicSetup } from 'codemirror';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHarperLinter } from '../../hooks/useHarperLinter';
import { wordwiseTheme } from '../../themes/wordwiseTheme';
import { HarperSuggestion } from '../../types/harper';

// State effect for updating Harper suggestions
const updateSuggestionsEffect = StateEffect.define<HarperSuggestion[]>();

// State field to manage Harper suggestions
const harperSuggestionsField = StateField.define<HarperSuggestion[]>({
  create: () => [],
  update: (suggestions, tr) => {
    for (const effect of tr.effects) {
      if (effect.is(updateSuggestionsEffect)) {
        return effect.value;
      }
    }
    return suggestions;
  },
});

// State field to manage decorations
const harperDecorationsField = StateField.define<DecorationSet>({
  create: () => Decoration.set([]),
  update: (oldDecorations, tr) => {
    let decorations = oldDecorations.map(tr.changes);
    
    for (const effect of tr.effects) {
      if (effect.is(updateSuggestionsEffect)) {
        const suggestions = effect.value;
        const builder = new RangeSetBuilder<Decoration>();
        
        for (const suggestion of suggestions) {
          const decoration = Decoration.mark({
            class: 'harper-suggestion',
            attributes: {
              'data-suggestion-id': suggestion.id,
              'data-suggestion-type': suggestion.type,
              'title': suggestion.message,
            },
          });
          
          builder.add(suggestion.startOffset, suggestion.endOffset, decoration);
        }
        
        decorations = builder.finish();
      }
    }
    
    return decorations;
  },
  provide: field => EditorView.decorations.from(field),
});

interface CodeMirrorEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  onSuggestionClick?: (suggestion: HarperSuggestion, from: number, to: number) => void;
  placeholder?: string;
}

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  initialContent = '',
  onChange,
  onSuggestionClick,
  placeholder = 'Start writing...',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const clickHandlerCompartment = useRef(new Compartment());

  const { lint, state: harperState } = useHarperLinter();
  const [suggestions, setSuggestions] = useState<HarperSuggestion[]>([]);
  
  // Debounced linting
  const lintTimeoutRef = useRef<NodeJS.Timeout>();
  
  const performLinting = useCallback(async (text: string) => {
    if (harperState !== 'ready') return;
    
    try {
      const newSuggestions = await lint(text);
      setSuggestions(newSuggestions);
      
      // Update editor decorations
      if (viewRef.current) {
        viewRef.current.dispatch({
          effects: updateSuggestionsEffect.of(newSuggestions),
        });
      }
    } catch (error) {
      console.error('Linting failed:', error);
    }
  }, [lint, harperState]);
  
  const debouncedLint = useCallback((text: string) => {
    if (lintTimeoutRef.current) {
      clearTimeout(lintTimeoutRef.current);
    }
    
    lintTimeoutRef.current = setTimeout(() => {
      performLinting(text);
    }, 500);
  }, [performLinting]);
  
  // This useEffect is for creating and destroying the editor instance.
  useEffect(() => {
    if (!editorRef.current) return () => {};
    
    const extensions: Extension[] = [
      basicSetup,
      markdown(),
      wordwiseTheme,
      harperSuggestionsField,
      harperDecorationsField,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const text = update.state.doc.toString();
          onChange?.(text);
          debouncedLint(text);
        }
      }),
      clickHandlerCompartment.current.of(EditorView.domEventHandlers({})), // Initial empty handler
      EditorView.contentAttributes.of({ placeholder })
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
    
    // Perform initial linting
    if (initialContent.trim()) {
      debouncedLint(initialContent);
    }
    
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This useEffect is for handling suggestion clicks.
  // It re-configures the click handler when suggestions change.
  useEffect(() => {
    if (!viewRef.current || !onSuggestionClick) return;

    const suggestionClickHandler = (event: MouseEvent, view: EditorView) => {
      const target = event.target as HTMLElement;
      const suggestionElement = target.closest('.harper-suggestion');
      
      if (suggestionElement) {
        const suggestionId = suggestionElement.getAttribute('data-suggestion-id');
        if (suggestionId) {
          const suggestion = suggestions.find(s => s.id === suggestionId);
          if (suggestion) {
            const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
            if (pos !== null) {
              onSuggestionClick(suggestion, suggestion.startOffset, suggestion.endOffset);
            }
          }
          event.stopPropagation();
          event.preventDefault();
          return true;
        }
      }
      return false;
    };

    viewRef.current.dispatch({
      effects: clickHandlerCompartment.current.reconfigure(
        EditorView.domEventHandlers({
          click: suggestionClickHandler,
        })
      ),
    });

  }, [suggestions, onSuggestionClick]);

  // Cleanup timeout on unmount
  useEffect(() => () => {
    if (lintTimeoutRef.current) {
      clearTimeout(lintTimeoutRef.current);
    }
  }, []);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div ref={editorRef} className="min-h-[200px]" />
      {harperState === 'loading' && (
        <div className="p-2 text-sm text-gray-500 bg-gray-50 border-t">
          Loading grammar checker...
        </div>
      )}
      {harperState === 'error' && (
        <div className="p-2 text-sm text-red-600 bg-red-50 border-t">
          Grammar checker failed to load
        </div>
      )}
    </div>
  );
};

export default CodeMirrorEditor; 