import { SpellingSuggestion } from '../../types';

export const SUGGESTION_CATEGORIES = {
  spelling: {
    label: 'Spelling',
    color: '#EF4444', // Red-500
  },
} as const;

export type SuggestionCategory = keyof typeof SUGGESTION_CATEGORIES;

export interface SuggestionState {
  spelling: SpellingSuggestion[];
  visibility: Record<SuggestionCategory, boolean>;
}

export interface SuggestionActions {
  setSpellingSuggestions: (suggestions: SpellingSuggestion[]) => void;
  clearSpellingSuggestions: () => void;
  toggleVisibility: (category: SuggestionCategory) => void;
}

export type SuggestionStore = SuggestionState & SuggestionActions;