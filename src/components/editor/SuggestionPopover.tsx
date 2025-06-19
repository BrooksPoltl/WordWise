import {
    FloatingContext,
    useClick,
    useDismiss,
    useInteractions,
} from '@floating-ui/react';
import React from 'react';
import { SpellingSuggestion, SuggestionOption } from '../../types';

interface SuggestionPopoverProps {
  suggestion: SpellingSuggestion;
  onAccept: (suggestion: SpellingSuggestion) => void;
  onDismiss: () => void;
  style: React.CSSProperties;
  context: FloatingContext;
}

const SuggestionPopover = React.forwardRef<
  HTMLDivElement,
  SuggestionPopoverProps
>(({ suggestion, onAccept, onDismiss, style, context }, ref) => {
  const { getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  if (!suggestion.suggestions.length) {
    return null;
  }

  const handleAccept = (option: SuggestionOption) => {
    onAccept({
      ...suggestion,
      suggestions: [option],
    });
  };

  return (
    <div
      ref={ref}
      className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-lg p-2"
      style={style}
      {...getFloatingProps()}
    >
      <div className="text-sm text-gray-600 mb-2">
        Did you mean:
      </div>
      <div className="flex flex-col space-y-1">
        {suggestion.suggestions.slice(0, 3).map(option => (
          <button
            key={option.id}
            type="button"
            className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-gray-100 rounded-md"
            onClick={() => handleAccept(option)}
          >
            {option.text}
          </button>
        ))}
      </div>
       <div className="border-t border-gray-200 mt-2 pt-2 flex justify-end">
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

SuggestionPopover.displayName = 'SuggestionPopover';

export default SuggestionPopover; 