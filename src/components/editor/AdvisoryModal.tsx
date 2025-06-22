import React, { useEffect, useState } from 'react';
import { ADVISORY_CATEGORIES, CONTEXT_AWARE_CATEGORIES } from '../../constants/advisoryConstants';
import { useAdvisoryStore } from '../../store/advisory';
import { useDocumentStore } from '../../store/document/document.store';

interface AdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvisoryModal: React.FC<AdvisoryModalProps> = ({ isOpen, onClose }) => {
  const { comments, dismissComment, dismissCommentPermanently } = useAdvisoryStore();
  const { currentDocument } = useDocumentStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter to only visible (non-dismissed) comments
  const visibleComments = comments.filter(comment => !comment.dismissed);
  const currentComment = visibleComments[currentIndex];

  // Reset to first comment when modal opens or comments change
  useEffect(() => {
    if (isOpen && visibleComments.length > 0) {
      setCurrentIndex(0);
    }
  }, [isOpen, visibleComments.length]);

  // Close modal if no comments left
  useEffect(() => {
    if (isOpen && visibleComments.length === 0) {
      onClose();
    }
  }, [isOpen, visibleComments.length, onClose]);

  if (!isOpen || !currentComment || !currentDocument) {
    return null;
  }

  const category = ADVISORY_CATEGORIES[currentComment.reason];
  const isContextRecommendation = CONTEXT_AWARE_CATEGORIES.includes(currentComment.reason);
  
  // Dynamic color classes based on recommendation type
  const colors = {
    bg: isContextRecommendation ? 'bg-blue-50' : 'bg-amber-50',
    border: isContextRecommendation ? 'border-blue-200' : 'border-amber-200',
    headerBorder: isContextRecommendation ? 'border-blue-200' : 'border-amber-200',
    icon: isContextRecommendation ? 'bg-blue-500' : 'bg-amber-500',
    text: {
      primary: isContextRecommendation ? 'text-blue-900' : 'text-amber-900',
      secondary: isContextRecommendation ? 'text-blue-700' : 'text-amber-700',
      tertiary: isContextRecommendation ? 'text-blue-800' : 'text-amber-800'
    },
    contentBg: isContextRecommendation ? 'bg-blue-100' : 'bg-amber-100',
    contentBorder: isContextRecommendation ? 'border-blue-400' : 'border-amber-400',
    button: {
      primary: isContextRecommendation ? 'bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700' : 'bg-amber-600 hover:bg-amber-700 border-amber-600 hover:border-amber-700',
      secondary: isContextRecommendation ? 'text-blue-700 hover:text-blue-900 border-blue-300 hover:border-blue-400 hover:bg-blue-100' : 'text-amber-700 hover:text-amber-900 border-amber-300 hover:border-amber-400 hover:bg-amber-100'
    },
    hover: isContextRecommendation ? 'hover:bg-blue-100' : 'hover:bg-amber-100'
  };

  const handleNext = () => {
    if (currentIndex < visibleComments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDismissTemporary = () => {
    dismissComment(currentComment.id);
    // Auto-advance to next comment or close if this was the last
    if (currentIndex >= visibleComments.length - 1) {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else {
        onClose();
      }
    }
  };

  const handleDismissPermanent = () => {
    dismissCommentPermanently(currentComment, currentDocument.id);
    // Auto-advance to next comment or close if this was the last
    if (currentIndex >= visibleComments.length - 1) {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${colors.bg} rounded-lg ${colors.border} shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${colors.headerBorder}`}>
          <div className="flex items-center">
            <span className={`h-4 w-4 rounded-full ${colors.icon} mr-3`} />
            <h2 className={`text-xl font-semibold ${colors.text.primary}`}>
              {category?.label || 'Advisory Comment'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`text-sm ${colors.text.secondary}`}>
              {currentIndex + 1} of {visibleComments.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              className={`${colors.text.secondary} hover:${colors.text.primary} p-1 rounded ${colors.hover}`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Original Text */}
          {currentComment.originalText && (
            <div className="mb-6">
              <h3 className={`text-sm font-medium ${colors.text.tertiary} mb-2`}>Selected Text:</h3>
              <div className={`${colors.contentBg} rounded-lg px-4 py-3 ${colors.text.primary} border-l-4 ${colors.contentBorder}`}>
                &ldquo;{currentComment.originalText}&rdquo;
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="mb-6">
            <h3 className={`text-sm font-medium ${colors.text.tertiary} mb-2`}>Suggestion:</h3>
            <p className={`${colors.text.tertiary} leading-relaxed`}>
              {currentComment.explanation}
            </p>
          </div>

          {/* Category Description */}
          {category?.description && (
            <div className="mb-6">
              <h3 className={`text-sm font-medium ${colors.text.tertiary} mb-2`}>About This Category:</h3>
              <p className={`text-sm ${colors.text.secondary}`}>
                {category.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-6 border-t ${colors.headerBorder} ${colors.bg}`}>
          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`px-3 py-2 text-sm ${colors.text.secondary} hover:${colors.text.primary} disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex >= visibleComments.length - 1}
              className={`px-3 py-2 text-sm ${colors.text.secondary} hover:${colors.text.primary} disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
            >
              Next
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleDismissTemporary}
              className={`px-4 py-2 text-sm ${colors.button.secondary} border rounded`}
            >
              Skip This Time
            </button>
            <button
              type="button"
              onClick={handleDismissPermanent}
              className={`px-4 py-2 text-sm text-white ${colors.button.primary} rounded border`}
            >
              Never Show Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 