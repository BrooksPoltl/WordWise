import {
    FloatingContext,
    useClick,
    useDismiss,
    useInteractions,
} from '@floating-ui/react';
import React from 'react';
import { SUGGESTION_CATEGORIES } from '../../store/suggestion/suggestion.types';
import { ClaritySuggestion } from '../../types';

interface ClaritySuggestionPopoverProps {
  suggestion: ClaritySuggestion;
  onDismiss: () => void;
  style: React.CSSProperties;
  context: FloatingContext;
}

const ClaritySuggestionPopover = React.forwardRef<
  HTMLDivElement,
  ClaritySuggestionPopoverProps
>(({ suggestion, onDismiss, style, context }, ref) => {
  const { getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  return (
    <div
      ref={ref}
      className="absolute z-10 w-64 max-w-xs rounded-md border border-gray-200 bg-white p-3 shadow-lg border-t-4"
      style={{ ...style, borderColor: SUGGESTION_CATEGORIES.clarity.color }}
      {...getFloatingProps()}
    >
      <div className="mb-2 text-sm font-semibold text-gray-800">
        Clarity Note
      </div>
      <div className="text-sm text-gray-700">{suggestion.explanation}</div>
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

ClaritySuggestionPopover.displayName = 'ClaritySuggestionPopover';

export default ClaritySuggestionPopover; 