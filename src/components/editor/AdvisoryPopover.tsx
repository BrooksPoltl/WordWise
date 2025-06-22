import React from 'react';
import { ADVISORY_CATEGORIES } from '../../constants/advisoryConstants';
import { AdvisoryComment } from '../../types';
import { logger } from '../../utils/logger';

interface AdvisoryPopoverProps {
  comment: AdvisoryComment;
  onDismiss: (commentId: string) => void;
  style: React.CSSProperties;
}

const AdvisoryPopover = React.forwardRef<HTMLDivElement, AdvisoryPopoverProps>(
  ({ comment, onDismiss, style }, ref) => {
    // Defensive check for comment validity
    if (!comment || !comment.reason) {
      logger.warning('AdvisoryPopover received invalid comment:', comment);
      return null;
    }
    
    const category = ADVISORY_CATEGORIES[comment.reason];
    
    // Defensive check for category validity
    if (!category) {
      logger.warning('AdvisoryPopover: Unknown advisory category:', comment.reason);
      return null;
    }
    
    const handleDismiss = () => {
      onDismiss(comment.id);
    };

    return (
      <div
        ref={ref}
        style={style}
        className="rounded-lg border shadow-lg max-w-sm bg-white border-gray-200 z-50"
        role="dialog"
        aria-labelledby="advisory-title"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span
                className="h-3 w-3 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <h3 id="advisory-title" className="font-semibold text-gray-800 text-sm">
                {category.label}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0 p-1 rounded hover:bg-gray-100"
              aria-label="Dismiss advisory comment"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {comment.originalText && (
            <div className="mb-3">
              <div className="bg-gray-50 rounded px-2 py-1 text-sm text-gray-700 border-l-2" 
                   style={{ borderLeftColor: category.color }}>
                &ldquo;{comment.originalText}&rdquo;
              </div>
            </div>
          )}
          
          <div className="text-gray-700 text-sm leading-relaxed mb-3">
            {comment.explanation}
          </div>
          
          <div className="text-xs text-gray-500 mb-3">
            {category.description}
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded hover:bg-gray-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }
);

AdvisoryPopover.displayName = 'AdvisoryPopover';

export default AdvisoryPopover; 