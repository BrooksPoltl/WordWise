import {
    FloatingContext,
    useClick,
    useDismiss,
    useInteractions,
} from '@floating-ui/react';
import React from 'react';
import { SUGGESTION_CATEGORIES } from '../../store/suggestion/suggestion.types';
import { SpellingSuggestion } from '../../types';

interface SpellingSuggestionPopoverProps {
  suggestion: SpellingSuggestion;
  onAccept: (suggestion: SpellingSuggestion) => void;
  onDismiss: () => void;
  onIgnore: (suggestion: SpellingSuggestion) => void;
  style: React.CSSProperties;
  context: FloatingContext;
}

const SpellingSuggestionPopover = React.forwardRef<
  HTMLDivElement,
  SpellingSuggestionPopoverProps
>(({ suggestion, onAccept, onDismiss, onIgnore, style, context }, ref) => {
  const { getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  const handleAccept = (suggestionToAccept: SpellingSuggestion) => {
    onAccept(suggestionToAccept);
  };

  if (!suggestion.suggestions.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className="absolute z-10 w-64 max-w-xs rounded-md border border-gray-200 bg-white p-3 shadow-lg border-t-4"
      style={{ ...style, borderColor: SUGGESTION_CATEGORIES.spelling.color }}
      {...getFloatingProps()}
    >
      <div className="mb-2 text-sm font-semibold text-gray-800">
        Spelling Error
      </div>
      <p className="mb-3 text-sm text-gray-600">
        Did you mean one of these?
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestion.suggestions.slice(0, 3).map(option => (
          <button
            key={option.id}
            type="button"
            className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-gray-100 rounded-md"
            onClick={() =>
              handleAccept({ ...suggestion, suggestions: [option] })
            }
          >
            {option.text}
          </button>
        ))}
      </div>
      <div className="border-t border-gray-200 mt-2 pt-2 flex justify-end space-x-2">
        <button
          type="button"
          className="text-xs text-gray-500 hover:text-gray-700"
          onClick={() => onIgnore(suggestion)}
        >
          Ignore
        </button>
        <button
          type="button"
          className="text-xs text-gray-500 hover:text-gray-700"
          onClick={onDismiss}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
});

SpellingSuggestionPopover.displayName = 'SpellingSuggestionPopover';

export default SpellingSuggestionPopover; 