import { Extension, StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';
import { AnySuggestion } from '../store/suggestion/suggestion.types';
import { SuggestionType } from '../types';

// Map suggestion types to categories for visibility filtering
const mapSuggestionTypeToCategory = (type: SuggestionType): string => {
  switch (type) {
    case 'spelling':
    case 'grammar':
    case 'style':
      return 'grammar';
    case 'weasel_word':
      return 'clarity';
    case 'conciseness':
      return 'conciseness';
    case 'readability':
      return 'readability';
    case 'passive':
      return 'passive';
    default:
      return 'grammar';
  }
};

// Get CSS class for suggestion type
const getSuggestionCssClass = (type: SuggestionType): string => {
  switch (type) {
    case 'spelling':
    case 'grammar':
    case 'style':
      return 'wordwise-suggestion-grammar';
    case 'weasel_word':
      return 'wordwise-suggestion-clarity';
    case 'conciseness':
      return 'wordwise-suggestion-conciseness';
    case 'readability':
      return 'wordwise-suggestion-readability';
    case 'passive':
      return 'wordwise-suggestion-passive';
    default:
      return 'wordwise-suggestion-grammar';
  }
};

// State effect to update suggestions
export const updateSuggestions = StateEffect.define<{
  suggestions: AnySuggestion[];
  visibility: Record<string, boolean>;
}>();

// Suggestion decoration field
export const suggestionDecorationField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    // Map existing decorations through document changes
    let newDecorations = decorations.map(tr.changes);
    
    // Check for suggestion updates
    for (const effect of tr.effects) {
      if (effect.is(updateSuggestions)) {
        const { suggestions, visibility } = effect.value;
        
        // Filter visible suggestions
        const visibleSuggestions = suggestions.filter(suggestion => {
          const category = mapSuggestionTypeToCategory(suggestion.type);
          return visibility[category] !== false;
        });
        
        // Create decorations
        const decorationRanges = visibleSuggestions.map(suggestion => {
          const cssClass = getSuggestionCssClass(suggestion.type);
          return Decoration.mark({
            class: cssClass,
            attributes: {
              'data-suggestion-id': suggestion.id,
              'data-suggestion-type': suggestion.type,
            }
          }).range(suggestion.startOffset, suggestion.endOffset);
        });
        
        newDecorations = Decoration.set(decorationRanges, true);
      }
    }
    
    return newDecorations;
  },
  provide: f => EditorView.decorations.from(f)
});

// Create the suggestion decoration extension
export const createSuggestionDecorationExtension = (): Extension => [
  suggestionDecorationField,
  EditorView.theme({
    '.wordwise-suggestion-grammar': {
      textDecoration: 'underline wavy',
      textDecorationColor: '#ef4444',
      cursor: 'pointer',
    },
    '.wordwise-suggestion-clarity': {
      textDecoration: 'underline wavy',
      textDecorationColor: '#8b5cf6',
      cursor: 'pointer',
    },
    '.wordwise-suggestion-conciseness': {
      textDecoration: 'underline wavy',
      textDecorationColor: '#06b6d4',
      cursor: 'pointer',
    },
    '.wordwise-suggestion-readability': {
      textDecoration: 'underline wavy',
      textDecorationColor: '#10b981',
      cursor: 'pointer',
    },
    '.wordwise-suggestion-passive': {
      textDecoration: 'underline wavy',
      textDecorationColor: '#f97316',
      cursor: 'pointer',
    },
  }),
];

// Helper function to update suggestions in the editor
export const dispatchSuggestionUpdate = (
  view: EditorView,
  suggestions: AnySuggestion[],
  visibility: Record<string, boolean>
) => {
  view.dispatch({
    effects: updateSuggestions.of({ suggestions, visibility })
  });
}; 