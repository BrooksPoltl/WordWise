import { Editor, Extension } from '@tiptap/core';
import { Node } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { AnySuggestion } from '../store/suggestion/suggestion.types';

interface SuggestionState {
  suggestions: AnySuggestion[];
  decorations: DecorationSet;
}

const suggestionPluginKey = new PluginKey<SuggestionState>('suggestions');

/**
 * Convert plain text offset to ProseMirror document position
 */
function offsetToPos(doc: Node, offset: number): number | null {
  let textOffset = 0;
  let result: number | null = null;
  
  try {
    doc.descendants((node: Node, nodePos: number) => {
      if (node.isText && typeof node.text === 'string') {
        const nodeStart = textOffset;
        const nodeEnd = textOffset + node.text.length;
        
        if (offset >= nodeStart && offset <= nodeEnd) {
          result = nodePos + (offset - nodeStart);
          return false; // Stop iteration
        }
        textOffset = nodeEnd;
      }
      return true; // Continue iteration
    });
    
    return result;
  } catch (error) {
    console.warn('Error converting offset to position:', error);
    return null;
  }
}

/**
 * Create decorations from spell suggestions with better validation
 */
function createDecorations(
  doc: Node,
  suggestions: AnySuggestion[],
): DecorationSet {
  const decorations: Decoration[] = [];
  const validSuggestions: AnySuggestion[] = [];
  
  for (const suggestion of suggestions) {
    const from = offsetToPos(doc, suggestion.startOffset);
    const to = offsetToPos(doc, suggestion.endOffset);
    
    if (from !== null && to !== null && from < to && to <= doc.content.size) {
      // Validate that the text at these positions matches the expected word
      try {
        const actualText = doc.textBetween(from, to);
        const suggestionText = 'word' in suggestion ? suggestion.word : suggestion.text;
        if (actualText.toLowerCase() === suggestionText.toLowerCase()) {
          validSuggestions.push(suggestion);
          const cssClass =
            suggestion.type === 'weasel_word' ? 'clarity-error' : 'spell-error';
          decorations.push(
            Decoration.inline(
              from,
              to,
              {
                class: cssClass,
                'data-suggestion-id': suggestion.id,
              },
              { suggestion },
            ),
          );
        } else {
          console.warn(
            `Suggestion text mismatch: expected "${suggestionText}", found "${actualText}" at ${from}-${to}`,
          );
        }
      } catch (error) {
        console.warn('Error validating suggestion:', error);
      }
    } else {
      console.warn(
        `Invalid position for suggestion "${
          'word' in suggestion ? suggestion.word : suggestion.text
        }": ${from}-${to} (doc size: ${doc.content.size})`,
      );
    }
  }
  
  return DecorationSet.create(doc, decorations);
}

/**
 * Suggestion Decorations Extension
 * Uses ProseMirror's decoration system for robust suggestion highlights
 */
export const SuggestionDecorations = Extension.create({
  name: 'suggestionDecorations',

  addStorage() {
    return {
      suggestions: [] as AnySuggestion[],
      updateDecorations: (
        editor: Editor,
        suggestions: AnySuggestion[],
        visibility: { [key: string]: boolean },
      ) => {
        const visibleSuggestionTypes = Object.entries(visibility)
          .filter(([, isVisible]) => isVisible)
          .map(([type]) => type);

        const visibleSuggestions = suggestions.filter(s => {
          if (s.type === 'weasel_word')
            return visibleSuggestionTypes.includes('clarity');
          return visibleSuggestionTypes.includes('spelling');
        });

        // Validate suggestions against the current document
        const validSuggestions = visibleSuggestions.filter(suggestion => {
          const from = offsetToPos(editor.state.doc, suggestion.startOffset);
          const to = offsetToPos(editor.state.doc, suggestion.endOffset);
          return from !== null && to !== null && from < to;
        });

        const decorations = createDecorations(
          editor.state.doc,
          validSuggestions,
        );
        const tr = editor.state.tr.setMeta(suggestionPluginKey, {
          suggestions, // Store all suggestions
          decorations,
        });
        editor.view.dispatch(tr);
      },
      clearDecorations: (editor: Editor) => {
        const tr = editor.state.tr.setMeta(suggestionPluginKey, {
          suggestions: [],
          decorations: DecorationSet.empty,
        });
        editor.view.dispatch(tr);
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: suggestionPluginKey,
        
        state: {
          init(): SuggestionState {
            return {
              suggestions: [],
              decorations: DecorationSet.empty,
            };
          },
          
          apply(tr, pluginState) {
            // Check if we have new suggestions from meta
            const meta = tr.getMeta(suggestionPluginKey);
            if (meta) {
              return meta as SuggestionState;
            }

            // Map existing decorations through document changes
            if (tr.docChanged) {
              const decorations = pluginState.decorations.map(
                tr.mapping,
                tr.doc,
              );
              return { ...pluginState, decorations };
            }

            return pluginState;
          },
        },
        
        props: {
          decorations(state) {
            const pluginState = suggestionPluginKey.getState(state);
            return pluginState?.decorations || DecorationSet.empty;
          },
          
          handleClick(view, pos, event) {
            const target = event.target as HTMLElement;
            if (target.closest('.spell-error') || target.closest('.clarity-error')) {
              const decorations = suggestionPluginKey.getState(view.state)?.decorations;
              if (!decorations) return false;

              const clickedDecorations = decorations.find(pos, pos);

              if (clickedDecorations.length > 0) {
                const clickedDeco = clickedDecorations[0];
                const suggestion = clickedDeco.spec.suggestion as AnySuggestion;

                if (suggestion) {
                  const customEvent = new CustomEvent('suggestionClick', {
                    detail: {
                      suggestion,
                      from: clickedDeco.from,
                      to: clickedDeco.to,
                    },
                  });
                  view.dom.dispatchEvent(customEvent);
                  return true; // We handled the click
                }
              }
            }
            return false; // Click not handled
          },
        },
      }),
    ];
  },
});

// Helper function to get suggestion by ID
export function getSuggestionById(
  suggestions: AnySuggestion[],
  id: string,
): AnySuggestion | undefined {
  return suggestions.find(s => s.id === id);
} 