import { create } from 'zustand';
import { GrammarSuggestion } from '../../types';
import {
  SuggestionCategory,
  SuggestionState,
  SuggestionStore,
  SuggestionVisibility
} from './suggestion.types';

const initialState: SuggestionState = {
    grammar: [],
    clarity: [],
    conciseness: [],
    readability: [],
    passive: [],
};

const initialVisibility: SuggestionVisibility = {
    grammar: true,
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

    // Updated method names for grammar suggestions
    setGrammarSuggestions: (suggestions: GrammarSuggestion[]) =>
        set({ grammar: suggestions }),

    clearGrammarSuggestions: () => set({ grammar: [] }),
})); 