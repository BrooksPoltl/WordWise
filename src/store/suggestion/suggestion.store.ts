import { create } from 'zustand';
import { GrammarSuggestion } from '../../types';
import {
  SuggestionCategory,
  SuggestionState,
  SuggestionStore,
  SuggestionVisibility
} from './suggestion.types';

const initialState: SuggestionState = {
    spelling: [],
    clarity: [],
    conciseness: [],
    readability: [],
    passive: [],
};

const initialVisibility: SuggestionVisibility = {
    spelling: true,
    clarity: true,
    conciseness: true,
    readability: true,
    passive: true,
};

export const useSuggestionStore = create<SuggestionStore>(set => ({
    ...initialState,
    visibility: initialVisibility,

    setSuggestions: (suggestions: Partial<SuggestionState>) =>
        set(state => ({
            ...state,
            ...suggestions,
        })),

    clearSuggestions: () => {
        set({ ...initialState, visibility: initialVisibility });
    },

    toggleVisibility: (category: SuggestionCategory) =>
        set(state => ({
            ...state,
            visibility: {
                ...state.visibility,
                [category]: !state.visibility[category as keyof SuggestionVisibility],
            },
        })),

    // Legacy method names maintained for compatibility
    // The 'spelling' slice will be used for Harper grammar suggestions in Phase 1
    setSpellingSuggestions: (suggestions: GrammarSuggestion[]) =>
        set({ spelling: suggestions }),

    clearSpellingSuggestions: () => set({ spelling: [] }),
})); 