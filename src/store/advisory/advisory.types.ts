import { AdvisoryComment } from '../../types';

export interface AdvisoryState {
  comments: AdvisoryComment[];
  dismissedHashesByDocument: Record<string, Set<string>>; // documentId -> Set of dismissed hashes
  isLoading: boolean;
  error: string | null;
  lastAnalysisTimestamp: number | null;
}

export interface AdvisoryActions {
  setComments: (comments: AdvisoryComment[], documentId: string) => void;
  clearComments: () => void;
  dismissComment: (commentId: string) => void;
  dismissCommentPermanently: (comment: AdvisoryComment, documentId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  refreshComments: (documentContent: string, documentId: string) => Promise<void>;
}

export interface AdvisoryStore extends AdvisoryState, AdvisoryActions {} 