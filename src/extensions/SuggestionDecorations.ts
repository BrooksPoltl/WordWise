import { Editor, Extension } from '@tiptap/core';
import { Node } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import {
  AnySuggestion,
  SuggestionCategory,
} from '../store/suggestion/suggestion.types';

type SuggestionType = SuggestionCategory | 'weasel_word' | 'grammar' | 'style';

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

function getSuggestionType(suggestion: AnySuggestion): SuggestionType {
  return suggestion.type;
}

const suggestionPriority: SuggestionType[] = [
  'readability',
  'clarity', // Generic clarity
  'weasel_word', // Specific clarity
  'conciseness',
  'spelling',
];

function createPrioritizedDecorations(
  doc: Node,
  suggestions: AnySuggestion[],
): DecorationSet {
  const docSize = doc.content.size;
  const charToSuggestion = new Array<AnySuggestion | null>(docSize).fill(null);
  const priorityMap = new Map(suggestionPriority.map((s, i) => [s, i]));

  // 1. "Paint" the character map with the highest priority suggestion for each spot
  suggestions.forEach(suggestion => {
    const from = offsetToPos(doc, suggestion.startOffset);
    const to = offsetToPos(doc, suggestion.endOffset);
    if (from === null || to === null) return;

    const currentPriority = priorityMap.get(getSuggestionType(suggestion)) ?? -1;

    for (let i = from; i < to; i += 1) {
      const existingSuggestion = charToSuggestion[i];
      if (existingSuggestion) {
        const existingPriority =
          priorityMap.get(getSuggestionType(existingSuggestion)) ?? -1;
        if (currentPriority > existingPriority) {
          charToSuggestion[i] = suggestion;
        }
      } else {
        charToSuggestion[i] = suggestion;
      }
    }
  });

  // 2. Merge consecutive characters with the same suggestion into decorations
  const decorations: Decoration[] = [];
  let i = 0;
  while (i < docSize) {
    const suggestion = charToSuggestion[i];
    if (suggestion) {
      let j = i;
      while (
        j < docSize &&
        charToSuggestion[j]?.id === suggestion.id
      ) {
        j += 1;
      }

      let cssClass = 'spell-error'; // Default
      const type = getSuggestionType(suggestion);
      if (type === 'weasel_word') {
        cssClass = 'clarity-error';
      } else if (type === 'conciseness') {
        cssClass = 'conciseness-error';
      } else if (type === 'readability') {
        cssClass = 'readability-error';
      }

      decorations.push(
        Decoration.inline(i, j, {
          class: cssClass,
          'data-suggestion-id': suggestion.id,
        }, { suggestion }),
      );
      i = j;
    } else {
      i += 1;
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

        const decorations = createPrioritizedDecorations(
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
              const pluginState = suggestionPluginKey.getState(view.state);
              if (!pluginState) return false;

              const clickedDecorations = pluginState.decorations.find(pos, pos);

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