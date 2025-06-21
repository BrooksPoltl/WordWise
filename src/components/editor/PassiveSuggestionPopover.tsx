import {
    FloatingContext,
    useClick,
    useDismiss,
    useInteractions,
} from '@floating-ui/react';
import React, { useEffect, useState } from 'react';
import { usePassiveRewrite } from '../../hooks/usePassiveRewrite';
import { SUGGESTION_CATEGORIES } from '../../store/suggestion/suggestion.types';
import { PassiveSuggestion } from '../../types';

interface PassiveSuggestionPopoverProps {
  suggestion: PassiveSuggestion;
  onAccept: (suggestion: PassiveSuggestion) => void;
  onDismiss: () => void;
  onIgnore: (suggestion: PassiveSuggestion) => void;
  style: React.CSSProperties;
  context: FloatingContext;
}

const PassiveSuggestionPopover = React.forwardRef<
  HTMLDivElement,
  PassiveSuggestionPopoverProps
>(({ suggestion, onAccept, onDismiss, onIgnore, style, context }, ref) => {
  const { getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  const { rewriteSentence, isLoading } = usePassiveRewrite();
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
      style={{ ...style, borderColor: SUGGESTION_CATEGORIES.passive.color }}
      {...getFloatingProps()}
    >
      <div className="mb-2 text-sm font-semibold text-gray-800">
        Passive Voice
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
            Suggested Rewrite (Active Voice):
          </div>
          <p className="rounded-md bg-orange-50 p-2 text-sm text-orange-600">
            &quot;{rewrittenText}&quot;
          </p>
          <div className="mt-3 flex justify-end space-x-2">
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
            <button
              type="button"
              className="rounded-md bg-orange-600 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-700"
              onClick={() => onAccept(suggestion)}
            >
              Accept
            </button>
          </div>
        </div>
      )}

      {!rewrittenText && !isLoading && (
        <div className="mt-2 flex justify-end space-x-2">
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
      )}
    </div>
  );
});

PassiveSuggestionPopover.displayName = 'PassiveSuggestionPopover';

export default PassiveSuggestionPopover; 