import { SuggestionType } from '../types';

/**
 * Maps Harper's lint_kind to our internal suggestion categories
 * Based on the categorization we defined in the planning phase
 */
export const mapHarperLintKind = (lintKind: string): SuggestionType => {
  switch (lintKind.toLowerCase()) {
    // Grammar category
    case 'spelling':
    case 'grammar':
    case 'punctuation':
    case 'casing':
    case 'compounding':
    case 'regional':
    case 'formatting':
      return 'grammar';
    
    // Conciseness category
    case 'redundancy':
    case 'repetition':
      return 'conciseness';
    
    // Readability category
    case 'readability':
      return 'readability';
    
    // Clarity category
    case 'wordchoice':
    case 'style':
    case 'completeness':
    case 'enhancement':
    case 'consistency':
    case 'miscellaneous':
      return 'weasel_word'; // Using existing clarity type
    
    // Default to grammar for unknown types
    default:
      return 'grammar';
  }
};

/**
 * Gets the display title for Harper suggestions
 * This uses Harper's original lint_kind for more specific user feedback
 */
export const getHarperDisplayTitle = (lintKind: string): string => {
  // Capitalize first letter and handle special cases
  const formatted = lintKind.charAt(0).toUpperCase() + lintKind.slice(1);
  
  // Handle special cases for better UX
  switch (lintKind.toLowerCase()) {
    case 'wordchoice':
      return 'Word Choice';
    case 'miscellaneous':
      return 'Style';
    default:
      return formatted;
  }
}; 