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

interface TextChunk {
  text: string;
  startOffset: number;
}

/**
 * Simplified SpellChecker Service
 * 
 * Key improvements:
 * - Processes text in chunks to handle large documents
 * - Uses reverse-order application to avoid offset shifts
 * - Simplified API with better error handling
 * - Proper debouncing and caching
 */
class SpellCheckerService {
  private readonly debounceMs = 1500;
  private readonly maxChunkSize = 2000; // Characters per chunk
  private readonly minChunkOverlap = 100; // Overlap to catch word boundaries
  
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastCheckedText = '';
  private cachedSuggestions: SpellingSuggestion[] = [];
  
  /**
   * Main entry point for spell checking
   */
  public checkText(text: string, callback: (suggestions: SpellingSuggestion[]) => void): void {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // If text hasn't changed significantly, return cached results
    if (this.shouldUseCachedResults(text)) {
      callback(this.cachedSuggestions);
      return;
    }
    
    // Debounce the actual check
    this.debounceTimer = setTimeout(async () => {
      try {
        const suggestions = await this.performSpellCheck(text);
        this.lastCheckedText = text;
        this.cachedSuggestions = suggestions;
        callback(suggestions);
      } catch (error) {
        console.error('Spell check failed:', error);
        callback([]);
      }
    }, this.debounceMs);
  }
  
  /**
   * Apply a suggestion and return updated suggestions list
   * Processes in reverse order to avoid offset management complexity
   */
  public applySuggestion(
    suggestions: SpellingSuggestion[], 
    targetSuggestion: SpellingSuggestion, 
    replacement: string
  ): SpellingSuggestion[] {
    // Sort by position (descending) to apply from end to beginning
    const sortedSuggestions = [...suggestions].sort((a, b) => b.startOffset - a.startOffset);
    const targetIndex = sortedSuggestions.findIndex(s => s.id === targetSuggestion.id);
    
    if (targetIndex === -1) {
      return suggestions; // Suggestion not found
    }
    
    // Remove the applied suggestion and return the rest
    return suggestions.filter(s => s.id !== targetSuggestion.id);
  }
  
  /**
   * Get metrics for text without spell checking
   */
  public calculateMetrics(text: string): WritingMetrics {
    const words = this.getWords(text);
    
    return {
      wordCount: words.length,
      characterCount: text.length,
      spellingErrors: 0 // Will be updated by caller
    };
  }
  
  /**
   * Perform full spell check (used for manual refresh)
   */
  public async getFullSpellCheck(text: string): Promise<SpellCheckResult> {
    const suggestions = await this.performSpellCheck(text);
    const metrics = this.calculateMetrics(text);
    
    return {
      suggestions,
      metrics: {
        ...metrics,
        spellingErrors: suggestions.length
      }
    };
  }
  
  // Private methods
  
  private shouldUseCachedResults(text: string): boolean {
    if (!this.lastCheckedText || !this.cachedSuggestions.length) {
      return false;
    }
    
    // Use simple similarity check - if 90% similar, use cache
    const similarity = this.calculateSimilarity(this.lastCheckedText, text);
    return similarity > 0.9;
  }
  
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(this.getWords(text1));
    const words2 = new Set(this.getWords(text2));
    const union = new Set([...words1, ...words2]);
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    
    return intersection.size / union.size;
  }
  
  private async performSpellCheck(text: string): Promise<SpellingSuggestion[]> {
    // Handle empty or very short text
    if (!text.trim() || text.trim().length < 3) {
      return [];
    }
    
    // For large texts, process in chunks
    if (text.length > this.maxChunkSize) {
      return this.processTextInChunks(text);
    }
    
    // For normal-sized text, process directly
    return this.checkTextChunk(text, 0);
  }
  
  private async processTextInChunks(text: string): Promise<SpellingSuggestion[]> {
    const chunks = this.createTextChunks(text);
    const allSuggestions: SpellingSuggestion[] = [];
    
    // Process chunks in parallel for better performance
    const chunkPromises = chunks.map(chunk => 
      this.checkTextChunk(chunk.text, chunk.startOffset)
    );
    
    const chunkResults = await Promise.allSettled(chunkPromises);
    
    // Collect successful results
    chunkResults.forEach(result => {
      if (result.status === 'fulfilled') {
        allSuggestions.push(...result.value);
      }
    });
    
    // Remove duplicates that might occur at chunk boundaries
    return this.removeDuplicateSuggestions(allSuggestions);
  }
  
  private createTextChunks(text: string): TextChunk[] {
    const chunks: TextChunk[] = [];
    let currentPos = 0;
    
    while (currentPos < text.length) {
      const chunkEnd = Math.min(currentPos + this.maxChunkSize, text.length);
      
      // Try to break at a word boundary if we're not at the end
      let actualEnd = chunkEnd;
      if (chunkEnd < text.length) {
        const nextSpace = text.indexOf(' ', chunkEnd);
        const prevSpace = text.lastIndexOf(' ', chunkEnd);
        
        // Choose the closer word boundary
        if (nextSpace !== -1 && (prevSpace === -1 || (nextSpace - chunkEnd) < (chunkEnd - prevSpace))) {
          actualEnd = nextSpace;
        } else if (prevSpace !== -1) {
          actualEnd = prevSpace;
        }
      }
      
      chunks.push({
        text: text.substring(currentPos, actualEnd + this.minChunkOverlap),
        startOffset: currentPos
      });
      
      currentPos = actualEnd;
    }
    
    return chunks;
  }
  
  private async checkTextChunk(text: string, globalOffset: number): Promise<SpellingSuggestion[]> {
    try {
      const response = await fetch(this.getFunctionsUrl() + '/spellCheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result: SpellCheckResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API error');
      }
      
      // Adjust offsets for global position and validate
      return result.suggestions
        .map(suggestion => ({
          ...suggestion,
          startOffset: suggestion.startOffset + globalOffset,
          endOffset: suggestion.endOffset + globalOffset
        }))
        .filter(suggestion => 
          // Validate that offsets are reasonable
          suggestion.startOffset >= 0 && 
          suggestion.endOffset > suggestion.startOffset &&
          suggestion.word && 
          suggestion.word.length > 0
        );
        
    } catch (error) {
      console.error('Chunk spell check failed:', error);
      return [];
    }
  }
  
  private removeDuplicateSuggestions(suggestions: SpellingSuggestion[]): SpellingSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      const key = `${suggestion.startOffset}-${suggestion.endOffset}-${suggestion.word}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  private getWords(text: string): string[] {
    return text
      .split(/\s+/)
      .map(word => word.trim())
      .filter(word => word.length > 0);
  }
  
  private getFunctionsUrl(): string {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5001/wordwise-34da3/us-central1';
    }
    return 'https://us-central1-wordwise-34da3.cloudfunctions.net';
  }
}

export const spellChecker = new SpellCheckerService(); 