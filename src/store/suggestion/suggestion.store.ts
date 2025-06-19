import { create } from 'zustand';
import { SuggestionStore } from './suggestion.types';

export const useSuggestionStore = create<SuggestionStore>((set) => ({
  spelling: [],
  visibility: {
    spelling: true,
  },
  setSpellingSuggestions: (suggestions) => set({ spelling: suggestions }),
  clearSpellingSuggestions: () => set({ spelling: [] }),
  toggleVisibility: (category) =>
    set((state) => ({
      visibility: {
        ...state.visibility,
        [category]: !state.visibility[category],
      },
    })),
})); 