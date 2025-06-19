import { useSuggestionStore } from '../../store/suggestion/suggestion.store';
import {
  SUGGESTION_CATEGORIES,
  SuggestionCategory,
} from '../../store/suggestion/suggestion.types';

export const SuggestionToggles = () => {
  const { visibility, toggleVisibility } = useSuggestionStore((state) => ({
    visibility: state.visibility,
    toggleVisibility: state.toggleVisibility,
  }));

  const suggestionCounts: Record<SuggestionCategory, number> = {
    spelling: useSuggestionStore((state) => state.spelling.length),
    clarity: useSuggestionStore((state) => state.clarity.length),
    conciseness: useSuggestionStore((state) => state.conciseness.length),
  };

  const categories = Object.keys(suggestionCounts) as SuggestionCategory[];

  return (
    <div className="flex items-center space-x-2">
      {categories.map(
        (category) => {
          const count = suggestionCounts[category];
          const categoryInfo = SUGGESTION_CATEGORIES[category];
          const isVisible = visibility[category];

          return (
            <button
              key={category}
              type="button"
              onClick={() => toggleVisibility(category)}
              className={`flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-80 ${
                isVisible ? 'opacity-100' : 'opacity-60'
              }`}
              style={{
                backgroundColor: isVisible ? categoryInfo.color : '#A1A1AA', // zinc-400 for inactive
              }}
            >
              <span className="text-white">{categoryInfo.label}</span>
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full bg-white text-xs font-bold ${
                  count > 0 ? 'text-gray-700' : 'text-gray-400'
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