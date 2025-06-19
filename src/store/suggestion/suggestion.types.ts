import { SpellingSuggestion } from '../../types';

export interface SuggestionState {
  spelling: SpellingSuggestion[];
  // Future suggestion types will be added here
  // clarity: ClaritySuggestion[];
  // conciseness: ConcisenessSuggestion[];
}

export interface SuggestionActions {
  setSpellingSuggestions: (suggestions: SpellingSuggestion[]) => void;
  clearSpellingSuggestions: () => void;
}

export type SuggestionStore = SuggestionState & SuggestionActions; 