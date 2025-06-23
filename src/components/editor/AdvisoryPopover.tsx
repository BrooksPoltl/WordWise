import React from 'react';
import { createPortal } from 'react-dom';
import { ADVISORY_CATEGORIES, CONTEXT_AWARE_CATEGORIES } from '../../constants/advisoryConstants';
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

    // Determine if this is a context-aware category for styling
    const isContextAware = CONTEXT_AWARE_CATEGORIES.includes(comment.reason);
    
    // Dynamic color classes based on category type
    const colors = {
      bg: isContextAware ? 'bg-blue-50' : 'bg-amber-50',
      border: isContextAware ? 'border-blue-200' : 'border-amber-200',
      icon: isContextAware ? 'bg-blue-500' : 'bg-amber-500',
      text: {
        primary: isContextAware ? 'text-blue-900' : 'text-amber-900',
        secondary: isContextAware ? 'text-blue-800' : 'text-amber-800',
        tertiary: isContextAware ? 'text-blue-700' : 'text-amber-700'
      },
      contentBg: isContextAware ? 'bg-blue-100' : 'bg-amber-100',
      contentBorder: isContextAware ? 'border-l-blue-400' : 'border-l-amber-400',
      button: {
        text: isContextAware ? 'text-blue-700 hover:text-blue-900' : 'text-amber-700 hover:text-amber-900',
        bg: isContextAware ? 'hover:bg-blue-100' : 'hover:bg-amber-100',
        border: isContextAware ? 'border-blue-300 hover:border-blue-400' : 'border-amber-300 hover:border-amber-400'
      },
      closeButton: {
        text: isContextAware ? 'text-blue-600 hover:text-blue-800' : 'text-amber-600 hover:text-amber-800',
        bg: isContextAware ? 'hover:bg-blue-100' : 'hover:bg-amber-100'
      }
    };
    
    const handleDismiss = () => {
      onDismiss(comment.id);
    };

    const popoverContent = (
      <div
        ref={ref}
        style={style}
        className={`rounded-lg border shadow-lg max-w-sm z-[110] ${colors.bg} ${colors.border}`}
        role="dialog"
        aria-labelledby="advisory-title"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span
                className={`h-3 w-3 rounded-full mr-2 flex-shrink-0 ${colors.icon}`}
              />
              <h3 id="advisory-title" className={`font-semibold ${colors.text.primary} text-sm`}>
                {category.label}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className={`${colors.closeButton.text} ml-2 flex-shrink-0 p-1 rounded ${colors.closeButton.bg}`}
              aria-label="Dismiss advisory comment"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {comment.originalText && (
            <div className="mb-3">
              <div className={`${colors.contentBg} rounded px-2 py-1 text-sm ${colors.text.secondary} border-l-2 ${colors.contentBorder}`}>
                &ldquo;{comment.originalText}&rdquo;
              </div>
            </div>
          )}
          
          <div className={`${colors.text.secondary} text-sm leading-relaxed mb-3`}>
            {comment.explanation}
          </div>
          
          <div className={`text-xs ${colors.text.tertiary} mb-3`}>
            {category.description}
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleDismiss}
              className={`text-sm ${colors.button.text} px-3 py-1.5 rounded ${colors.button.bg} border ${colors.button.border}`}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );

    return createPortal(popoverContent, document.body);
  }
);

AdvisoryPopover.displayName = 'AdvisoryPopover';

export default AdvisoryPopover; 