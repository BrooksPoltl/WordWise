import { create } from 'zustand';
import { logger } from '../../utils/logger';
import { generateAdvisoryCommentsCall } from './advisory.actions';
import { AdvisoryState, AdvisoryStore } from './advisory.types';

const initialState: AdvisoryState = {
  comments: [],
  isLoading: false,
  error: null,
  lastAnalysisTimestamp: null,
};

export const useAdvisoryStore = create<AdvisoryStore>((set, get) => ({
  ...initialState,

  setComments: (comments) => 
    set({ 
      comments, 
      lastAnalysisTimestamp: Date.now(),
      error: null 
    }),

  clearComments: () => 
    set({ comments: [] }),

  dismissComment: (commentId) =>
    set(state => ({
      comments: state.comments.map(comment =>
        comment.id === commentId
          ? { ...comment, dismissed: true }
          : comment
      ),
    })),

  setLoading: (isLoading) => 
    set({ isLoading }),

  setError: (error) => 
    set({ error }),

  refreshComments: async (documentContent: string) => {
    const currentState = get();
    
    // Don't refresh if already loading
    if (currentState.isLoading) {
      logger.debug('Advisory comment refresh already in progress');
      return;
    }

    // Don't refresh if content is too short
    if (!documentContent || documentContent.trim().length < 50) {
      logger.debug('Document content too short for advisory analysis');
      set({ comments: [], error: null });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      
      // Clear existing comments before generating new ones
      set(prevState => ({ ...prevState, comments: [] }));
      
      const comments = await generateAdvisoryCommentsCall(documentContent);
      
      set({ 
        comments,
        isLoading: false,
        error: null,
        lastAnalysisTimestamp: Date.now()
      });
      
      logger.debug(`Generated ${comments.length} advisory comments`);
    } catch (error) {
      logger.error('Failed to refresh advisory comments:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to generate advisory comments',
        comments: [] 
      });
    }
  },
})); 