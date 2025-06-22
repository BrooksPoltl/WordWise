import React from 'react';
import { useAdvisoryStore } from '../../store/advisory';
import AdvisoryCard from './AdvisoryCard';

export const AdvisoryModal: React.FC = () => {
  const { comments, isLoading, error, dismissComment } = useAdvisoryStore();

  // Since we're now using inline comments, this modal can be simplified
  // or potentially removed entirely in favor of the inline popover system
  const visibleComments = comments.filter(comment => !comment.dismissed);

  if (visibleComments.length === 0 && !isLoading && !error) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Advisory Comments
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered suggestions to improve your document
          </p>
        </div>

        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              <span className="ml-3 text-gray-600">Analyzing document...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error generating suggestions
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && visibleComments.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No suggestions available</h3>
              <p className="text-gray-600">
                Your document looks good! Try writing more content to get AI-powered suggestions.
              </p>
            </div>
          )}

          {!isLoading && !error && visibleComments.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Found {visibleComments.length} suggestion{visibleComments.length !== 1 ? 's' : ''} for improvement:
              </div>
              {visibleComments.map((comment) => (
                <AdvisoryCard
                  key={comment.id}
                  comment={comment}
                  onDismiss={dismissComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 