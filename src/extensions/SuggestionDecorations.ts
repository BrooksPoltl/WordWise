import { Editor, Extension } from '@tiptap/core';
import { Node } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { useSuggestionStore } from '../store/suggestion/suggestion.store';
import {
  AnySuggestion,
  SuggestionCategory,
} from '../store/suggestion/suggestion.types';

type SuggestionType = SuggestionCategory | 'weasel_word' | 'grammar' | 'style';

const suggestionCategoryMap: Record<SuggestionType, SuggestionCategory> = {
  spelling: 'spelling',
  grammar: 'spelling',
  style: 'spelling',
  weasel_word: 'clarity',
  conciseness: 'conciseness',
  readability: 'readability',
  clarity: 'clarity',
};

const suggestionClassMap: Record<SuggestionCategory, string> = {
  spelling: 'spell-error',
  clarity: 'clarity-error',
  conciseness: 'conciseness-error',
  readability: 'readability-error',
};

const suggestionPriority: SuggestionCategory[] = [
  'readability',
  'clarity',
  'conciseness',
  'spelling',
];

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

function createPrioritizedDecorations(
  doc: Node,
  suggestions: AnySuggestion[],
  hoveredSuggestionId: string | null,
): DecorationSet {
  const docSize = doc.content.size;
  const charToSuggestion = new Array<AnySuggestion | null>(docSize).fill(null);
  const priorityMap = new Map(suggestionPriority.map((s, i) => [s, i]));

  // 1. "Paint" the character map with the highest priority suggestion for each spot
  suggestions.forEach(suggestion => {
    const from = offsetToPos(doc, suggestion.startOffset);
    const to = offsetToPos(doc, suggestion.endOffset);
    if (from === null || to === null) return;

    const category = suggestionCategoryMap[suggestion.type];
    const currentPriority = priorityMap.get(category) ?? -1;

    for (let i = from; i < to; i += 1) {
      const existingSuggestion = charToSuggestion[i];
      if (existingSuggestion) {
        const existingCategory =
          suggestionCategoryMap[existingSuggestion.type];
        const existingPriority = priorityMap.get(existingCategory) ?? -1;
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

      const category = suggestionCategoryMap[suggestion.type];
      let cssClass = suggestionClassMap[category];

      if (suggestion.id === hoveredSuggestionId) {
        cssClass += ' hovered';
      }

      decorations.push(
        Decoration.inline(
          i,
          j,
          {
            class: cssClass,
            'data-suggestion-id': suggestion.id,
            onmouseenter: `this.dispatchEvent(new CustomEvent('suggestionHover', { detail: { suggestionId: '${suggestion.id}' }, bubbles: true, composed: true }))`,
            onmouseleave: `this.dispatchEvent(new CustomEvent('suggestionLeave', { bubbles: true, composed: true }))`,
          },
          { suggestion },
        ),
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
        visibility: { [key: string]: boolean },
        hoveredSuggestionId: string | null,
      ) => {
        const { spelling, clarity, conciseness, readability } =
          useSuggestionStore.getState();

        const allSuggestions = [
          ...spelling,
          ...clarity,
          ...conciseness,
          ...readability,
        ];

        const visibleSuggestionTypes = Object.entries(visibility)
          .filter(([, isVisible]) => isVisible)
          .map(([type]) => type);

        const visibleSuggestions = allSuggestions.filter(s => {
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
          hoveredSuggestionId,
        );
        const tr = editor.state.tr.setMeta(suggestionPluginKey, {
          suggestions: allSuggestions, // Store all suggestions
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