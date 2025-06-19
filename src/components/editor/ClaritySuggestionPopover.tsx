import {
    FloatingContext,
    useClick,
    useDismiss,
    useInteractions,
} from '@floating-ui/react';
import React from 'react';
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
      className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-lg p-2 max-w-xs"
      style={style}
      {...getFloatingProps()}
    >
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