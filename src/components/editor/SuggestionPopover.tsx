import { FloatingContext } from '@floating-ui/react';
import React from 'react';
import { AnySuggestion } from '../../store/suggestion/suggestion.types';
import {
  PassiveSuggestion
} from '../../types';
import PassiveSuggestionPopover from './PassiveSuggestionPopover';

interface SuggestionPopoverProps {
  suggestion: AnySuggestion;
  onAccept: (suggestion: AnySuggestion) => void;
  onDismiss: () => void;
  onIgnore: (suggestion: AnySuggestion) => void;
  style: React.CSSProperties;
  context: FloatingContext;
}

const SuggestionPopover = React.forwardRef<
  HTMLDivElement,
  SuggestionPopoverProps
>(({ suggestion, onAccept, onDismiss, onIgnore, style, context }, ref) => {
  const isHarperSuggestion = (s: AnySuggestion): boolean =>
    s.type === 'spelling' || s.type === 'grammar' || s.type === 'style' ||
    s.type === 'weasel_word' || s.type === 'conciseness' || s.type === 'readability';

  const isPassiveSuggestion = (s: AnySuggestion): s is PassiveSuggestion =>
    s.type === 'passive';

  if (isHarperSuggestion(suggestion)) {
    // Enhanced Harper suggestion handler for all Harper-powered suggestions
    return (
      <div
        ref={ref}
        style={style}
        className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs"
      >
        <div className="text-sm font-medium text-gray-900 mb-2">
          {suggestion.title || 'Writing Suggestion'}
        </div>
        <div className="text-sm text-gray-600 mb-3">
          {suggestion.explanation || 'Improvement suggested'}
        </div>
        
        {/* Render Harper actions if available */}
        {'actions' in suggestion && suggestion.actions && suggestion.actions.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs text-gray-500 mb-1">Suggestions:</div>
            <div className="flex flex-wrap gap-1 mb-3">
              {suggestion.actions.map((action, index) => {
                let buttonText = 'Apply';
                let buttonTitle = `Apply: ${action.type}`;
                
                if (action.type === 'replace') {
                  buttonText = action.text;
                  buttonTitle = `Apply: ${action.text}`;
                } else if (action.type === 'remove') {
                  buttonText = 'Remove';
                  buttonTitle = 'Apply: Remove';
                } else if (action.type === 'insert_after') {
                  buttonText = `Add "${action.text}"`;
                  buttonTitle = `Apply: Add "${action.text}"`;
                }
                
                return (
                  <button
                    key={`${suggestion.id}-action-${action.type}-${action.type === 'replace' ? action.text : index}`}
                    type="button"
                    onClick={() => onAccept(suggestion)}
                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    title={buttonTitle}
                  >
                    {buttonText}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onDismiss}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => onIgnore(suggestion)}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
              >
                Ignore
              </button>
            </div>
          </div>
        ) : (
          // Fallback for legacy suggestions without actions
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAccept(suggestion)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => onIgnore(suggestion)}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            >
              Ignore
            </button>
          </div>
        )}
      </div>
    );
  }

  if (isPassiveSuggestion(suggestion)) {
    return (
      <PassiveSuggestionPopover
        ref={ref}
        suggestion={suggestion}
        onAccept={onAccept}
        onDismiss={onDismiss}
        onIgnore={onIgnore}
        style={style}
        context={context}
      />
    );
  }

  return null;
});

SuggestionPopover.displayName = 'SuggestionPopover';

export default SuggestionPopover; 