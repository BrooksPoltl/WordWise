import { create } from 'zustand';
import { SuggestionStore } from './suggestion.types';

export const useSuggestionStore = create<SuggestionStore>((set) => ({
  spelling: [],
  clarity: [],
  visibility: {
    spelling: true,
    clarity: true,
  },
  setSuggestions: (category, suggestions) =>
    set((state) => ({
      ...state,
      [category]: suggestions,
    })),
  toggleVisibility: (category) =>
    set((state) => ({
      visibility: {
        ...state.visibility,
        [category]: !state.visibility[category],
      },
    })),
  // Kept for backward compatibility with the old spell-check flow
  setSpellingSuggestions: (suggestions) => set({ spelling: suggestions }),
  clearSpellingSuggestions: () => set({ spelling: [] }),
})); 