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
    // This is a developer-facing error, console.warn is appropriate
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
  const decorations = suggestions.flatMap(suggestion => {
    const from = offsetToPos(doc, suggestion.startOffset);
    const to = offsetToPos(doc, suggestion.endOffset);

    if (from === null || to === null) {
      return [];
    }

    let cssClass = 'spell-error'; // Default
    if (suggestion.type === 'weasel_word') {
      cssClass = 'clarity-error';
    } else if (suggestion.type === 'conciseness') {
      cssClass = 'conciseness-error';
    } else if (suggestion.type === 'readability') {
      cssClass = 'readability-error';
    }

    return Decoration.inline(
      from,
      to,
      {
        class: cssClass,
        'data-suggestion-id': suggestion.id,
      },
      { suggestion },
    );
  });

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
          if (s.type === 'conciseness')
            return visibleSuggestionTypes.includes('conciseness');
          if (s.type === 'readability')
            return visibleSuggestionTypes.includes('readability');
          return visibleSuggestionTypes.includes('spelling');
        });

        // Validate suggestions against the current document
        const validSuggestions = visibleSuggestions.filter(suggestion => {
          const from = offsetToPos(editor.state.doc, suggestion.startOffset);
          const to = offsetToPos(editor.state.doc, suggestion.endOffset);

          if (
            from === null ||
            to === null ||
            from >= to ||
            to > editor.state.doc.content.size
          ) {
            return false;
          }

          // For readability suggestions, the offsets are the source of truth,
          // as direct text comparison of long sentences is brittle.
          if (suggestion.type === 'readability') {
            return true;
          }

          try {
            const actualText = editor.state.doc.textBetween(from, to);
            const suggestionText =
              'word' in suggestion ? suggestion.word : suggestion.text;
            
            return actualText.toLowerCase() === suggestionText.toLowerCase();

          } catch (e) {
            return false;
          }
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
            if (
              target.closest(
                '.spell-error, .clarity-error, .conciseness-error, .readability-error',
              )
            ) {
              const decorations =
                suggestionPluginKey.getState(view.state)?.decorations;
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