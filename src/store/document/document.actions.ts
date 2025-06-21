import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { db } from "../../config";
import { Document, DocumentCreatePayload, DocumentUpdatePayload, GrammarSuggestion } from "../../types";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";
import { DocumentState } from "./document.types";

type DocumentSet = (
  partial:
    | DocumentState
    | Partial<DocumentState>
    | ((state: DocumentState) => DocumentState | Partial<DocumentState>),
  replace?: boolean | undefined,
) => void;

export const fetchDocuments = async (
  set: DocumentSet,
  userId: string,
): Promise<void> => {
  set({ loading: true, error: null });
  try {
    const documentsRef = collection(db, "documents");
    const q = query(
      documentsRef,
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    const documents: Document[] = [];

    querySnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      documents.push({
        id: docSnapshot.id,
        title: data.title,
        content: data.content,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        wordCount: data.wordCount || 0,
        characterCount: data.characterCount || 0,
        context: data.context,
        documentType: data.documentType,
      });
    });

    set({ documents, loading: false });
  } catch (error) {
    set({
      error: getFriendlyErrorMessage(error, "Failed to fetch documents"),
      loading: false,
    });
  }
};

export const fetchDocument = async (
  set: DocumentSet,
  documentId: string,
): Promise<Document | null> => {
  set({ loading: true, error: null });
  try {
    const docRef = doc(db, "documents", documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const document: Document = {
        id: docSnap.id,
        title: data.title,
        content: data.content,
        userId: data.userId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        wordCount: data.wordCount || 0,
        characterCount: data.characterCount || 0,
        context: data.context,
        documentType: data.documentType,
      };

      set({ currentDocument: document, loading: false });
      return document;
    }
    set({ error: "Document not found", loading: false });
    return null;
  } catch (error) {
    set({
      error: getFriendlyErrorMessage(error, "Failed to fetch document"),
      loading: false,
    });
    return null;
  }
};

export const createDocument = async (
  set: DocumentSet,
  get: () => DocumentState,
  userId: string,
  payload: DocumentCreatePayload,
): Promise<string> => {
  set({ loading: true, error: null });
  try {
    const content = "";
    const wordCount = 0;
    const characterCount = 0;

    const docData: {
      title: string;
      content: string;
      userId: string;
      createdAt: ReturnType<typeof serverTimestamp>;
      updatedAt: ReturnType<typeof serverTimestamp>;
      wordCount: number;
      characterCount: number;
      context?: string;
      documentType?: string;
    } = {
      title: payload.title || 'Untitled Document',
      content,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      wordCount,
      characterCount,
    };

    // Add optional fields if provided
    if (payload.context) {
      docData.context = payload.context;
    }
    if (payload.documentType) {
      docData.documentType = payload.documentType;
    }

    const docRef = await addDoc(collection(db, "documents"), docData);

    // Fetch the created document to get the actual timestamp
    const createdDoc = await fetchDocument(set, docRef.id);

    if (createdDoc) {
      // Update the documents list
      const { documents } = get();
      set({
        documents: [createdDoc, ...documents],
        loading: false,
      });
    }

    return docRef.id;
  } catch (error) {
    set({
      error: getFriendlyErrorMessage(error, "Failed to create document"),
      loading: false,
    });
    throw error;
  }
};

export const updateDocument = async (
  set: DocumentSet,
  _get: () => DocumentState,
  payload: DocumentUpdatePayload,
): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', payload.id);
    const updateData: {
      updatedAt: ReturnType<typeof serverTimestamp>;
      title?: string;
      content?: string;
      wordCount?: number;
      characterCount?: number;
      context?: string;
      documentType?: string;
    } = {
      updatedAt: serverTimestamp(),
    };

    if (payload.title !== undefined) {
      updateData.title = payload.title;
    }

    if (payload.content !== undefined) {
      updateData.content = payload.content;
      updateData.wordCount = payload.content
        .split(/\s+/)
        .filter(word => word.length > 0).length;
      updateData.characterCount = payload.content.length;
    }

    if (payload.context !== undefined) {
      updateData.context = payload.context;
    }

    if (payload.documentType !== undefined) {
      updateData.documentType = payload.documentType;
    }
    
    await updateDoc(docRef, updateData);
    
    // Refetch the document to update local state with the changes
    await fetchDocument(set, payload.id);

  } catch (error) {
    set({
      error: getFriendlyErrorMessage(error, 'Failed to update document'),
    });
    throw error;
  }
};

/**
 * Fire-and-forget auto-save function for document content.
 * Optimized for auto-save scenarios where we don't need to wait for completion
 * or update local state since we already have the current content.
 */
export const autoSaveDocument = (
  documentId: string,
  content: string,
): void => {
  const docRef = doc(db, 'documents', documentId);
  const updateData = {
    content,
    wordCount: content
      .split(/\s+/)
      .filter(word => word.length > 0).length,
    characterCount: content.length,
    updatedAt: serverTimestamp(),
  };

  // Fire and forget - don't await, just catch errors silently
  updateDoc(docRef, updateData).catch((error) => {
    // Log error but don't throw - this is fire-and-forget
    console.warn('Auto-save failed (will retry on next change):', error);
  });
};

export const deleteDocument = async (
  set: DocumentSet,
  get: () => DocumentState,
  documentId: string,
): Promise<void> => {
  set({ loading: true, error: null });
  try {
    await deleteDoc(doc(db, 'documents', documentId));
    const { documents } = get();
    const updatedDocuments = documents.filter(document => document.id !== documentId);
    set({ documents: updatedDocuments, loading: false });
  } catch (error) {
    set({
      error: getFriendlyErrorMessage(error, 'Failed to delete document'),
      loading: false,
    });
  }
};

export const addSuggestion = (
  set: DocumentSet,
  get: () => DocumentState,
  suggestion: GrammarSuggestion,
): void => {
  const { suggestions, dismissedSuggestionIds } = get();

  // Avoid adding duplicate or dismissed suggestions
  if (
    dismissedSuggestionIds.has(suggestion.id) ||
    suggestions.some(s => s.id === suggestion.id)
  ) {
    return;
  }

  set({ suggestions: [...suggestions, suggestion] });
};

export const applySuggestion = (
  set: DocumentSet,
  get: () => DocumentState,
  suggestionId: string,
  replacement: string,
): void => {
  const { currentDocument } = get();
  if (!currentDocument || !currentDocument.content) return;

  const suggestionToApply = get().suggestions.find(s => s.id === suggestionId);
  if (!suggestionToApply) return;

  const newContent =
    currentDocument.content.substring(0, suggestionToApply.startOffset) +
    replacement +
    currentDocument.content.substring(suggestionToApply.endOffset);

  // Update document optimistically and then save
  set(state => ({
    currentDocument: state.currentDocument
      ? { ...state.currentDocument, content: newContent }
      : null,
    suggestions: state.suggestions.filter(s => s.id !== suggestionId),
  }));

  autoSaveDocument(currentDocument.id, newContent);
};

export const dismissSuggestion = (
  set: DocumentSet,
  get: () => DocumentState,
  suggestionId: string,
): void => {
  const { dismissedSuggestionIds } = get();
  const newDismissedIds = new Set(dismissedSuggestionIds);
  newDismissedIds.add(suggestionId);
  set(state => ({
    suggestions: state.suggestions.filter(s => s.id !== suggestionId),
    dismissedSuggestionIds: newDismissedIds,
  }));
}; 