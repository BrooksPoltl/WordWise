import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createAdvisoryHash, filterDismissedComments } from '../../utils/advisoryComments';
import { logger } from '../../utils/logger';
import { generateAdvisoryCommentsCall } from './advisory.actions';
import { AdvisoryState, AdvisoryStore } from './advisory.types';

const initialState: AdvisoryState = {
  comments: [],
  dismissedHashesByDocument: {},
  isLoading: false,
  error: null,
  lastAnalysisTimestamp: null,
};

export const useAdvisoryStore = create<AdvisoryStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setComments: (comments, documentId) => {
        const { dismissedHashesByDocument } = get();
        // Get dismissed hashes for this specific document
        const documentDismissedHashes = dismissedHashesByDocument[documentId] || new Set<string>();
        // Ensure it's a Set (in case of rehydration issues)
        const hashesSet = documentDismissedHashes instanceof Set 
          ? documentDismissedHashes 
          : new Set(Array.isArray(documentDismissedHashes) ? documentDismissedHashes : []);
        
        // Filter out comments that have been permanently dismissed for this document
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

      dismissCommentPermanently: (comment, documentId) => {
        const { dismissedHashesByDocument } = get();
        const hash = createAdvisoryHash(comment.originalText, comment.reason);
        
        // Get existing dismissed hashes for this document
        const existingHashes = dismissedHashesByDocument[documentId] || new Set<string>();
        const hashesSet = existingHashes instanceof Set 
          ? existingHashes 
          : new Set(Array.isArray(existingHashes) ? existingHashes : []);
        
        // Add the new hash to this document's dismissed hashes
        const newDismissedHashes = new Set(hashesSet);
        newDismissedHashes.add(hash);
        
        set((state: AdvisoryState) => ({
          dismissedHashesByDocument: {
            ...state.dismissedHashesByDocument,
            [documentId]: newDismissedHashes
          },
          comments: state.comments.filter(c => c.id !== comment.id), // Remove from current comments
        }));
      },

      setLoading: (isLoading) => 
        set({ isLoading }),

      setError: (error) => 
        set({ error }),

      refreshComments: async (documentContent: string, documentId: string) => {
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
          
          // Use setComments to ensure proper filtering of dismissed hashes for this document
          const { setComments } = get();
          setComments(comments, documentId);
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
        dismissedHashesByDocument: Object.fromEntries(
          Object.entries(state.dismissedHashesByDocument || {}).map(([docId, hashes]) => [
            docId,
            Array.from(hashes instanceof Set ? hashes : [])
          ])
        )
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.dismissedHashesByDocument) {
          // Convert Arrays back to Sets for each document
          const rehydratedHashes: Record<string, Set<string>> = {};
          Object.entries(state.dismissedHashesByDocument).forEach(([docId, hashes]) => {
            rehydratedHashes[docId] = new Set(Array.isArray(hashes) ? hashes : []);
          });
          
          return {
            ...state,
            dismissedHashesByDocument: rehydratedHashes
          };
        }
        return state;
      },
    }
  )
); 