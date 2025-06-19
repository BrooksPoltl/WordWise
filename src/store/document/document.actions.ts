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
  where,
} from "firebase/firestore";
import { db } from "../../config";
import { Document, DocumentCreatePayload, DocumentUpdatePayload, SpellingSuggestion } from "../../types";
import { browserSpellChecker, BrowserSpellChecker } from "../../utils/browserSpellChecker";
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
    const content = payload.content || "";
    const wordCount =
      content.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = content.length;

    const docData = {
      title: payload.title,
      content,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      wordCount,
      characterCount,
    };

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
  get: () => DocumentState,
  payload: DocumentUpdatePayload,
): Promise<void> => {
  set({ loading: true, error: null });
  try {
    const docRef = doc(db, 'documents', payload.id);
    const updateData: {
      updatedAt: ReturnType<typeof serverTimestamp>;
      title?: string;
      content?: string;
      wordCount?: number;
      characterCount?: number;
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

    await updateDoc(docRef, updateData);

    // Update local state
    const { documents, currentDocument } = get();
    const updatedDocuments = documents.map(document =>
      document.id === payload.id
        ? {
            ...document,
            ...updateData,
            updatedAt: new Date(),
            wordCount: updateData.wordCount || document.wordCount,
            characterCount: updateData.characterCount || document.characterCount,
          }
                    : document
    );

    set({
      documents: updatedDocuments,
      currentDocument:
        currentDocument?.id === payload.id
          ? {
              ...currentDocument,
              ...updateData,
              updatedAt: new Date(),
              wordCount: updateData.wordCount || currentDocument.wordCount,
              characterCount:
                updateData.characterCount || currentDocument.characterCount,
            }
          : currentDocument,
      loading: false,
    });
  } catch (error) {
    set({
      error: getFriendlyErrorMessage(error, 'Failed to update document'),
      loading: false,
    });
    throw error;
  }
};

export const deleteDocument = async (
  set: DocumentSet,
  get: () => DocumentState,
  documentId: string,
): Promise<void> => {
  set({ loading: true, error: null });
  try {
    await deleteDoc(doc(db, 'documents', documentId));

    // Update local state
    const { documents, currentDocument } = get();
    const updatedDocuments = documents.filter(document => document.id !== documentId);

    set({
      documents: updatedDocuments,
      currentDocument:
        currentDocument?.id === documentId ? null : currentDocument,
      loading: false,
    });
  } catch (error) {
    set({
      error: getFriendlyErrorMessage(error, 'Failed to delete document'),
      loading: false,
    });
    throw error;
  }
};

// Suggestion Actions
export const addSuggestion = (
  set: DocumentSet,
  get: () => DocumentState,
  suggestion: SpellingSuggestion,
): void => {
  const { suggestions, dismissedSuggestionIds } = get();

  // Avoid adding duplicate or dismissed suggestions
  if (
    dismissedSuggestionIds.has(suggestion.id) ||
    suggestions.some((s: SpellingSuggestion) => s.id === suggestion.id)
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
  const { currentDocument, suggestions } = get();
  if (!currentDocument) return;

  const targetSuggestion = suggestions.find(s => s.id === suggestionId);
  if (!targetSuggestion) return;

  const { updatedText, updatedSuggestions } = BrowserSpellChecker.applySuggestion(
    currentDocument.content,
    suggestions,
    targetSuggestion,
    replacement,
  );

  set({
    currentDocument: { ...currentDocument, content: updatedText },
    suggestions: updatedSuggestions,
  });
};

export const dismissSuggestion = (
  set: DocumentSet,
  get: () => DocumentState,
  suggestionId: string,
): void => {
  const { dismissedSuggestionIds } = get();
  const newDismissedIds = new Set(dismissedSuggestionIds);
  newDismissedIds.add(suggestionId);
  set({ dismissedSuggestionIds: newDismissedIds });
};

export const checkSpelling = async (
  set: DocumentSet,
  _: () => DocumentState,
  text: string,
): Promise<void> => {
  set({ suggestions: [], error: null });
  try {
    const lastSpaceIndex = text.lastIndexOf(' ');
    const textToCheck =
      lastSpaceIndex === -1 ? '' : text.substring(0, lastSpaceIndex);

    if (!textToCheck.trim()) {
      set({ suggestions: [] });
      return;
    }

    const isReady = await browserSpellChecker.isReady();
    if (!isReady) {
      console.warn('Browser spell checker not ready.');
      return;
    }

    const uniqueWords = [...new Set(textToCheck.match(/\b\w+\b/g) || [])].filter(
      word => !/^\d+$/.test(word),
    );
    const misspelledWords = (
      await Promise.all(
        uniqueWords.map(async word => {
          const isCorrect = await browserSpellChecker.correct(word);
          return isCorrect ? null : word;
        }),
      )
    ).filter((word): word is string => word !== null);

    const suggestionPromises = misspelledWords.map(async word => {
      const allSuggestions = await browserSpellChecker.suggest(word);
      const suggestions = allSuggestions.slice(0, 3);
      if (suggestions.length === 0) return [];

      const suggestionOptions = suggestions.map((suggestionText: string, i: number) => ({
        id: crypto.randomUUID(),
        text: suggestionText,
      }));

      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const newSuggestions: SpellingSuggestion[] = [];
      let match = regex.exec(text);
      while (match) {
        const startOffset = match.index;
        newSuggestions.push({
          id: crypto.randomUUID(),
          word,
          suggestions: suggestionOptions,
          startOffset,
          endOffset: startOffset + word.length,
          type: 'spelling',
        });
        match = regex.exec(text);
      }
      return newSuggestions;
    });

    const suggestions = (await Promise.all(suggestionPromises)).flat();
    set({ suggestions });
  } catch (error) {
    set({
      error: getFriendlyErrorMessage(error, 'Failed to check spelling'),
    });
  }
}; 