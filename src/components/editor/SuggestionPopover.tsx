import { FloatingContext } from '@floating-ui/react';
import React from 'react';
import { AnySuggestion } from '../../store/suggestion/suggestion.types';
import {
  ClaritySuggestion,
  ConcisenessSuggestion,
  PassiveSuggestion,
  ReadabilitySuggestion
} from '../../types';
import ClaritySuggestionPopover from './ClaritySuggestionPopover';
import ConcisenessSuggestionPopover from './ConcisenessSuggestionPopover';
import PassiveSuggestionPopover from './PassiveSuggestionPopover';
import ReadabilitySuggestionPopover from './ReadabilitySuggestionPopover';

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
  const isGrammarSuggestion = (s: AnySuggestion): boolean =>
    s.type === 'spelling' || s.type === 'grammar' || s.type === 'style';

  const isClaritySuggestion = (s: AnySuggestion): s is ClaritySuggestion =>
    s.type === 'weasel_word';

  const isConcisenessSuggestion = (
    s: AnySuggestion,
  ): s is ConcisenessSuggestion => s.type === 'conciseness';

  const isReadabilitySuggestion = (
    s: AnySuggestion,
  ): s is ReadabilitySuggestion => s.type === 'readability';

  const isPassiveSuggestion = (s: AnySuggestion): s is PassiveSuggestion =>
    s.type === 'passive';

  if (isGrammarSuggestion(suggestion)) {
    // Temporary simple grammar suggestion handler
    // This will be replaced with Harper integration in Phase 1
    return (
      <div
        ref={ref}
        style={style}
        className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs"
      >
        <div className="text-sm font-medium text-gray-900 mb-2">
          Grammar Suggestion
        </div>
        <div className="text-sm text-gray-600 mb-3">
          {suggestion.explanation || 'Grammar improvement suggested'}
        </div>
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
      </div>
    );
  }

  if (isClaritySuggestion(suggestion)) {
    return (
      <ClaritySuggestionPopover
        ref={ref}
        suggestion={suggestion}
        onDismiss={onDismiss}
        onIgnore={onIgnore}
        style={style}
        context={context}
      />
    );
  }

  if (isConcisenessSuggestion(suggestion)) {
    return (
      <ConcisenessSuggestionPopover
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

  if (isReadabilitySuggestion(suggestion)) {
    return (
      <ReadabilitySuggestionPopover
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