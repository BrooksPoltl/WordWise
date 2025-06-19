import nspell from 'nspell';
import { SpellingSuggestion } from '../types';

export class BrowserSpellChecker {
  private spell: ReturnType<typeof nspell> | null = null;

  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initializationPromise = this.init();
  }

  private async init(): Promise<void> {
    try {
      const [affResponse, dicResponse] = await Promise.all([
        fetch('/dictionaries/index.aff'),
        fetch('/dictionaries/index.dic'),
      ]);

      if (!affResponse.ok || !dicResponse.ok) {
        throw new Error('Failed to load dictionary files');
      }

      const [aff, dic] = await Promise.all([
        affResponse.text(),
        dicResponse.text(),
      ]);

      this.spell = nspell({ aff, dic });
    } catch (error) {
      throw error;
    }
  }

  public async isReady(): Promise<boolean> {
    if (!this.initializationPromise) return false;
    try {
      await this.initializationPromise;
      return this.spell !== null;
    } catch (error) {
      return false;
    }
  }

  public async suggest(word: string): Promise<string[]> {
    await this.initializationPromise;
    if (!this.spell) {
      return [];
    }
    return this.spell.suggest(word);
  }

  public async correct(word: string): Promise<boolean> {
    await this.initializationPromise;
    if (!this.spell) {
      return false;
    }
    return this.spell.correct(word);
  }

  static applySuggestion(
    text: string,
    suggestions: SpellingSuggestion[],
    targetSuggestion: SpellingSuggestion,
    replacement: string,
  ): { updatedText: string; updatedSuggestions: SpellingSuggestion[] } {
    const { startOffset, endOffset, word } = targetSuggestion;

    const updatedText =
      text.substring(0, startOffset) +
      replacement +
      text.substring(endOffset);

    const delta = replacement.length - word.length;

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
}

export const browserSpellChecker = new BrowserSpellChecker(); 