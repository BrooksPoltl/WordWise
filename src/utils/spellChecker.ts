import { SpellingSuggestion, WritingMetrics } from '../types';

interface SpellCheckResult {
  suggestions: SpellingSuggestion[];
  metrics: WritingMetrics;
}

interface SpellCheckResponse {
  success: boolean;
  suggestions: SpellingSuggestion[];
  metrics: WritingMetrics;
  error?: string;
}

class SpellCheckerService {
  private readonly debouncedCheck: (text: string, callback: (suggestions: SpellingSuggestion[]) => void) => void;

  // Removed custom words logic as requested

  constructor() {
    this.debouncedCheck = this.debounce(this.performCheck.bind(this), 1000); // Increased to 1 second
  }

  private debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), wait);
    };
  }

  // Get the Firebase functions URL based on environment
  private getFunctionsUrl(): string {
    // Check if we're in development (emulator)
    if (window.location.hostname === 'localhost') {
      // Firebase emulator uses project-id in the URL
      return 'http://localhost:5001/wordwise-34da3/us-central1'; 
    }
    // In production
    return 'https://us-central1-wordwise-34da3.cloudfunctions.net';
  }

  public checkText(text: string, callback: (suggestions: SpellingSuggestion[]) => void) {
    // Since we're now working with plain text consistently, no need for complex mapping
    this.debouncedCheck(text, callback);
  }

  private async performCheck(text: string, callback: (suggestions: SpellingSuggestion[]) => void) {
    try {
      const result = await this.spellCheck(text);

      // NEW: ensure every suggestion has valid offsets. If missing, derive them from the plain text.
      const completedSuggestions = this.fillMissingOffsets(text, result.suggestions);

      callback(completedSuggestions);
    } catch (error) {
      console.error('Spell check failed:', error);
      callback([]); // Return empty suggestions on error
    }
  }

  private async spellCheck(text: string): Promise<SpellCheckResult> {
    try {
      const functionsUrl = this.getFunctionsUrl();
      
      const response = await fetch(`${functionsUrl}/spellCheck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SpellCheckResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Spell check failed');
      }

      return {
        suggestions: result.suggestions,
        metrics: result.metrics
      };

    } catch (error) {
      console.error('Spell check error:', error);
      
      // Fallback: return empty results if the API fails
      const words = text.split(/\s+/).filter(word => word.length > 0);
      return {
        suggestions: [],
        metrics: {
          wordCount: words.length,
          characterCount: text.length,
          spellingErrors: 0
        }
      };
    }
  }

  private stripHTML(html: string): string {
    // Simple HTML stripping
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  public calculateMetrics(text: string): WritingMetrics {
    // text is now already plain text, no need to strip HTML
    const words = text.split(/\s+/).filter(word => word.length > 0);
    
    return {
      wordCount: words.length,
      characterCount: text.length,
      spellingErrors: 0 // Will be updated by the component
    };
  }

  public async getFullSpellCheck(text: string): Promise<SpellCheckResult> {
    // text is now already plain text
    return await this.spellCheck(text);
  }

  // NEW helper – derive offsets when the API omits them.
  private fillMissingOffsets(text: string, suggestions: SpellingSuggestion[]): SpellingSuggestion[] {
    // Track ranges we have already assigned to avoid duplicate matches
    const usedRanges: Array<{ start: number; end: number }> = suggestions
      .filter(s => s.startOffset != null && !Number.isNaN(s.startOffset))
      .map(s => ({ start: s.startOffset, end: s.endOffset }));

    const isRangeFree = (start: number, end: number) => {
      return !usedRanges.some(r => (start < r.end && end > r.start));
    };

    const result = suggestions.map((s) => {
      if (s.startOffset != null && !Number.isNaN(s.startOffset)) {
        // Already has offsets
        return s;
      }

      // Attempt to locate the word in the remaining text
      const word = s.word;
      if (!word) return s; // give up if we don't have the word

      // Search for the first free occurrence of the word
      let searchStart = 0;
      let foundIndex = -1;
      while (searchStart < text.length) {
        foundIndex = text.indexOf(word, searchStart);
        if (foundIndex === -1) break;

        const potentialStart = foundIndex;
        const potentialEnd = foundIndex + word.length;

        if (isRangeFree(potentialStart, potentialEnd)) {
          // Ensure we're matching complete words (boundary check)
          const beforeChar = text[potentialStart - 1];
          const afterChar = text[potentialEnd];
          const isBoundaryStart = potentialStart === 0 || /\W/.test(beforeChar);
          const isBoundaryEnd = potentialEnd === text.length || /\W/.test(afterChar);

          if (isBoundaryStart && isBoundaryEnd) {
            // Accept this occurrence
            s.startOffset = potentialStart;
            s.endOffset = potentialEnd;
            usedRanges.push({ start: potentialStart, end: potentialEnd });
            break;
          }
        }
        // Continue searching after this position
        searchStart = foundIndex + 1;
      }
      return s;
    });

    return result;
  }
}

export const spellChecker = new SpellCheckerService(); 