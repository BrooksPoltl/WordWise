import { AdvisoryComment } from '../../types';

export interface AdvisoryState {
  comments: AdvisoryComment[];
  dismissedHashes: Set<string>;
  isLoading: boolean;
  error: string | null;
  lastAnalysisTimestamp: number | null;
}

export interface AdvisoryActions {
  setComments: (comments: AdvisoryComment[]) => void;
  clearComments: () => void;
  dismissComment: (commentId: string) => void;
  dismissCommentPermanently: (comment: AdvisoryComment) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshComments: (documentContent: string) => Promise<void>;
}

export interface AdvisoryStore extends AdvisoryState, AdvisoryActions {} 