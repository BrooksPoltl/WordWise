import {
    Document,
    DocumentCreatePayload,
    DocumentUpdatePayload,
    SpellingSuggestion
} from '../../types';

export interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  loading: boolean;
  error: string | null;
  suggestions: SpellingSuggestion[];
  dismissedSuggestionIds: Set<string>;

  // Actions
  fetchDocuments: (userId: string) => Promise<void>;
  fetchDocument: (documentId: string) => Promise<Document | null>;
  createDocument: (
    userId: string,
    payload: DocumentCreatePayload
  ) => Promise<string>;
  updateDocument: (payload: DocumentUpdatePayload) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  setCurrentDocument: (document: Document | null) => void;
  clearError: () => void;

  // Suggestion Actions
  addSuggestion: (suggestion: SpellingSuggestion) => void;
  applySuggestion: (suggestionId: string, replacement: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
  checkSpelling: (text: string) => Promise<void>;
} 