import { httpsCallable } from 'firebase/functions';
import { create } from 'zustand';
import { functions } from '../../config';
import { AIAdvisorySuggestion } from '../../types';
import { logger } from '../../utils/logger';
import { AdvisoryActions, AdvisoryState } from './advisory.types';

export const useAdvisoryStore = create<AdvisoryState & AdvisoryActions>(
  (set, get) => ({
    isOpen: false,
    isLoading: false,
    suggestions: [],
    error: null,

    requestSuggestions: async (documentContent: string) => {
      set({ isLoading: true, error: null, isOpen: true });
      
      try {
        logger.info('Requesting advisory suggestions...');
        
        const requestAdvisoryCommentsCallable = httpsCallable<
          { documentContent: string },
          AIAdvisorySuggestion[]
        >(functions, 'requestAdvisoryComments');

        const result = await requestAdvisoryCommentsCallable({ documentContent });
        const suggestions = result.data || [];
        
        // Add unique IDs to suggestions for frontend state management
        const suggestionsWithIds = suggestions.map((suggestion, index) => ({
          ...suggestion,
          id: `advisory-${Date.now()}-${index}`,
        }));

        set({ 
          suggestions: suggestionsWithIds, 
          isLoading: false,
          error: null 
        });
        
        logger.info('Advisory suggestions received successfully.', { count: suggestionsWithIds.length });
      } catch (error) {
        logger.error('Error requesting advisory suggestions:', error);
        set({ 
          error: 'Failed to get advisory suggestions. Please try again.',
          isLoading: false,
          suggestions: []
        });
      }
    },

    dismissSuggestion: (suggestionId: string) => {
      const { suggestions } = get();
      const updatedSuggestions = suggestions.filter(s => s.id !== suggestionId);
      set({ suggestions: updatedSuggestions });
    },

    closeModal: () => {
      set({ isOpen: false, error: null });
    },

    openModal: () => {
      set({ isOpen: true, error: null });
    },
  }),
); 