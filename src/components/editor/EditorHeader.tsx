import React from 'react';
import { useAdvisoryStore } from '../../store/advisory';
import { useDocumentStore } from '../../store/document/document.store';

interface EditorHeaderProps {
  onSave?: () => void;
  onExport?: () => void;
  title?: string;
  onTitleChange?: (title: string) => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onSave,
  onExport,
  title,
  onTitleChange,
}) => {
  const { refreshComments, comments, isLoading: advisoryLoading } = useAdvisoryStore();
  const { currentDocument } = useDocumentStore();

  const handleRequestAdvisory = async () => {
    if (currentDocument?.content) {
      await refreshComments(currentDocument.content);
    }
  };

  const visibleComments = comments.filter(comment => !comment.dismissed);

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-4">
        {onTitleChange ? (
          <input
            type="text"
            value={title || ''}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            placeholder="Document title..."
          />
        ) : (
          <h1 className="text-xl font-semibold text-gray-900">
            {title || 'Untitled Document'}
          </h1>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {/* Advisory Comments Button */}
        <button
          type="button"
          onClick={handleRequestAdvisory}
          disabled={advisoryLoading || !currentDocument?.content}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {advisoryLoading ? (
            <>
              <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
              Analyzing...
            </>
          ) : (
            <>
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Get Advisory
              {visibleComments.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {visibleComments.length}
                </span>
              )}
            </>
          )}
        </button>

        {/* Save Button */}
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save
          </button>
        )}

        {/* Export Button */}
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Export
          </button>
        )}
      </div>
    </div>
  );
}; 