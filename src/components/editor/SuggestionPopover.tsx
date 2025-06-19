import { FloatingContext } from '@floating-ui/react';
import React from 'react';
import { AnySuggestion } from '../../store/suggestion/suggestion.types';
import { ClaritySuggestion, SpellingSuggestion } from '../../types';
import ClaritySuggestionPopover from './ClaritySuggestionPopover';
import SpellingSuggestionPopover from './SpellingSuggestionPopover';

interface SuggestionPopoverProps {
  suggestion: AnySuggestion;
  onAccept: (suggestion: AnySuggestion) => void;
  onDismiss: () => void;
  style: React.CSSProperties;
  context: FloatingContext;
}

const SuggestionPopover = React.forwardRef<
  HTMLDivElement,
  SuggestionPopoverProps
>(({ suggestion, onAccept, onDismiss, style, context }, ref) => {
  const isSpellingSuggestion = (s: AnySuggestion): s is SpellingSuggestion =>
    s.type === 'spelling' || s.type === 'grammar' || s.type === 'style';

  const isClaritySuggestion = (s: AnySuggestion): s is ClaritySuggestion =>
    s.type === 'weasel_word';

  if (isSpellingSuggestion(suggestion)) {
    return (
      <SpellingSuggestionPopover
        ref={ref}
        suggestion={suggestion}
        onAccept={onAccept}
        onDismiss={onDismiss}
        style={style}
        context={context}
      />
    );
  }

  if (isClaritySuggestion(suggestion)) {
    return (
      <ClaritySuggestionPopover
        ref={ref}
        suggestion={suggestion}
        onDismiss={onDismiss}
        style={style}
        context={context}
      />
    );
  }

  return null;
});

SuggestionPopover.displayName = 'SuggestionPopover';

export default SuggestionPopover; 