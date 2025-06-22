import React from 'react';
import {
  AnySuggestion,
  SUGGESTION_CATEGORIES,
  SuggestionCategory,
} from '../../store/suggestion/suggestion.types';
import { BaseSuggestion, SuggestionAction, SuggestionType } from '../../types';
import { logger } from '../../utils/logger';

interface SuggestionPopoverProps {
  suggestion: AnySuggestion;
  onAccept: (suggestion: AnySuggestion, action?: SuggestionAction) => void;
  onIgnore: (suggestion: AnySuggestion) => void;
  style: React.CSSProperties;
}

const mapSuggestionTypeToCategory = (
  type: SuggestionType | string,
): SuggestionCategory => {
  const normalizedType = type.toLowerCase().replace(/\s+/g, '');
  
  switch (normalizedType) {
    case 'style':
    case 'weasel_word':
    case 'capitalization':
    case 'wordchoice':
    case 'word_choice':
    case 'enhancement':
    case 'miscellaneous':
      return 'clarity';
    case 'conciseness':
    case 'repetition':
    case 'redundancy':
      return 'conciseness';
    case 'readability':
      return 'readability';
    case 'passive':
      return 'passive';
    case 'spelling':
    case 'grammar':
    default:
      return 'grammar';
  }
};

const normalizeDisplayTitle = (title: string): string => {
  const normalized = title.toLowerCase().replace(/\s+/g, '');
  if (normalized === 'wordchoice') {
    return 'Word Choice';
  }
  return title;
};

const appearanceMap: {
  [key in SuggestionCategory]: {
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
  clarity: {
    color: SUGGESTION_CATEGORIES.clarity.color,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    buttonBgColor: 'bg-blue-500',
    buttonHoverBgColor: 'hover:bg-blue-600',
    buttonRingColor: 'focus:ring-blue-500',
  },
  conciseness: {
    color: SUGGESTION_CATEGORIES.conciseness.color,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    buttonBgColor: 'bg-green-500',
    buttonHoverBgColor: 'hover:bg-green-600',
    buttonRingColor: 'focus:ring-green-500',
  },
  readability: {
    color: SUGGESTION_CATEGORIES.readability.color,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    buttonBgColor: 'bg-purple-500',
    buttonHoverBgColor: 'hover:bg-purple-600',
    buttonRingColor: 'focus:ring-purple-500',
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

const getSuggestionAppearance = (type: AnySuggestion['type']) => {
  const category = mapSuggestionTypeToCategory(type);
  return appearanceMap[category];
};

const SuggestionPopover = React.forwardRef<
  HTMLDivElement,
  SuggestionPopoverProps
>(({ suggestion, onAccept, onIgnore, style }, ref) => {
  const appearance = getSuggestionAppearance(suggestion.type);

  const handleFix = () => {
    const primaryAction =
      'actions' in suggestion && suggestion.actions?.[0]
        ? suggestion.actions[0]
        : undefined;

    onAccept(suggestion, primaryAction);
  };

  const renderMessage = (s: BaseSuggestion) => {
    logger.debug('renderMessage called with suggestion:', {
      type: s.type,
      explanation: s.explanation,
      actions: s.actions,
      hasActions: !!s.actions,
      firstActionType: s.actions?.[0]?.type,
      firstActionText: s.actions?.[0]?.type === 'replace' ? s.actions[0].text : undefined
    });

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

  const shouldShowFixButton = 
    'actions' in suggestion && 
    suggestion.actions?.[0] && 
    suggestion.actions[0].type !== 'remove' &&
    suggestion.actions[0].text !== 'Ignore';

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
          {normalizeDisplayTitle(suggestion.title)}
        </h3>
      </div>
      <div className="text-gray-700 mb-4 ml-3 sm:ml-5">{renderMessage(suggestion)}</div>
      <div className="flex items-center gap-2 ml-3 sm:ml-5">
        {shouldShowFixButton && (
          <button
            type="button"
            onClick={handleFix}
            className={`px-4 py-1.5 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${appearance.buttonBgColor} ${appearance.buttonHoverBgColor} ${appearance.buttonRingColor}`}
          >
            {fixButtonText}
          </button>
        )}
        <button
          type="button"
          onClick={() => onIgnore(suggestion)}
          className="text-gray-600 font-medium hover:text-gray-800 px-2 py-1"
        >
          Ignore
        </button>
      </div>
    </div>
  );
});

SuggestionPopover.displayName = 'SuggestionPopover';

export default SuggestionPopover; 