import React from 'react';
import { SpellingSuggestion, WritingMetrics } from '../types';

interface SuggestionSidebarProps {
  suggestions: SpellingSuggestion[];
  metrics: WritingMetrics;
  onApplySuggestion: (
    suggestion: SpellingSuggestion,
    replacement: string
  ) => void;
  onDismissSuggestion: (suggestionId: string) => void;
}

const SuggestionSidebar: React.FC<SuggestionSidebarProps> = ({
  suggestions,
  metrics,
  onApplySuggestion,
  onDismissSuggestion,
}) => {
  const getOverallScore = () => {
    const totalWords = metrics.wordCount;
    const errors = suggestions.length;
    if (totalWords === 0) return 100;

    const errorRate = errors / totalWords;
    const score = Math.max(0, Math.min(100, Math.round((1 - errorRate) * 100)));
    return score;
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">✓ Spell Check</h2>
          <span className="text-sm text-gray-500">{suggestions.length}</span>
        </div>

        {/* Overall Score */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Spelling score</span>
              <span className="font-medium">{getOverallScore()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getOverallScore()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Words:</span>
            <span className="ml-1 font-medium">{metrics.wordCount}</span>
          </div>
          <div>
            <span className="text-gray-600">Characters:</span>
            <span className="ml-1 font-medium">{metrics.characterCount}</span>
          </div>
          <div>
            <span className="text-gray-600">Errors:</span>
            <span className="ml-1 font-medium text-red-600">
              {suggestions.length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Accuracy:</span>
            <span className="ml-1 font-medium">{getOverallScore()}%</span>
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="flex-1">
        {suggestions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="text-4xl mb-2">✨</div>
            <p className="text-sm">No spelling errors found!</p>
            <p className="text-xs text-gray-400 mt-1">
              Great job with your spelling.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="px-4 py-2 bg-gray-50 border-b">
              <div className="flex items-center space-x-2">
                <span>🔴</span>
                <span className="text-sm font-medium">Spelling</span>
                <span className="text-xs text-gray-500">
                  {suggestions.length} error
                  {suggestions.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {suggestions.map(suggestion => (
              <div
                key={suggestion.id}
                data-sidebar-suggestion={suggestion.id}
                className="p-4 border-l-4 border-red-500 bg-red-50 hover:bg-red-100"
              >
                <div className="mb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        &quot;{suggestion.word}&quot;
                      </p>
                    </div>
                    <button type="button"
                      onClick={() => onDismissSuggestion(suggestion.id)}
                      className="text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-1">
                    {suggestion.suggestions.length > 0 ? (
                      suggestion.suggestions.map((replacement) => (
                        <button type="button"
                          key={`${suggestion.id}-${replacement}`}
                          onClick={() =>
                            onApplySuggestion(suggestion, replacement)
                          }
                          className="block w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded hover:bg-green-50 hover:border-green-500 transition-colors"
                        >
                          {replacement}
                        </button>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500 italic px-3 py-2">
                        No suggestions available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionSidebar;
