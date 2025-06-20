import React from 'react';
import { useAdvisoryStore } from '../../store/advisory';
import { AdvisoryCard } from './AdvisoryCard';

export const AdvisoryModal: React.FC = () => {
  const { isOpen, isLoading, suggestions, error, dismissSuggestion, closeModal } = useAdvisoryStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Document Advisory
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              AI-powered suggestions to improve your document&apos;s substance and structure
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                <span className="text-gray-600">Analyzing your document...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && suggestions.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Great work!</h3>
              <p className="text-gray-600">
                No advisory suggestions found. Your document appears to be well-structured with strong arguments.
              </p>
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Suggestions ({suggestions.length})
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Review these suggestions to strengthen your document&apos;s impact and clarity.
                </p>
              </div>

              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <AdvisoryCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onDismiss={dismissSuggestion}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isLoading && (
          <div className="flex justify-end p-6 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 