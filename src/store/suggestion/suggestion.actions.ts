import { ReadabilitySuggestion, SuggestionOption } from '../../types';
import { useSuggestionStore } from './suggestion.store';

export const updateReadabilitySuggestion = (
  suggestionId: string,
  rewrittenText: string,
) => {
  useSuggestionStore.setState(state => {
    const suggestionToUpdate = state.readability.find(
      s => s.id === suggestionId,
    );

    if (!suggestionToUpdate) {
      return state;
    }

    const newSuggestion: SuggestionOption = {
      id: `${suggestionId}-rewrite`,
      text: rewrittenText,
    };

    const updatedSuggestions: ReadabilitySuggestion[] = state.readability.map(s =>
      s.id === suggestionId
        ? { ...s, suggestions: [newSuggestion] }
        : s,
    );

    return {
      ...state,
      readability: updatedSuggestions,
    };
  });
}; 