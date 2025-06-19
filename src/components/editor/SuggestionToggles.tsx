import { useSuggestionStore } from '../../store/suggestion/suggestion.store';
import {
    SUGGESTION_CATEGORIES,
    SuggestionCategory,
} from '../../store/suggestion/suggestion.types';

export const SuggestionToggles = () => {
  const { spelling, visibility, toggleVisibility } = useSuggestionStore();

  const suggestionCounts: Record<SuggestionCategory, number> = {
    spelling: spelling.length,
  };

  return (
    <div className="flex items-center space-x-2">
      {(Object.keys(SUGGESTION_CATEGORIES) as SuggestionCategory[]).map(
        (category) => {
          const count = suggestionCounts[category];
          const categoryInfo = SUGGESTION_CATEGORIES[category];
          const isVisible = visibility[category];
          const hasSuggestions = count > 0;

          return (
            <button
              key={category}
              type="button"
              onClick={() => hasSuggestions && toggleVisibility(category)}
              className={`flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                hasSuggestions
                  ? isVisible
                    ? 'opacity-100 hover:opacity-80'
                    : 'opacity-50 hover:opacity-80'
                  : 'cursor-not-allowed opacity-40'
              }`}
              style={{
                backgroundColor:
                  hasSuggestions && isVisible
                    ? categoryInfo.color
                    : '#A1A1AA', // zinc-400 for disabled/inactive
              }}
              disabled={!hasSuggestions}
            >
              <span className="text-white">{categoryInfo.label}</span>
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full bg-white text-xs font-bold ${
                  hasSuggestions ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        },
      )}
    </div>
  );
}; 