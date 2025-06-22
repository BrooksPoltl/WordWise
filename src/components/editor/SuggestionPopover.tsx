import React from 'react';
import {
  AnySuggestion,
  SUGGESTION_CATEGORIES,
} from '../../store/suggestion/suggestion.types';
import { BaseSuggestion, SuggestionAction } from '../../types';

interface SuggestionPopoverProps {
  suggestion: AnySuggestion;
  onAccept: (suggestion: AnySuggestion, action?: SuggestionAction) => void;
  onIgnore: (suggestion: AnySuggestion) => void;
  style: React.CSSProperties;
}

const appearanceMap: {
  [key: string]: {
    color: string;
    bgColor: string;
    borderColor: string;
    buttonBgColor: string;
    buttonHoverBgColor: string;
    buttonRingColor: string;
  };
} = {
  grammar: {
    color: SUGGESTION_CATEGORIES.grammar.color,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    buttonBgColor: 'bg-red-500',
    buttonHoverBgColor: 'hover:bg-red-600',
    buttonRingColor: 'focus:ring-red-500',
  },
  spelling: {
    color: '#ef4444', // red-500
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    buttonBgColor: 'bg-red-500',
    buttonHoverBgColor: 'hover:bg-red-600',
    buttonRingColor: 'focus:ring-red-500',
  },
  clarity: {
    color: SUGGESTION_CATEGORIES.clarity.color,
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    buttonBgColor: 'bg-violet-500',
    buttonHoverBgColor: 'hover:bg-violet-600',
    buttonRingColor: 'focus:ring-violet-500',
  },
  conciseness: {
    color: SUGGESTION_CATEGORIES.conciseness.color,
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    buttonBgColor: 'bg-cyan-500',
    buttonHoverBgColor: 'hover:bg-cyan-600',
    buttonRingColor: 'focus:ring-cyan-500',
  },
  readability: {
    color: SUGGESTION_CATEGORIES.readability.color,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    buttonBgColor: 'bg-emerald-500',
    buttonHoverBgColor: 'hover:bg-emerald-600',
    buttonRingColor: 'focus:ring-emerald-500',
  },
  passive: {
    color: SUGGESTION_CATEGORIES.passive.color,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    buttonBgColor: 'bg-orange-500',
    buttonHoverBgColor: 'hover:bg-orange-600',
    buttonRingColor: 'focus:ring-orange-500',
  },
};

const getSuggestionAppearance = (
  type: AnySuggestion['type'],
) => appearanceMap[type] || appearanceMap.spelling; // Default to spelling

const SuggestionPopover = React.forwardRef<
  HTMLDivElement,
  SuggestionPopoverProps
>(({ suggestion, onAccept, onIgnore, style }, ref) => {
  const appearance = getSuggestionAppearance(
    suggestion.type,
  );

  const handleFix = () => {
    const primaryAction =
      'actions' in suggestion && suggestion.actions?.[0]
        ? suggestion.actions[0]
        : undefined;

    onAccept(suggestion, primaryAction);
  };

  const renderMessage = (s: BaseSuggestion) => {
    if (s.type === 'spelling' && s.actions?.[0]?.type === 'replace') {
      return (
        <span>
          Did you mean <strong>{s.actions[0].text}</strong>?
        </span>
      );
    }
    return s.explanation || 'Improvement suggestion';
  };

  const fixButtonText =
    'actions' in suggestion &&
    suggestion.actions?.[0]?.type === 'replace' &&
    suggestion.actions?.[0].text
      ? suggestion.actions[0].text
      : 'Fix';

  return (
    <div
      ref={ref}
      style={style}
      className={`rounded-lg border p-4 shadow-lg max-w-sm ${appearance.bgColor} ${appearance.borderColor}`}
      role="dialog"
      aria-labelledby="suggestion-title"
    >
      <div className="flex items-center mb-2">
        <span
          className="h-3 w-3 rounded-full mr-2"
          style={{ backgroundColor: appearance.color }}
        />
        <h3 id="suggestion-title" className="font-semibold text-gray-800">
          {suggestion.title}
        </h3>
      </div>
      <div className="text-gray-700 mb-4 ml-5">{renderMessage(suggestion)}</div>
      <div className="flex items-center gap-2 ml-5">
        <button
          type="button"
          onClick={handleFix}
          className={`px-4 py-1.5 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${appearance.buttonBgColor} ${appearance.buttonHoverBgColor} ${appearance.buttonRingColor}`}
        >
          {fixButtonText}
        </button>
        <button
          type="button"
          onClick={() => onIgnore(suggestion)}
          className="text-gray-600 font-medium hover:text-gray-800"
        >
          Ignore
        </button>
      </div>
    </div>
  );
});

SuggestionPopover.displayName = 'SuggestionPopover';

export default SuggestionPopover; 