import React from 'react';
import { useAdvisoryStore } from '../../store/advisory';

interface EditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  loading: boolean;
  documentContent: string;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  onTitleChange,
  loading,
  documentContent,
}) => {
  const { requestSuggestions, openModal, suggestions, isLoading: advisoryLoading } = useAdvisoryStore();

  const handleGetAdvice = async () => {
    if (!documentContent.trim()) {
      return;
    }
    await requestSuggestions(documentContent);
  };

  const handleOpenComments = () => {
    openModal();
  };

  const hasComments = suggestions.length > 0;

  return (
    <div className="flex items-center justify-between mb-4">
      <input
        type="text"
        value={title}
        onChange={e => onTitleChange(e.target.value)}
        placeholder="Document title..."
        className="text-2xl font-bold border-none outline-none bg-transparent flex-1 mr-4"
        disabled={loading}
      />
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        {loading && (
          <div className="flex items-center space-x-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
            <span>Saving...</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleOpenComments}
            disabled={!hasComments}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
            title={hasComments ? `View ${suggestions.length} comment${suggestions.length === 1 ? '' : 's'}` : 'No comments available'}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Comments</span>
            {hasComments && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                {suggestions.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={handleGetAdvice}
            disabled={advisoryLoading || !documentContent.trim()}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {advisoryLoading ? 'Analyzing...' : 'Get Comments'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorHeader; 