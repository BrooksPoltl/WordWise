import React from 'react';
import { AIAdvisorySuggestion } from '../../types';

interface AdvisoryCardProps {
  suggestion: AIAdvisorySuggestion;
  onDismiss: (suggestionId: string) => void;
}

export const AdvisoryCard: React.FC<AdvisoryCardProps> = ({
  suggestion,
  onDismiss,
}) => {
  const handleDismiss = () => {
    onDismiss(suggestion.id);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Original Text */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Text:</h4>
        <div className="bg-gray-50 rounded-md p-3 border-l-4 border-blue-400">
          <p className="text-sm text-gray-700 italic">&ldquo;{suggestion.originalText}&rdquo;</p>
        </div>
      </div>

      {/* Advisory Explanation */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Suggestion:</h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          {suggestion.explanation}
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}; 