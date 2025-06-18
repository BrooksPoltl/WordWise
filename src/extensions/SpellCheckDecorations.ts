import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { SpellingSuggestion } from '../types';

interface SpellCheckState {
  suggestions: SpellingSuggestion[];
  decorations: DecorationSet;
}

const spellCheckPluginKey = new PluginKey<SpellCheckState>('spellCheck');

/**
 * Convert plain text offset to ProseMirror document position
 */
function offsetToPos(doc: any, offset: number): number | null {
  let textOffset = 0;
  let result: number | null = null;

  try {
    doc.descendants((node: any, nodePos: number) => {
      if (node.isText) {
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
 * Create decorations from spell suggestions
 */
function createDecorations(
  doc: any,
  suggestions: SpellingSuggestion[]
): DecorationSet {
  const decorations: Decoration[] = [];

  for (const suggestion of suggestions) {
    const from = offsetToPos(doc, suggestion.startOffset);
    const to = offsetToPos(doc, suggestion.endOffset);

    if (from !== null && to !== null && from < to && to <= doc.content.size) {
      // Validate that the text at these positions matches the expected word
      try {
        const actualText = doc.textBetween(from, to);
        if (actualText === suggestion.word) {
          decorations.push(
            Decoration.inline(from, to, {
              class: 'spell-error',
              'data-suggestion-id': suggestion.id,
              title: 'Click to see suggestions',
            })
          );
        }
      } catch (error) {
        console.warn('Error validating spell suggestion:', error);
      }
    }
  }

  return DecorationSet.create(doc, decorations);
}

/**
 * Spell Check Decorations Extension
 * Uses ProseMirror's decoration system for robust spell checking highlights
 */
export const SpellCheckDecorations = Extension.create({
  name: 'spellCheckDecorations',

  addStorage() {
    return {
      suggestions: [] as SpellingSuggestion[],
      updateDecorations: (editor: any, suggestions: SpellingSuggestion[]) => {
        const decorations = createDecorations(editor.state.doc, suggestions);
        const tr = editor.state.tr.setMeta(spellCheckPluginKey, {
          suggestions,
          decorations,
        });
        editor.view.dispatch(tr);
      },
      clearDecorations: (editor: any) => {
        const tr = editor.state.tr.setMeta(spellCheckPluginKey, {
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
        key: spellCheckPluginKey,

        state: {
          init(): SpellCheckState {
            return {
              suggestions: [],
              decorations: DecorationSet.empty,
            };
          },

          apply(tr, pluginState) {
            // Check if we have new suggestions from meta
            const meta = tr.getMeta(spellCheckPluginKey);
            if (meta) {
              return meta as SpellCheckState;
            }

            // Map existing decorations through document changes
            if (tr.docChanged) {
              const mappedDecorations = pluginState.decorations.map(
                tr.mapping,
                tr.doc
              );
              return {
                ...pluginState,
                decorations: mappedDecorations,
              };
            }

            return pluginState;
          },
        },

        props: {
          decorations(state) {
            const pluginState = spellCheckPluginKey.getState(state);
            return pluginState?.decorations || DecorationSet.empty;
          },

          handleClick(view, pos, event) {
            const target = event.target as HTMLElement;
            if (target?.classList.contains('spell-error')) {
              const suggestionId = target.getAttribute('data-suggestion-id');
              if (suggestionId) {
                // Emit custom event that the component can listen to
                const customEvent = new CustomEvent('spellSuggestionClick', {
                  detail: { suggestionId, pos },
                });
                view.dom.dispatchEvent(customEvent);
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});

// Helper function to get suggestion by ID
export function getSuggestionById(
  suggestions: SpellingSuggestion[],
  id: string
): SpellingSuggestion | undefined {
  return suggestions.find(s => s.id === id);
}
