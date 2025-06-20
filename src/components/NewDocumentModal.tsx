import React, { useState } from 'react';
import { DOCUMENT_TYPES_BY_ROLE, DocumentType, NEW_DOCUMENT_TEXT } from '../constants/documentConstants';
import { UserRole } from '../constants/userConstants';
import { useAuthStore } from '../store/auth/auth.store';
import { useDocumentStore } from '../store/document/document.store';
import { DocumentCreatePayload } from '../types';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentCreated: (documentId: string) => void;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  isOpen,
  onClose,
  onDocumentCreated,
}) => {
  const { user } = useAuthStore();
  const { createDocument, loading } = useDocumentStore();
  
  const [formData, setFormData] = useState<DocumentCreatePayload>({
    title: '',
    context: '',
    documentType: '',
  });

  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');

  const handleClose = () => {
    setFormData({ title: '', context: '', documentType: '' });
    setSelectedDocumentType('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid) return;
    
    try {
      const payload: DocumentCreatePayload = {
        title: formData.title,
        context: formData.context,
        documentType: selectedDocumentType,
      };
      
      const documentId = await createDocument(user.uid, payload);
      onDocumentCreated(documentId);
      handleClose();
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const documentTypes: DocumentType[] = user?.role ? DOCUMENT_TYPES_BY_ROLE[user.role as UserRole] || [] : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {NEW_DOCUMENT_TEXT.MODAL_TITLE}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              {NEW_DOCUMENT_TEXT.TITLE_LABEL}
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={NEW_DOCUMENT_TEXT.TITLE_PLACEHOLDER}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Context Textarea */}
          <div>
            <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
              {NEW_DOCUMENT_TEXT.CONTEXT_LABEL}
            </label>
            <p className="text-sm text-gray-600 mb-3">
              {NEW_DOCUMENT_TEXT.CONTEXT_DESCRIPTION}
            </p>
            <textarea
              id="context"
              value={formData.context}
              onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              placeholder="e.g., This is a feature spec for our new user dashboard redesign project..."
            />
          </div>

          {/* Document Type Selection */}
          {documentTypes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {NEW_DOCUMENT_TEXT.DOCUMENT_TYPE_HEADER}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documentTypes.map((docType: DocumentType) => (
                  <button
                    key={docType.name}
                    type="button"
                    className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-300 hover:shadow-sm text-left ${
                      selectedDocumentType === docType.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedDocumentType(
                      selectedDocumentType === docType.name ? '' : docType.name
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {docType.name}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {docType.description}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ml-2 ${
                        selectedDocumentType === docType.name
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedDocumentType === docType.name && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : NEW_DOCUMENT_TEXT.CREATE_BUTTON}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 