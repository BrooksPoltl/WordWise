import { AIAdvisorySuggestion } from '../../types';

export interface AdvisoryState {
  isOpen: boolean;
  isLoading: boolean;
  suggestions: AIAdvisorySuggestion[];
  error: string | null;
}

export interface AdvisoryActions {
  requestSuggestions: (documentContent: string) => Promise<void>;
  dismissSuggestion: (suggestionId: string) => void;
  closeModal: () => void;
  openModal: () => void;
}

export type AdvisoryStore = AdvisoryState & AdvisoryActions; 