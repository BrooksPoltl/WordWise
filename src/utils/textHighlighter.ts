import { SpellingSuggestion } from '../types';

/**
 * Utility for highlighting misspelled words in HTML content
 */

interface HighlightOptions {
  className?: string;
  onClick?: (suggestion: SpellingSuggestion) => void;
}

/**
 * Add spell check highlighting to HTML content
 * Wraps misspelled words with spans containing CSS classes
 */
export function highlightSpellingErrors(
  htmlContent: string,
  suggestions: SpellingSuggestion[],
  options: HighlightOptions = {}
): string {
  if (!suggestions.length) {
    return htmlContent;
  }

  // Convert HTML to plain text to calculate offsets
  const plainText = htmlToPlainText(htmlContent);
  
  // Sort suggestions by position (descending) to avoid offset issues
  const sortedSuggestions = [...suggestions].sort((a, b) => b.startOffset - a.startOffset);
  
  let highlightedText = plainText;
  
  // Apply highlighting from end to beginning to avoid offset shifts
  sortedSuggestions.forEach((suggestion) => {
    const { startOffset, endOffset, word, id } = suggestion;
    
    // Validate offsets
    if (startOffset >= 0 && endOffset <= plainText.length && startOffset < endOffset) {
      const actualWord = plainText.substring(startOffset, endOffset);
      
      // Only highlight if the word matches (safety check)
      if (actualWord === word) {
        const beforeText = highlightedText.substring(0, startOffset);
        const afterText = highlightedText.substring(endOffset);
        
        // Create highlighted span
        const highlightedWord = `<span class="spell-error" data-suggestion-id="${id}" title="Click to see suggestions">${word}</span>`;
        
        highlightedText = beforeText + highlightedWord + afterText;
      }
    }
  });
  
  // Convert back to HTML structure while preserving formatting
  return plainTextToHtml(highlightedText, htmlContent);
}

/**
 * Remove all spell check highlighting from HTML content
 */
export function removeSpellingHighlights(htmlContent: string): string {
  return htmlContent.replace(/<span class="spell-error"[^>]*>(.*?)<\/span>/g, '$1');
}

/**
 * Convert HTML to plain text while preserving character positions
 */
function htmlToPlainText(html: string): string {
  // Simple approach: replace HTML tags with spaces and normalize
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Convert highlighted plain text back to HTML structure
 * This is a simplified approach - preserves basic formatting
 */
function plainTextToHtml(highlightedText: string, originalHtml: string): string {
  // For now, we'll use a simple approach that works with basic HTML
  // This could be enhanced for more complex HTML structures
  
  // If the original HTML has basic structure (p, h1, h2, etc.), preserve it
  const hasBasicStructure = /<(p|h[1-6]|div|li)>/i.test(originalHtml);
  
  if (hasBasicStructure) {
    // Extract the structure and replace content
    return originalHtml.replace(/>([^<]+)</g, (match, content) => {
      const plainContent = content.replace(/\s+/g, ' ').trim();
      if (plainContent && highlightedText.includes(plainContent)) {
        // Find and replace this content segment in the highlighted text
        const highlightedSegment = findHighlightedSegment(highlightedText, plainContent);
        return `>${highlightedSegment}<`;
      }
      return match;
    });
  }
  
  // Fallback: wrap in a paragraph if no structure
  return `<p>${highlightedText}</p>`;
}

/**
 * Find a text segment with its highlighting in the highlighted text
 */
function findHighlightedSegment(highlightedText: string, plainSegment: string): string {
  // Look for the segment in the highlighted text
  const segmentStart = highlightedText.indexOf(plainSegment);
  if (segmentStart !== -1) {
    return highlightedText.substring(segmentStart, segmentStart + plainSegment.length);
  }
  
  // If not found directly, look for it with highlights
  // This handles cases where the segment contains highlighted words
  const words = plainSegment.split(/\s+/);
  let result = highlightedText;
  
  words.forEach(word => {
    if (word.length > 0) {
      // Check if this word is highlighted
      const highlightedWordRegex = new RegExp(`<span[^>]*>${word}</span>`, 'gi');
      if (highlightedWordRegex.test(result)) {
        // Word is highlighted, keep the highlight
        return;
      }
    }
  });
  
  return plainSegment; // Fallback to plain segment
}

/**
 * Get suggestion ID from a highlighted element
 */
export function getSuggestionIdFromElement(element: HTMLElement): string | null {
  if (element.classList.contains('spell-error')) {
    return element.getAttribute('data-suggestion-id');
  }
  
  // Check parent elements
  let parent = element.parentElement;
  while (parent) {
    if (parent.classList.contains('spell-error')) {
      return parent.getAttribute('data-suggestion-id');
    }
    parent = parent.parentElement;
  }
  
  return null;
}

/**
 * Highlight a specific suggestion (e.g., when user hovers over it in sidebar)
 */
export function highlightSpecificSuggestion(suggestionId: string): void {
  const element = document.querySelector(`[data-suggestion-id="${suggestionId}"]`);
  if (element) {
    element.classList.add('spell-error-highlight');
    setTimeout(() => {
      element.classList.remove('spell-error-highlight');
    }, 1000);
  }
}

/**
 * Remove highlight from all suggestions
 */
export function removeAllHighlights(): void {
  const elements = document.querySelectorAll('.spell-error-highlight');
  elements.forEach(el => el.classList.remove('spell-error-highlight'));
} 