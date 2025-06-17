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
    // Remove HTML tags for spell checking
    const plainText = this.stripHTML(text);
    this.debouncedCheck(plainText, callback);
  }

  private async performCheck(text: string, callback: (suggestions: SpellingSuggestion[]) => void) {
    try {
      const result = await this.spellCheck(text);
      callback(result.suggestions);
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
    const plainText = this.stripHTML(text);
    const words = plainText.split(/\s+/).filter(word => word.length > 0);
    
    return {
      wordCount: words.length,
      characterCount: plainText.length,
      spellingErrors: 0 // Will be updated by the component
    };
  }

  public async getFullSpellCheck(text: string): Promise<SpellCheckResult> {
    const plainText = this.stripHTML(text);
    return await this.spellCheck(plainText);
  }
}

export const spellChecker = new SpellCheckerService(); 