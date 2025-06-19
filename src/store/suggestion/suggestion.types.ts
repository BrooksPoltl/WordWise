import {
    ClaritySuggestion,
    ConcisenessSuggestion,
    SpellingSuggestion,
} from '../../types';

export const SUGGESTION_CATEGORIES = {
  spelling: {
    label: 'Spelling',
    color: '#EF4444', // Red-500
  },
  clarity: {
    label: 'Clarity',
    color: '#3B82F6', // Blue-500
  },
  conciseness: {
    label: 'Conciseness',
    color: '#10B981', // Green-500
  },
} as const;

export type SuggestionCategory = keyof typeof SUGGESTION_CATEGORIES;

export type AnySuggestion =
  | SpellingSuggestion
  | ClaritySuggestion
  | ConcisenessSuggestion;

export interface SuggestionState {
  spelling: SpellingSuggestion[];
  clarity: ClaritySuggestion[];
  conciseness: ConcisenessSuggestion[];
  visibility: Record<SuggestionCategory, boolean>;
}

export interface SuggestionActions {
  setSuggestions: (
    category: SuggestionCategory,
    suggestions: AnySuggestion[],
  ) => void;
  toggleVisibility: (category: SuggestionCategory) => void;
  // Note: These are kept for the existing spell-check flow but will be phased out.
  setSpellingSuggestions: (suggestions: SpellingSuggestion[]) => void;
  clearSpellingSuggestions: () => void;
}

export type SuggestionStore = SuggestionState & SuggestionActions;