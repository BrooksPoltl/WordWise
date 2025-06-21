import React from 'react';
import { SUGGESTION_CATEGORIES } from '../../store/suggestion/suggestion.types';
import { HarperSuggestion } from '../../types/harper';

interface HarperSuggestionPopoverProps {
  suggestion: HarperSuggestion;
  onAccept: (replacementText: string) => void;
  onDismiss: () => void;
  style?: React.CSSProperties;
}

const HarperSuggestionPopover = React.forwardRef<
  HTMLDivElement,
  HarperSuggestionPopoverProps
>(({ suggestion, onAccept, onDismiss, style }, ref) => {
  const handleAccept = (replacementText: string) => {
    onAccept(replacementText);
  };

  return (
    <div
      ref={ref}
      className="absolute z-10 w-64 max-w-xs rounded-md border border-gray-200 bg-white p-3 shadow-lg border-t-4"
      style={{ 
        ...style, 
        borderColor: SUGGESTION_CATEGORIES.spelling.color // Default to spelling color
      }}
    >
      <div className="mb-2 text-sm font-semibold text-gray-800">
        Grammar Suggestion
      </div>
      <div className="mb-3 text-sm text-gray-600">
        <span className="font-medium">Issue:</span> {suggestion.message}
      </div>
      
      <div className="mb-3 text-sm text-gray-600">
        <span className="font-medium">Found:</span> &quot;{suggestion.problemText}&quot;
      </div>

      {suggestion.replacements.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-gray-600 mb-2">Suggestions:</div>
          <div className="flex flex-col space-y-1">
            {suggestion.replacements.slice(0, 3).map((replacement: string, _index: number) => (
              <button
                key={`${suggestion.id}-${replacement}`}
                type="button"
                className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-gray-100 rounded-md"
                onClick={() => handleAccept(replacement)}
              >
                &quot;{replacement}&quot;
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-2 flex justify-end space-x-2">
        <button
          type="button"
          className="text-xs text-gray-500 hover:text-gray-700"
          onClick={onDismiss}
        >
          Dismiss
        </button>
        {suggestion.replacements.length > 0 && (
          <button
            type="button"
            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
            onClick={() => handleAccept(suggestion.replacements[0])}
          >
            Accept First
          </button>
        )}
      </div>
    </div>
  );
});

HarperSuggestionPopover.displayName = 'HarperSuggestionPopover';

export default HarperSuggestionPopover; 