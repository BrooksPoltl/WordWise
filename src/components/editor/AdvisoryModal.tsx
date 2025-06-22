import React, { useEffect, useState } from 'react';
import { ADVISORY_CATEGORIES } from '../../constants/advisoryConstants';
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
      <div className="bg-amber-50 rounded-lg border border-amber-200 shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-amber-200">
          <div className="flex items-center">
            <span className="h-4 w-4 rounded-full bg-amber-500 mr-3" />
            <h2 className="text-xl font-semibold text-amber-900">
              {category?.label || 'Advisory Comment'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-amber-700">
              {currentIndex + 1} of {visibleComments.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-amber-600 hover:text-amber-800 p-1 rounded hover:bg-amber-100"
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
              <h3 className="text-sm font-medium text-amber-800 mb-2">Selected Text:</h3>
              <div className="bg-amber-100 rounded-lg px-4 py-3 text-amber-900 border-l-4 border-amber-400">
                &ldquo;{currentComment.originalText}&rdquo;
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-amber-800 mb-2">Suggestion:</h3>
            <p className="text-amber-800 leading-relaxed">
              {currentComment.explanation}
            </p>
          </div>

          {/* Category Description */}
          {category?.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-amber-800 mb-2">About This Category:</h3>
              <p className="text-sm text-amber-700">
                {category.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-amber-200 bg-amber-25">
          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-3 py-2 text-sm text-amber-700 hover:text-amber-900 disabled:text-amber-400 disabled:cursor-not-allowed flex items-center"
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
              className="px-3 py-2 text-sm text-amber-700 hover:text-amber-900 disabled:text-amber-400 disabled:cursor-not-allowed flex items-center"
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
              className="px-4 py-2 text-sm text-amber-700 hover:text-amber-900 border border-amber-300 hover:border-amber-400 rounded hover:bg-amber-100"
            >
              Skip This Time
            </button>
            <button
              type="button"
              onClick={handleDismissPermanent}
              className="px-4 py-2 text-sm text-white bg-amber-600 hover:bg-amber-700 rounded border border-amber-600 hover:border-amber-700"
            >
              Never Show Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 