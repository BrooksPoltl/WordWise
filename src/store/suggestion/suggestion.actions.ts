// This file is temporarily empty.
// The logic for updating suggestions is now handled differently
// with the new harper.js linter integration.
// We can re-evaluate the need for actions here later.

import {
    SuggestionOption
} from '../../types';
import { useSuggestionStore } from './suggestion.store';
import { SuggestionCategory } from './suggestion.types';

export const updateSuggestion = (
  category: Extract<SuggestionCategory, 'readability' | 'passive'>,
  suggestionId: string,
  rewrittenText: string,
) => {
  useSuggestionStore.setState(state => {
    const suggestions = state[category];
    const suggestionToUpdate = suggestions.find(s => s.id === suggestionId);

    if (!suggestionToUpdate) {
      return state;
    }

    const newSuggestion: SuggestionOption = {
      id: `${suggestionId}-rewrite`,
      text: rewrittenText,
    };

    const updatedSuggestions = suggestions.map(s =>
      s.id === suggestionId
        ? { ...s, suggestions: [newSuggestion] }
        : s,
    );

    return {
      ...state,
      [category]: updatedSuggestions,
    };
  });
}; 