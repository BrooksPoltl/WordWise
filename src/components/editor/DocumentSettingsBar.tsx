import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ADVISORY_MIN_CONTENT_LENGTH } from '../../constants/advisoryConstants';
import { DOCUMENT_TYPES_BY_ROLE } from '../../constants/documentConstants';
import { useAdvisoryStore } from '../../store/advisory';
import { useAuthStore } from '../../store/auth/auth.store';
import { useDocumentStore } from '../../store/document/document.store';
import { AdvisoryModal } from './AdvisoryModal';

interface DocumentSettingsBarProps {
  onOpenContextModal: () => void;
  currentDocumentType?: string;
  userRole?: string;
  onDocumentTypeChange: (newType: string) => void;
  currentContent?: string;
}

const DocumentSettingsBar: React.FC<DocumentSettingsBarProps> = ({
  onOpenContextModal,
  currentDocumentType,
  userRole,
  onDocumentTypeChange,
  currentContent = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Advisory functionality
  const { refreshComments, comments, isLoading: advisoryLoading } = useAdvisoryStore();
  const { currentDocument } = useDocumentStore();
  const { user } = useAuthStore();

  const getAvailableTypes = () => {
    let allTypes: string[] = [];
    if (userRole === 'Product Manager') {
      allTypes = DOCUMENT_TYPES_BY_ROLE['Product Manager'].map(
        type => type.name,
      );
    } else if (userRole === 'Software Engineer') {
      allTypes = DOCUMENT_TYPES_BY_ROLE['Software Engineer'].map(
        type => type.name,
      );
    }
    return allTypes.filter(type => type !== currentDocumentType);
  };

  const availableTypes = getAvailableTypes();

  const handleSelect = async (type: string) => {
    setIsOpen(false);
    try {
      await onDocumentTypeChange(type);
    } catch (error) {
      // Error handling is in parent
    }
  };

  const handleToggleDropdown = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  // Advisory button handlers
  const handleRequestAdvisory = async () => {
    if (currentContent && currentDocument?.id) {
      await refreshComments(
        currentContent, 
        currentDocument.id,
        currentDocumentType || '',
        currentDocument.context || '',
        user?.persona || ''
      );
    }
  };

  const visibleComments = comments.filter(comment => !comment.dismissed);
  const contentLength = currentContent?.length || 0;
  const hasMinimumContent = contentLength >= ADVISORY_MIN_CONTENT_LENGTH;
  const canRequestAdvisory = hasMinimumContent && !advisoryLoading && currentContent;

  // Tooltip text for disabled state
  const getTooltipText = () => {
    if (!currentContent) return 'No document content';
    if (!hasMinimumContent) {
      const remaining = ADVISORY_MIN_CONTENT_LENGTH - contentLength;
      return `Need ${remaining} more characters for AI analysis (${contentLength}/${ADVISORY_MIN_CONTENT_LENGTH})`;
    }
    if (advisoryLoading) return 'Analyzing document...';
    return 'Get AI-powered writing suggestions';
  };

  // Tooltip text for View Comments button
  const getViewCommentsTooltipText = () => {
    if (visibleComments.length > 0) {
      return `View ${visibleComments.length} advisory comments`;
    }
    if (!hasMinimumContent) {
      const remaining = ADVISORY_MIN_CONTENT_LENGTH - contentLength;
      return `Need ${remaining} more characters for AI analysis (${contentLength}/${ADVISORY_MIN_CONTENT_LENGTH})`;
    }
    return 'No advisory comments available';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;

      const target = event.target as Node;
      
      // Check if click is inside the dropdown button
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }
      
      // Check if click is inside the dropdown content (which is now in a portal)
      const dropdownContent = document.querySelector('[data-dropdown-content]');
      if (dropdownContent && dropdownContent.contains(target)) {
        return;
      }
      
      // If click is outside both button and content, close dropdown
      setIsOpen(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <div className="flex items-center justify-between space-x-4 py-2 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200/60 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={handleToggleDropdown}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center shadow-sm"
            >
              {currentDocumentType || 'Select Type'}
              <svg
                className="w-4 h-4 ml-2"
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
            {isOpen && createPortal(
              <div 
                data-dropdown-content
                className="fixed bg-white rounded-md shadow-xl z-[110] border border-gray-200"
                style={{
                  top: `${buttonPosition.top + 4}px`,
                  left: `${buttonPosition.left}px`,
                  minWidth: '192px'
                }}
              >
                {availableTypes.length > 0 ? (
                  availableTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSelect(type)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                    >
                      {type}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No other types available
                  </div>
                )}
              </div>,
              document.body
            )}
          </div>
          <button
            type="button"
            onClick={onOpenContextModal}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
          >
            Context
          </button>
        </div>

        {/* Advisory Comments Buttons - Always visible */}
        <div className="flex items-center space-x-2">
          {/* Get Advisory Button - Always visible with proper states */}
          <div className="relative group">
            <button
              type="button"
              onClick={handleRequestAdvisory}
              disabled={!canRequestAdvisory}
              className={`flex items-center px-3 py-1 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm ${
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
                  <span className="hidden sm:inline">Get Feedback</span>
                  <span className="sm:hidden">AI</span>
                </>
              )}
            </button>
            
            {/* Tooltip for disabled state */}
            {!canRequestAdvisory && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[110]">
                {getTooltipText()}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
              </div>
            )}
          </div>

          {/* View Comments Button - Always visible, disabled when no comments */}
          <button
            type="button"
            onClick={() => setIsAdvisoryModalOpen(true)}
            disabled={visibleComments.length === 0}
            className={`flex items-center px-3 py-1 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors shadow-sm ${
              visibleComments.length > 0
                ? 'text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 focus:ring-amber-500'
                : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
            }`}
            title={getViewCommentsTooltipText()}
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
      </div>

      {/* Advisory Modal */}
      <AdvisoryModal 
        isOpen={isAdvisoryModalOpen} 
        onClose={() => setIsAdvisoryModalOpen(false)} 
      />
    </>
  );
};

export default DocumentSettingsBar; 