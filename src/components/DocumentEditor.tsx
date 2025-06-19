import { Editor } from '@tiptap/react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSuggestions } from '../hooks/useSuggestions';
import { useAuthStore } from '../store/auth/auth.store';
import { useDocumentStore } from '../store/document/document.store';
import { useSuggestionStore } from '../store/suggestion/suggestion.store';
import TextEditor from './TextEditor';

const DocumentEditor: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentDocument,
    fetchDocument,
    updateDocument,
    loading,
    error,
    clearError,
  } = useDocumentStore();
  const { spelling, clarity, conciseness, visibility } = useSuggestionStore(
    state => ({
      spelling: state.spelling,
      clarity: state.clarity,
      conciseness: state.conciseness,
      visibility: state.visibility,
    }),
  );

  const [editor, setEditor] = useState<Editor | null>(null);

  useSuggestions({ editor });

  const allSuggestions = [...spelling, ...clarity, ...conciseness];

  const [titleChangeTimeout, setTitleChangeTimeout] =
    useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return undefined;
    }

    if (documentId) {
      fetchDocument(documentId);
    }

    return () => {
      clearError();
    };
  }, [documentId, fetchDocument, clearError, user, navigate]);

  const handleTitleChange = (newTitle: string) => {
    if (!documentId) return;

    // Clear existing timeout
    if (titleChangeTimeout) {
      clearTimeout(titleChangeTimeout);
    }

    // Set new timeout for debounced save
    const timeout = setTimeout(async () => {
      try {
        await updateDocument({
          id: documentId,
          title: newTitle,
        });
      } catch (updateError) {
        console.error('Failed to update title:', updateError);
      }
    }, 1500);

    setTitleChangeTimeout(timeout);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (loading && !currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Document Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button type="button"
            onClick={handleBackToDashboard}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Document Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The document you&apos;re looking for doesn&apos;t exist.
          </p>
          <button type="button"
            onClick={handleBackToDashboard}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button type="button"
                onClick={handleBackToDashboard}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                WordWise Editor
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>
                  Last updated: {currentDocument.updatedAt.toLocaleDateString()}
                </span>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.displayName
                    ? user.displayName.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 h-full overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          {documentId && (
            <TextEditor
              documentId={documentId}
              onTitleChange={handleTitleChange}
              setEditor={setEditor}
              suggestions={allSuggestions}
              suggestionVisibility={visibility}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default DocumentEditor;
