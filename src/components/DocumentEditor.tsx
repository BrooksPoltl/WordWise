import { EditorView } from '@codemirror/view';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EDITOR_CONFIG } from '../constants/editorConstants';
import { useToneAnalysis } from '../hooks/useToneAnalysis';
import { useAuthStore } from '../store/auth/auth.store';
import { autoSaveDocument } from '../store/document/document.actions';
import { useDocumentStore } from '../store/document/document.store';
import { DocumentCodeMirrorEditor } from './editor/DocumentCodeMirrorEditor';
import DocumentSettingsBar from './editor/DocumentSettingsBar';
import { EditorHeader } from './editor/EditorHeader';
import ResponsiveToolbar from './editor/ResponsiveToolbar';
import UpdateContextModal from './editor/UpdateContextModal';

// import { EditorContainer } from './EditorContainer'; - This will be removed and replaced later

const DocumentEditor: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    currentDocument,
    fetchDocument,
    loading: storeLoading,
    error,
    updateDocument,
  } = useDocumentStore();

  // Add tone analysis hook
  const { detectedTone, detectTone, detectToneImmediate } = useToneAnalysis();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const initialToneAnalysisRef = useRef<string | null>(null);

  useEffect(() => {
    if (documentId) {
      setIsComponentLoading(true);
      fetchDocument(documentId).finally(() => {
        setIsComponentLoading(false);
      });
    } else {
      setIsComponentLoading(false);
    }
  }, [documentId, fetchDocument]);

  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.title);
      setCurrentContent(currentDocument.content);
    }
  }, [currentDocument]);

  // Trigger tone analysis for existing content when document loads
  useEffect(() => {
    if (currentDocument?.id && 
        currentDocument.content && 
        currentDocument.content.trim() &&
        initialToneAnalysisRef.current !== currentDocument.id) {
      initialToneAnalysisRef.current = currentDocument.id;
      detectToneImmediate(currentDocument.content);
    }
  }, [currentDocument, detectToneImmediate]);

  // Memoize the content change handler to prevent infinite re-renders
  const handleContentChange = useCallback((content: string) => {
    setCurrentContent(content);
    detectTone(content);
  }, [detectTone]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);

    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current);
    }

    titleTimeoutRef.current = setTimeout(() => {
      if (documentId) {
        autoSaveDocument(documentId, { title: newTitle });
      }
    }, EDITOR_CONFIG.AUTO_SAVE_DELAY);
  };

  const handleDocumentTypeChange = async (newType: string) => {
    if (documentId) {
      updateDocument({ id: documentId, documentType: newType });
    }
  };

  const handleContextUpdate = async (newContext: string) => {
    if (documentId) {
      updateDocument({ id: documentId, context: newContext });
      setIsContextModalOpen(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsDropdownOpen(false);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isLoading = storeLoading || isComponentLoading;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isLoading) {
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
            onClick={() => navigate('/dashboard')}
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
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
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
                AlignWrite Editor
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 px-2 py-2 rounded-md text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <button
                      type="button"
                      onClick={handleProfileClick}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow overflow-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto h-full">
          <EditorHeader
            title={title}
            onTitleChange={handleTitleChange}
          />
          <DocumentSettingsBar
            onOpenContextModal={() => setIsContextModalOpen(true)}
            currentDocumentType={currentDocument?.documentType}
            userRole={user?.role}
            onDocumentTypeChange={handleDocumentTypeChange}
            currentContent={currentContent}
          />
          <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
            {editorView && <ResponsiveToolbar editorView={editorView} detectedTone={detectedTone} />}
            <DocumentCodeMirrorEditor 
              onViewReady={setEditorView} 
              onContentChange={handleContentChange}
            />
          </div>
        </div>
        <UpdateContextModal
          isOpen={isContextModalOpen}
          onClose={() => setIsContextModalOpen(false)}
          onSave={handleContextUpdate}
          initialContext={currentDocument?.context || ''}
          loading={storeLoading}
        />
      </main>
    </div>
  );
};

export default DocumentEditor;
