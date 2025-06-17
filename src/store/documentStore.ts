import { create } from 'zustand';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config';
import { Document, DocumentCreatePayload, DocumentUpdatePayload } from '../types';
import { logger } from '../utils/logger';

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchDocuments: (userId: string) => Promise<void>;
  fetchDocument: (documentId: string) => Promise<Document | null>;
  createDocument: (userId: string, payload: DocumentCreatePayload) => Promise<string>;
  updateDocument: (payload: DocumentUpdatePayload) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  setCurrentDocument: (document: Document | null) => void;
  clearError: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,

  fetchDocuments: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const documentsRef = collection(db, 'documents');
      const q = query(
        documentsRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const documents: Document[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        documents.push({
          id: doc.id,
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
      logger.info('Documents fetched successfully', { count: documents.length });
    } catch (error) {
      logger.error('Error fetching documents:', error);
      set({ error: 'Failed to fetch documents', loading: false });
    }
  },

  fetchDocument: async (documentId: string) => {
    set({ loading: true, error: null });
    try {
      const docRef = doc(db, 'documents', documentId);
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
        logger.info('Document fetched successfully', { documentId });
        return document;
      } else {
        set({ error: 'Document not found', loading: false });
        logger.warning('Document not found', { documentId });
        return null;
      }
    } catch (error) {
      logger.error('Error fetching document:', error);
      set({ error: 'Failed to fetch document', loading: false });
      return null;
    }
  },

  createDocument: async (userId: string, payload: DocumentCreatePayload) => {
    set({ loading: true, error: null });
    try {
      const content = payload.content || '';
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
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
      
      const docRef = await addDoc(collection(db, 'documents'), docData);
      
      // Fetch the created document to get the actual timestamp
      const createdDoc = await get().fetchDocument(docRef.id);
      
      if (createdDoc) {
        // Update the documents list
        const { documents } = get();
        set({ 
          documents: [createdDoc, ...documents],
          loading: false 
        });
      }
      
      logger.info('Document created successfully', { documentId: docRef.id });
      return docRef.id;
    } catch (error) {
      logger.error('Error creating document:', error);
      set({ error: 'Failed to create document', loading: false });
      throw error;
    }
  },

  updateDocument: async (payload: DocumentUpdatePayload) => {
    set({ loading: true, error: null });
    try {
      const docRef = doc(db, 'documents', payload.id);
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };
      
      if (payload.title !== undefined) {
        updateData.title = payload.title;
      }
      
      if (payload.content !== undefined) {
        updateData.content = payload.content;
        updateData.wordCount = payload.content.split(/\s+/).filter(word => word.length > 0).length;
        updateData.characterCount = payload.content.length;
      }
      
      await updateDoc(docRef, updateData);
      
      // Update local state
      const { documents, currentDocument } = get();
      const updatedDocuments = documents.map(doc => 
        doc.id === payload.id 
          ? { 
              ...doc, 
              ...updateData,
              updatedAt: new Date(),
              wordCount: updateData.wordCount || doc.wordCount,
              characterCount: updateData.characterCount || doc.characterCount
            }
          : doc
      );
      
      set({ 
        documents: updatedDocuments,
        currentDocument: currentDocument?.id === payload.id 
          ? { 
              ...currentDocument, 
              ...updateData,
              updatedAt: new Date(),
              wordCount: updateData.wordCount || currentDocument.wordCount,
              characterCount: updateData.characterCount || currentDocument.characterCount
            }
          : currentDocument,
        loading: false 
      });
      
      logger.info('Document updated successfully', { documentId: payload.id });
    } catch (error) {
      logger.error('Error updating document:', error);
      set({ error: 'Failed to update document', loading: false });
      throw error;
    }
  },

  deleteDocument: async (documentId: string) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'documents', documentId));
      
      // Update local state
      const { documents, currentDocument } = get();
      const updatedDocuments = documents.filter(doc => doc.id !== documentId);
      
      set({ 
        documents: updatedDocuments,
        currentDocument: currentDocument?.id === documentId ? null : currentDocument,
        loading: false 
      });
      
      logger.info('Document deleted successfully', { documentId });
    } catch (error) {
      logger.error('Error deleting document:', error);
      set({ error: 'Failed to delete document', loading: false });
      throw error;
    }
  },

  setCurrentDocument: (document: Document | null) => {
    set({ currentDocument: document });
  },

  clearError: () => {
    set({ error: null });
  },
})); 