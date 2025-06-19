import { create } from 'zustand';
import { SuggestionStore } from './suggestion.types';

export const useSuggestionStore = create<SuggestionStore>((set) => ({
  spelling: [],
  setSpellingSuggestions: (suggestions) => set({ spelling: suggestions }),
  clearSpellingSuggestions: () => set({ spelling: [] }),
})); 