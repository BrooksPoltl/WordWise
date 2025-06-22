import { create } from 'zustand';
import { createAdvisoryHash, filterDismissedComments } from '../../utils/advisoryComments';
import { logger } from '../../utils/logger';
import { generateAdvisoryCommentsCall } from './advisory.actions';
import { AdvisoryState, AdvisoryStore } from './advisory.types';

const initialState: AdvisoryState = {
  comments: [],
  dismissedHashes: new Set<string>(),
  isLoading: false,
  error: null,
  lastAnalysisTimestamp: null,
};

export const useAdvisoryStore = create<AdvisoryStore>((set, get) => ({
  ...initialState,

  setComments: (comments) => {
    const { dismissedHashes } = get();
    // Filter out comments that have been permanently dismissed
    const filteredComments = filterDismissedComments(comments, dismissedHashes);
    
    set({ 
      comments: filteredComments, 
      lastAnalysisTimestamp: Date.now(),
      error: null 
    });
  },

  clearComments: () => {
    set({ comments: [] });
  },

  dismissComment: (commentId) =>
    set((state: AdvisoryState) => ({
      comments: state.comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, dismissed: true }
          : comment
      ),
    })),

  dismissCommentPermanently: (comment) => {
    const { dismissedHashes } = get();
    const hash = createAdvisoryHash(comment.originalText, comment.reason);
    const newDismissedHashes = new Set(dismissedHashes);
    newDismissedHashes.add(hash);
    
    set((state: AdvisoryState) => ({
      dismissedHashes: newDismissedHashes,
      comments: state.comments.filter(c => c.id !== comment.id), // Remove from current comments
    }));
  },

  setLoading: (isLoading) => 
    set({ isLoading }),

  setError: (error) => 
    set({ error }),

  refreshComments: async (documentContent: string) => {
    const currentState = get();
    
    // Don't refresh if already loading
    if (currentState.isLoading) {
      return;
    }

    // Don't refresh if content is too short
    if (!documentContent || documentContent.trim().length < 50) {
      return;
    }

    try {
      set({ isLoading: true, error: null });
      
      // Keep existing comments visible until new ones are ready
      const comments = await generateAdvisoryCommentsCall(documentContent);
      
      set({ 
        comments,
        isLoading: false,
        error: null,
        lastAnalysisTimestamp: Date.now()
      });
    } catch (error) {
      logger.error('Failed to refresh advisory comments:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to generate advisory comments'
        // Keep existing comments on error instead of clearing them
      });
    }
  },
})); 