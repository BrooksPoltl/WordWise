import { httpsCallable } from 'firebase/functions';
import { functions } from '../config';
import { SpellingSuggestion } from '../types';
import { logger } from './logger';

interface SpellCheckCallableResponse {
  success: boolean;
  suggestionMap: Record<string, string[]>;
  error?: string;
}

/**
 * A service for performing spell checking using the Firebase backend.
 */
class SpellCheckerService {
  /**
   * Calls the 'spellCheck' Firebase Function.
   * @param words - An array of unique words to be checked.
   * @returns A promise that resolves to a map of misspelled words to their suggestions.
   */
  private async callSpellCheck(
    words: string[],
  ): Promise<Record<string, string[]>> {
    logger.info('Calling spellCheck function with', { count: words.length });
    try {
      const spellCheckCallable = httpsCallable<
        { words: string[] },
        SpellCheckCallableResponse
      >(functions, 'spellCheck');

      const result = await spellCheckCallable({ words });
      const { success, suggestionMap, error } = result.data;

      if (!success) {
        throw new Error(error || 'API error during spell check');
      }

      return suggestionMap;
    } catch (error) {
      logger.error('Error calling spellCheck callable:', error);
      throw error;
    }
  }

  /**
   * Performs a full spell check on a given block of text.
   * @param text - The text to check.
   * @returns A promise that resolves to an array of spelling suggestions.
   */
  public async getFullSpellCheck(
    text: string,
  ): Promise<SpellingSuggestion[]> {
    if (!text.trim()) {
      return [];
    }

    const words = this.getUniqueWords(text);
    if (words.length === 0) {
      return [];
    }

    const suggestionMap = await this.callSpellCheck(words);
    if (Object.keys(suggestionMap).length === 0) {
      return []; // No misspellings found
    }

    const suggestions: SpellingSuggestion[] = [];
    const misspelledWords = Object.keys(suggestionMap);

    misspelledWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      let match: RegExpExecArray | null;
      // eslint-disable-next-line no-cond-assign
      while ((match = regex.exec(text))) {
        const startOffset = match.index;
        const endOffset = startOffset + word.length;
        suggestions.push({
          id: `${word}-${startOffset}`,
          word,
          suggestions: suggestionMap[word],
          startOffset,
          endOffset,
          type: 'spelling',
        });
      }
    });

    logger.info('Generated suggestions', { count: suggestions.length });
    return this.removeDuplicateSuggestions(suggestions);
  }

  /**
   * Performs a spell check on a single word.
   * @param word - The word to check.
   * @param startOffset - The starting position of the word in the document.
   * @returns A promise that resolves to a spelling suggestion if the word is misspelled, otherwise null.
   */
  public async checkWord(
    word: string,
    startOffset: number,
  ): Promise<SpellingSuggestion | null> {
    if (!word.trim()) {
      return null;
    }

    const suggestionMap = await this.callSpellCheck([word]);
    const suggestionsForWord = suggestionMap[word];

    if (!suggestionsForWord || suggestionsForWord.length === 0) {
      return null;
    }

    return {
      id: `${word}-${startOffset}`,
      word,
      suggestions: suggestionsForWord,
      startOffset,
      endOffset: startOffset + word.length,
      type: 'spelling',
    };
  }

  /**
   * Applies a given suggestion, replacing the misspelled word in the text
   * and adjusting the offsets of other suggestions.
   * @param text - The original text.
   * @param suggestions - The current list of suggestions.
   * @param targetSuggestion - The suggestion to apply.
   * @param replacement - The word to replace the misspelling with.
   * @returns An object containing the updated text and the adjusted list of suggestions.
   */
  public applySuggestion(
    text: string,
    suggestions: SpellingSuggestion[],
    targetSuggestion: SpellingSuggestion,
    replacement: string,
  ): { updatedText: string; updatedSuggestions: SpellingSuggestion[] } {
    const { startOffset, endOffset, word } = targetSuggestion;

    // Create the new text
    const updatedText =
      text.substring(0, startOffset) +
      replacement +
      text.substring(endOffset);

    // Calculate the change in length
    const delta = replacement.length - word.length;

    // Filter out the applied suggestion and update offsets of subsequent suggestions
    const updatedSuggestions = suggestions
      .filter(s => s.id !== targetSuggestion.id)
      .map(s => {
        if (s.startOffset > startOffset) {
          return {
            ...s,
            startOffset: s.startOffset + delta,
            endOffset: s.endOffset + delta,
          };
        }
        return s;
      });

    return { updatedText, updatedSuggestions };
  }

  /**
   * Removes duplicate suggestions that might arise from multiple checks.
   * A duplicate is defined as a suggestion for the same word at the same start offset.
   * @param suggestions - The array of suggestions to filter.
   * @returns A new array with duplicates removed.
   */
  private removeDuplicateSuggestions(
    suggestions: SpellingSuggestion[],
  ): SpellingSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(s => {
      const identifier = `${s.word}-${s.startOffset}`;
      if (seen.has(identifier)) {
        return false;
      }
      seen.add(identifier);
      return true;
    });
  }

  /**
   * Extracts unique words from a string of text.
   * @param text - The text to process.
   * @returns An array of unique words.
   */
  private getUniqueWords(text: string): string[] {
    const words = text.match(/\b\w+\b/g) || [];
    return [...new Set(words)];
  }
}

const spellChecker = new SpellCheckerService();
export default spellChecker;
