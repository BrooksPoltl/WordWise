import {
    FloatingContext,
    useClick,
    useDismiss,
    useInteractions,
} from '@floating-ui/react';
import React, { useEffect, useState } from 'react';
import { useReadabilityRewrite } from '../../hooks/useReadabilityRewrite';
import { SUGGESTION_CATEGORIES } from '../../store/suggestion/suggestion.types';
import { ReadabilitySuggestion } from '../../types';

interface ReadabilitySuggestionPopoverProps {
  suggestion: ReadabilitySuggestion;
  onAccept: (suggestion: ReadabilitySuggestion) => void;
  onDismiss: () => void;
  style: React.CSSProperties;
  context: FloatingContext;
}

const ReadabilitySuggestionPopover = React.forwardRef<
  HTMLDivElement,
  ReadabilitySuggestionPopoverProps
>(({ suggestion, onAccept, onDismiss, style, context }, ref) => {
  const { getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  const { rewriteSentence, isLoading } = useReadabilityRewrite();
  const [hasTriggeredRewrite, setHasTriggeredRewrite] = useState(false);

  const hasRewrite = suggestion.suggestions && suggestion.suggestions.length > 0;
  const rewrittenText =
    suggestion.suggestions && suggestion.suggestions.length > 0
      ? suggestion.suggestions[0].text
      : null;

  // Lazy retry: trigger rewrite when popover opens if no rewrite exists
  useEffect(() => {
    if (!hasRewrite && !hasTriggeredRewrite && !isLoading) {
      rewriteSentence(suggestion);
      setHasTriggeredRewrite(true);
    }
  }, [suggestion, hasRewrite, hasTriggeredRewrite, isLoading, rewriteSentence]);

  return (
    <div
      ref={ref}
      className="absolute z-10 w-64 max-w-xs rounded-md border border-gray-200 bg-white p-3 shadow-lg border-t-4"
      style={{ ...style, borderColor: SUGGESTION_CATEGORIES.readability.color }}
      {...getFloatingProps()}
    >
      <div className="mb-2 text-sm font-semibold text-gray-800">
        Readability Note
      </div>
      <p className="mb-3 text-sm text-gray-600">{suggestion.explanation}</p>

      {(isLoading || (!hasRewrite && hasTriggeredRewrite)) && (
        <div className="animate-pulse text-sm text-gray-500">
          Getting suggestion...
        </div>
      )}

      {rewrittenText && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <div className="mb-2 text-sm font-semibold text-gray-800">
            Suggested Rewrite:
          </div>
          <p className="rounded-md bg-blue-50 p-2 text-sm text-blue-600">
            &quot;{rewrittenText}&quot;
          </p>
          <div className="mt-3 flex justify-end space-x-2">
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={onDismiss}
            >
              Dismiss
            </button>
            <button
              type="button"
              className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
              onClick={() => onAccept(suggestion)}
            >
              Accept
            </button>
          </div>
        </div>
      )}

      {!rewrittenText && !isLoading && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={onDismiss}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
});

ReadabilitySuggestionPopover.displayName = 'ReadabilitySuggestionPopover';

export default ReadabilitySuggestionPopover; 