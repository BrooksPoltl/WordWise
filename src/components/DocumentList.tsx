import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth/auth.store';
import { useDocumentStore } from '../store/document/document.store';
import { Document } from '../types';
import { NewDocumentModal } from './NewDocumentModal';

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    documents,
    fetchDocuments,
    deleteDocument,
    loading,
    error,
    clearError,
  } = useDocumentStore();

  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showNewDocumentModal, setShowNewDocumentModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDocuments(user.uid);
    }

    return () => {
      clearError();
    };
  }, [user, fetchDocuments, clearError]);

  const handleCreateDocument = () => {
    setShowNewDocumentModal(true);
  };

  const handleDocumentCreated = (documentId: string) => {
    navigate(`/document/${documentId}`);
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      setShowDeleteModal(null);
    } catch (deleteError) {
      console.error('Failed to delete document:', deleteError);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    }
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    }
    if (diffInHours < 48) {
      return 'Yesterday';
    }
    return date.toLocaleDateString();
  };

  const getDocumentPreview = (content: string) => {
    // Remove HTML tags and get first 100 characters
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 100
      ? `${textContent.substring(0, 100)}...`
      : textContent;
  };

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Documents</h2>
          <p className="text-gray-600 mt-1">
            {documents.length === 0
              ? 'No documents yet. Create your first document to get started.'
              : `${documents.length} document${documents.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <button type="button"
          onClick={handleCreateDocument}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Document
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button type="button"
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No documents yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first document to start writing with AI assistance.
          </p>
          <button type="button"
            onClick={handleCreateDocument}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc: Document) => (
            <div
              key={doc.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/document/${doc.id}`)}
              onKeyPress={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/document/${doc.id}`);
                }
              }}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer p-6 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {doc.title || 'Untitled Document'}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {getDocumentPreview(doc.content) || 'No content yet...'}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  {doc.documentType ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {doc.documentType}
                    </span>
                  ) : (
                    <span className="text-gray-400">No type set</span>
                  )}
                </div>
                <span>{formatDate(doc.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Document Modal */}
      <NewDocumentModal
        isOpen={showNewDocumentModal}
        onClose={() => setShowNewDocumentModal(false)}
        onDocumentCreated={handleDocumentCreated}
      />

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Document
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this document? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button type="button"
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button type="button"
                onClick={() => handleDeleteDocument(showDeleteModal)}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
