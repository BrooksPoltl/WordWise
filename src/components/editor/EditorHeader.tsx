import React, { useState } from 'react';
import { ADVISORY_MIN_CONTENT_LENGTH } from '../../constants/advisoryConstants';
import { useAdvisoryStore } from '../../store/advisory';
import { useDocumentStore } from '../../store/document/document.store';
import { AdvisoryModal } from './AdvisoryModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRequestAdvisory = async () => {
    if (currentDocument?.content && currentDocument?.id) {
      await refreshComments(currentDocument.content, currentDocument.id);
    }
  };

  const visibleComments = comments.filter(comment => !comment.dismissed);
  const contentLength = currentDocument?.content?.length || 0;
  const hasMinimumContent = contentLength >= ADVISORY_MIN_CONTENT_LENGTH;
  const canRequestAdvisory = hasMinimumContent && !advisoryLoading && currentDocument?.content;

  // Tooltip text for disabled state
  const getTooltipText = () => {
    if (!currentDocument?.content) return 'No document content';
    if (!hasMinimumContent) {
      const remaining = ADVISORY_MIN_CONTENT_LENGTH - contentLength;
      return `Need ${remaining} more characters for AI analysis (${contentLength}/${ADVISORY_MIN_CONTENT_LENGTH})`;
    }
    if (advisoryLoading) return 'Analyzing document...';
    return 'Get AI-powered writing suggestions';
  };

  return (
    <>
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
          {/* Advisory Comments Buttons - Always visible */}
          <div className="flex items-center space-x-2">
            {/* Get Advisory Button - Always visible with proper states */}
            <div className="relative group">
              <button
                type="button"
                onClick={handleRequestAdvisory}
                disabled={!canRequestAdvisory}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                  canRequestAdvisory
                    ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                }`}
                title={getTooltipText()}
              >
                {advisoryLoading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
                    <span className="hidden sm:inline">Analyzing...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="hidden sm:inline">Get Advisory</span>
                    <span className="sm:hidden">AI</span>
                  </>
                )}
              </button>
              
              {/* Tooltip for disabled state */}
              {!canRequestAdvisory && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {getTooltipText()}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                </div>
              )}
            </div>

            {/* View Comments Button - Always visible, disabled when no comments */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={visibleComments.length === 0}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                visibleComments.length > 0
                  ? 'text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 focus:ring-amber-500'
                  : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
              }`}
              title={visibleComments.length > 0 ? `View ${visibleComments.length} advisory comments` : 'No advisory comments available'}
            >
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.001 8.001 0 01-7.003-4.07L3 20l4.07-2.997A8.001 8.001 0 1121 12z" />
              </svg>
              <span className="hidden sm:inline">View Comments</span>
              <span className="sm:hidden">Comments</span>
              {visibleComments.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-amber-200 text-amber-800 rounded-full">
                  {visibleComments.length}
                </span>
              )}
            </button>
          </div>

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

      {/* Advisory Modal */}
      <AdvisoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}; 