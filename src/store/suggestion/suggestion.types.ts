import {
  ClaritySuggestion,
  ConcisenessSuggestion,
  GrammarSuggestion,
  PassiveSuggestion,
  ReadabilitySuggestion,
} from '../../types';

export interface Suggestion {
  id: string;
  text: string;
}

export const SUGGESTION_CATEGORIES = {
  grammar: {
    label: 'Grammar',
    color: '#ef4444', // Red
  },
  clarity: {
    label: 'Clarity',
    color: '#3b82f6', // Blue-500
  },
  conciseness: {
    label: 'Conciseness',
    color: '#22c55e', // Green-500
  },
  readability: {
    label: 'Readability',
    color: '#a855f7', // Purple-500
  },
  passive: {
    label: 'Passive Voice',
    color: '#f97316', // Orange
  },
};

export type SuggestionCategory = keyof typeof SUGGESTION_CATEGORIES;

export type AnySuggestion =
  | ClaritySuggestion
  | ConcisenessSuggestion
  | PassiveSuggestion
  | ReadabilitySuggestion
  | GrammarSuggestion;

export interface SuggestionState {
  grammar: GrammarSuggestion[];
  clarity: ClaritySuggestion[];
  conciseness: ConcisenessSuggestion[];
  passive: PassiveSuggestion[];
  readability: ReadabilitySuggestion[];
}

export interface SuggestionVisibility {
  grammar: boolean;
  clarity: boolean;
  conciseness: boolean;
  passive: boolean;
  readability: boolean;
  [key: string]: boolean; // Index signature for compatibility
}

export interface SuggestionStore extends SuggestionState {
  visibility: SuggestionVisibility;
  setSuggestions: (suggestions: Partial<SuggestionState>) => void;
  clearSuggestions: () => void;
  setGrammarSuggestions: (suggestions: GrammarSuggestion[]) => void;
  clearGrammarSuggestions: () => void;
  toggleVisibility: (category: SuggestionCategory) => void;
  // ... other setters if needed
}