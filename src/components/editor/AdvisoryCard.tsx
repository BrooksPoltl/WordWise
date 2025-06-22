import React from 'react';
import { ADVISORY_CATEGORIES } from '../../constants/advisoryConstants';
import { AdvisoryComment } from '../../types';

interface AdvisoryCardProps {
  comment: AdvisoryComment;
  onDismiss: (commentId: string) => void;
}

const AdvisoryCard: React.FC<AdvisoryCardProps> = ({ comment, onDismiss }) => {
  const category = ADVISORY_CATEGORIES[comment.reason];
  
  const handleDismiss = () => {
    onDismiss(comment.id);
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span
            className="h-3 w-3 rounded-full mr-2 flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <h4 className="font-semibold text-gray-800 text-sm">
            {category.label}
          </h4>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
          aria-label="Dismiss advisory comment"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {comment.originalText && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Selected text:</div>
          <div className="bg-gray-50 rounded px-2 py-1 text-sm font-mono text-gray-700 border-l-2" 
               style={{ borderLeftColor: category.color }}>
            &ldquo;{comment.originalText}&rdquo;
          </div>
        </div>
      )}
      
      <div className="text-gray-700 text-sm leading-relaxed">
        {comment.explanation}
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        {category.description}
      </div>
    </div>
  );
};

export default AdvisoryCard; 