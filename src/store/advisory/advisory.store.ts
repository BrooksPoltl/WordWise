import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useAdvisoryStore = create<AdvisoryStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setComments: (comments) => {
        const { dismissedHashes } = get();
        // Ensure dismissedHashes is a Set
        const hashesSet = dismissedHashes instanceof Set ? dismissedHashes : new Set(Array.isArray(dismissedHashes) ? dismissedHashes : []);
        // Filter out comments that have been permanently dismissed
        const filteredComments = filterDismissedComments(comments, hashesSet);
        
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
        // Ensure dismissedHashes is a Set
        const hashesSet = dismissedHashes instanceof Set ? dismissedHashes : new Set(Array.isArray(dismissedHashes) ? dismissedHashes : []);
        const newDismissedHashes = new Set(hashesSet);
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
          
          // Use setComments to ensure proper filtering of dismissed hashes
          const { setComments } = get();
          setComments(comments);
          set({ isLoading: false });
        } catch (error) {
          logger.error('Failed to refresh advisory comments:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to generate advisory comments'
            // Keep existing comments on error instead of clearing them
          });
        }
      },
    }),
    {
      name: 'advisory-store',
      partialize: (state) => ({ 
        dismissedHashes: Array.from(state.dismissedHashes || []) // Convert Set to Array for JSON serialization
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure dismissedHashes is always a Set after rehydration
          const hashes = Array.isArray(state.dismissedHashes) ? state.dismissedHashes : [];
          return {
            ...state,
            dismissedHashes: new Set(hashes)
          };
        }
        return state;
      },
    }
  )
); 