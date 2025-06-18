import { create } from 'zustand';
import {
  Document,
  DocumentCreatePayload,
  DocumentUpdatePayload,
  SpellingSuggestion,
} from '../../types';
import {
  addSuggestion as addSuggestionAction,
  applySuggestion as applySuggestionAction,
  checkSpelling as checkSpellingAction,
  createDocument as createDocumentAction,
  deleteDocument as deleteDocumentAction,
  dismissSuggestion as dismissSuggestionAction,
  fetchDocument as fetchDocumentAction,
  fetchDocuments as fetchDocumentsAction,
  updateDocument as updateDocumentAction,
} from './document.actions';
import { DocumentState } from './document.types';

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,
  suggestions: [],
  dismissedSuggestionIds: new Set(),

  fetchDocuments: (userId: string) => fetchDocumentsAction(set, userId),

  fetchDocument: (documentId: string) => fetchDocumentAction(set, documentId),

  createDocument: (userId: string, payload: DocumentCreatePayload) =>
    createDocumentAction(set, get, userId, payload),

  updateDocument: (payload: DocumentUpdatePayload) =>
    updateDocumentAction(set, get, payload),

  deleteDocument: (documentId: string) =>
    deleteDocumentAction(set, get, documentId),

  setCurrentDocument: (document: Document | null) => {
    set({ currentDocument: document });
  },

  clearError: () => {
    set({ error: null });
  },

  // Suggestion Actions
  addSuggestion: (suggestion: SpellingSuggestion) =>
    addSuggestionAction(set, get, suggestion),
  applySuggestion: (suggestionId: string, replacement: string) =>
    applySuggestionAction(set, get, suggestionId, replacement),
  dismissSuggestion: (suggestionId: string) =>
    dismissSuggestionAction(set, get, suggestionId),
  checkSpelling: (text: string) => checkSpellingAction(set, get, text),
}));
