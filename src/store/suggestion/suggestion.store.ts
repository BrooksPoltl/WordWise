import { create } from 'zustand';
import {
    SuggestionActions,
    SuggestionState
} from './suggestion.types';

export const useSuggestionStore = create<SuggestionState & SuggestionActions>(
  set => ({
    spelling: [],
    clarity: [],
    conciseness: [],
    readability: [],
    passive: [],
    visibility: {
      spelling: true,
      clarity: true,
      conciseness: true,
      readability: true,
      passive: true,
    },
    setSuggestions: (category, suggestions) =>
      set(state => ({
        ...state,
        [category]: suggestions,
      })),
    toggleVisibility: category =>
      set(state => ({
        visibility: {
          ...state.visibility,
          [category]: !state.visibility[category],
        },
      })),
    // Kept for backward compatibility with the old spell-check flow
    setSpellingSuggestions: suggestions =>
      set({ spelling: suggestions }),
    clearSpellingSuggestions: () => set({ spelling: [] }),
  }),
); 