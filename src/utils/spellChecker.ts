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

interface BatchSpellCheckResponse {
  success: boolean;
  suggestions: SpellingSuggestion[];
  metrics: WritingMetrics;
  error?: string;
}

interface TextChunk {
  text: string;
  startOffset: number;
}

interface PendingCheck {
  text: string;
  callback: (suggestions: SpellingSuggestion[]) => void;
  timestamp: number;
}

/**
 * Enhanced SpellChecker Service with improved text change handling
 *
 * Key improvements:
 * - Better text removal detection and suggestion cleanup
 * - Batch processing for paste events
 * - Request deduplication and conflict resolution
 * - Improved offset management for large text changes
 * - Smart suggestion invalidation on text edits
 */
class SpellCheckerService {
  private readonly debounceMs = 1500;
  private readonly maxChunkSize = 2000;
  private readonly minChunkOverlap = 100;
  private readonly maxBatchSize = 10; // Maximum words to check in one batch call

  private debounceTimer: NodeJS.Timeout | null = null;
  private lastCheckedText = '';
  private cachedSuggestions: SpellingSuggestion[] = [];
  private activeRequests = new Map<string, Promise<SpellingSuggestion[]>>();
  private pendingChecks: PendingCheck[] = [];

  /**
   * Main entry point for spell checking with improved text change detection
   */
  public checkText(
    text: string,
    callback: (suggestions: SpellingSuggestion[]) => void,
    options: { isPaste?: boolean; forceCheck?: boolean } = {}
  ): void {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Handle text removal - invalidate suggestions that no longer apply
    if (text.length < this.lastCheckedText.length) {
      const validSuggestions = this.filterValidSuggestions(text, this.cachedSuggestions);
      if (validSuggestions.length !== this.cachedSuggestions.length) {
        this.cachedSuggestions = validSuggestions;
        callback(validSuggestions);
      }
    }

    // If text hasn't changed significantly and we have recent results, use cache
    if (!options.forceCheck && this.shouldUseCachedResults(text)) {
      callback(this.cachedSuggestions);
      return;
    }

    // For paste operations, use immediate batch processing
    if (options.isPaste) {
      this.handlePasteEvent(text, callback);
      return;
    }

    // Queue the check with debouncing
    this.pendingChecks.push({
      text,
      callback,
      timestamp: Date.now()
    });

    // Debounce the actual check
    this.debounceTimer = setTimeout(async () => {
      await this.processPendingChecks();
    }, this.debounceMs);
  }

  /**
   * Handle paste events with immediate full text processing
   */
  private async handlePasteEvent(
    text: string,
    callback: (suggestions: SpellingSuggestion[]) => void
  ): Promise<void> {
    console.log('📋 [SPELL CHECK] Paste event detected:', {
      newTextLength: text.length,
      previousTextLength: this.lastCheckedText.length,
      textDifference: text.length - this.lastCheckedText.length,
      timestamp: new Date().toISOString()
    });

    try {
      // For paste events, send the full text for comprehensive spell checking
      const suggestions = await this.performSpellCheck(text);
      
      console.log('✅ [SPELL CHECK] Paste processing complete:', {
        suggestionsFound: suggestions.length,
        suggestions,
        timestamp: new Date().toISOString()
      });
      
      this.lastCheckedText = text;
      this.cachedSuggestions = suggestions;
      callback(suggestions);
    } catch (error) {
      console.error('❌ [SPELL CHECK] Paste spell check failed:', {
        error: error instanceof Error ? error.message : String(error),
        textLength: text.length,
        timestamp: new Date().toISOString()
      });
      
      // Fallback to empty suggestions on error
      callback([]);
    }
  }

  /**
   * Process all pending checks, using the most recent one
   */
  private async processPendingChecks(): Promise<void> {
    if (this.pendingChecks.length === 0) return;

    // Get the most recent check
    const latestCheck = this.pendingChecks[this.pendingChecks.length - 1];
    this.pendingChecks = [];

    try {
      const suggestions = await this.performSpellCheck(latestCheck.text);
      this.lastCheckedText = latestCheck.text;
      this.cachedSuggestions = suggestions;
      latestCheck.callback(suggestions);
    } catch (error) {
      console.error('Spell check failed:', error);
      latestCheck.callback([]);
    }
  }

  /**
   * Detect changes between old and new text
   */
  private detectTextChanges(oldText: string, newText: string): {
    addedWords: string[];
    removedWords: string[];
    wordPositions: Map<string, { start: number; end: number }>;
  } {
    const oldWords = this.getWordsWithPositions(oldText);
    const newWords = this.getWordsWithPositions(newText);
    
    const oldWordSet = new Set(oldWords.map(w => w.word.toLowerCase()));
    const newWordSet = new Set(newWords.map(w => w.word.toLowerCase()));
    
    const addedWords = newWords
      .filter(w => !oldWordSet.has(w.word.toLowerCase()))
      .map(w => w.word);
    
    const removedWords = oldWords
      .filter(w => !newWordSet.has(w.word.toLowerCase()))
      .map(w => w.word);
    
    const wordPositions = new Map<string, { start: number; end: number }>();
    newWords.forEach(w => {
      wordPositions.set(w.word, { start: w.startOffset, end: w.endOffset });
    });
    
    return { addedWords, removedWords, wordPositions };
  }

  /**
   * Get words with their positions in the text
   */
  private getWordsWithPositions(text: string): Array<{
    word: string;
    startOffset: number;
    endOffset: number;
  }> {
    const words: Array<{ word: string; startOffset: number; endOffset: number }> = [];
    const wordRegex = /\b\w+\b/g;
    let match;
    
    while ((match = wordRegex.exec(text)) !== null) {
      words.push({
        word: match[0],
        startOffset: match.index,
        endOffset: match.index + match[0].length
      });
    }
    
    return words;
  }

  /**
   * Check multiple words in a single batch request
   */
  private async checkWordsBatch(
    words: string[],
    wordPositions: Map<string, { start: number; end: number }>
  ): Promise<SpellingSuggestion[]> {
    if (words.length === 0) return [];

    // Create a unique key for this batch request
    const batchKey = words.sort().join('|');
    
    // Check if we already have a request for this batch
    if (this.activeRequests.has(batchKey)) {
      return this.activeRequests.get(batchKey)!;
    }

    // Create the batch request
    const requestPromise = this.performBatchSpellCheck(words, wordPositions);
    this.activeRequests.set(batchKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.activeRequests.delete(batchKey);
    }
  }

  /**
   * Perform batch spell check for multiple words
   */
  private async performBatchSpellCheck(
    words: string[],
    wordPositions: Map<string, { start: number; end: number }>
  ): Promise<SpellingSuggestion[]> {
    console.log('📦 [SPELL CHECK] Batch request initiated:', {
      totalWords: words.length,
      words,
      maxBatchSize: this.maxBatchSize,
      timestamp: new Date().toISOString()
    });

    try {
      // Split into smaller batches if needed
      const batches = this.splitIntoBatches(words, this.maxBatchSize);
      const allSuggestions: SpellingSuggestion[] = [];

      console.log('🔢 [SPELL CHECK] Split into batches:', {
        totalBatches: batches.length,
        batchSizes: batches.map(b => b.length),
        timestamp: new Date().toISOString()
      });

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const requestPayload = { 
          mode: 'batchSpell',
          words: batch.map(word => ({
            word,
            startOffset: wordPositions.get(word)?.start || 0,
            endOffset: wordPositions.get(word)?.end || 0
          })),
          limitSuggestions: true 
        };

        console.log(`🚀 [SPELL CHECK] Batch ${i + 1}/${batches.length} request:`, {
          batchIndex: i,
          wordsInBatch: batch.length,
          words: batch,
          payload: requestPayload,
          timestamp: new Date().toISOString()
        });

        const response = await fetch(`${this.getFunctionsUrl()}/spellCheck`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });

        console.log(`📡 [SPELL CHECK] Batch ${i + 1}/${batches.length} response status:`, {
          batchIndex: i,
          status: response.status,
          statusText: response.statusText,
          timestamp: new Date().toISOString()
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result: BatchSpellCheckResponse = await response.json();

        console.log(`✅ [SPELL CHECK] Batch ${i + 1}/${batches.length} response data:`, {
          batchIndex: i,
          success: result.success,
          suggestionsCount: result.suggestions?.length || 0,
          suggestions: result.suggestions,
          metrics: result.metrics,
          error: result.error,
          timestamp: new Date().toISOString()
        });

        if (result.success) {
          allSuggestions.push(...result.suggestions);
        }
      }

      console.log('🎯 [SPELL CHECK] Batch processing complete:', {
        totalWords: words.length,
        totalBatches: batches.length,
        totalSuggestions: allSuggestions.length,
        allSuggestions,
        timestamp: new Date().toISOString()
      });

      return allSuggestions;
    } catch (error) {
      console.error('❌ [SPELL CHECK] Batch error, falling back to individual checks:', {
        totalWords: words.length,
        words,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      // Fallback to individual word checks
      return this.fallbackToIndividualChecks(words, wordPositions);
    }
  }

  /**
   * Fallback to checking words individually if batch fails
   */
  private async fallbackToIndividualChecks(
    words: string[],
    wordPositions: Map<string, { start: number; end: number }>
  ): Promise<SpellingSuggestion[]> {
    console.log('🔄 [SPELL CHECK] Fallback to individual checks:', {
      totalWords: words.length,
      words,
      timestamp: new Date().toISOString()
    });

    const suggestions: SpellingSuggestion[] = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const position = wordPositions.get(word);
      if (position) {
        try {
          console.log(`🔤 [SPELL CHECK] Fallback check ${i + 1}/${words.length}:`, {
            word,
            position,
            timestamp: new Date().toISOString()
          });

          const wordSuggestions = await this.performWordSpellCheck(
            word,
            position.start,
            position.end
          );
          suggestions.push(...wordSuggestions);

          console.log(`✅ [SPELL CHECK] Fallback result ${i + 1}/${words.length}:`, {
            word,
            suggestionsFound: wordSuggestions.length,
            wordSuggestions,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.warn(`❌ [SPELL CHECK] Fallback failed for word "${word}":`, {
            word,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    console.log('🎯 [SPELL CHECK] Fallback processing complete:', {
      totalWords: words.length,
      totalSuggestions: suggestions.length,
      suggestions,
      timestamp: new Date().toISOString()
    });
    
    return suggestions;
  }

  /**
   * Split words into smaller batches
   */
  private splitIntoBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Filter suggestions that are still valid for the current text
   */
  private filterValidSuggestions(
    currentText: string,
    suggestions: SpellingSuggestion[]
  ): SpellingSuggestion[] {
    return suggestions.filter(suggestion => {
      // Check if the suggestion's position is still valid
      if (suggestion.endOffset > currentText.length) {
        return false;
      }

      // Check if the word at the position still matches
      const actualWord = currentText.substring(
        suggestion.startOffset,
        suggestion.endOffset
      );
      
      return actualWord === suggestion.word;
    });
  }

  /**
   * Merge two arrays of suggestions, removing duplicates
   */
  private mergeSuggestions(
    existing: SpellingSuggestion[],
    newSuggestions: SpellingSuggestion[]
  ): SpellingSuggestion[] {
    const merged = [...existing];
    
    for (const newSuggestion of newSuggestions) {
      const exists = merged.some(
        s => s.startOffset === newSuggestion.startOffset && 
             s.endOffset === newSuggestion.endOffset &&
             s.word === newSuggestion.word
      );
      
      if (!exists) {
        merged.push(newSuggestion);
      }
    }
    
    return merged.sort((a, b) => a.startOffset - b.startOffset);
  }

  /**
   * Perform full spell check when other methods fail
   */
  private async performFullCheck(
    text: string,
    callback: (suggestions: SpellingSuggestion[]) => void
  ): Promise<void> {
    try {
      const suggestions = await this.performSpellCheck(text);
      this.lastCheckedText = text;
      this.cachedSuggestions = suggestions;
      callback(suggestions);
    } catch (error) {
      console.error('Full spell check failed:', error);
      callback([]);
    }
  }

  /**
   * Check a specific word at a given position (triggered by space)
   */
  public checkWordAt(
    text: string,
    cursorPosition: number,
    callback: (suggestions: SpellingSuggestion[]) => void
  ): void {
    const word = this.extractWordBeforeCursor(text, cursorPosition);
    if (!word.word || word.word.length < 2) {
      callback([]);
      return;
    }

    // Check if this word is likely misspelled
    this.performWordSpellCheck(word.word, word.startOffset, word.endOffset)
      .then(suggestions => {
        callback(suggestions);
      })
      .catch(error => {
        console.error('Word spell check failed:', error);
        callback([]);
      });
  }

  /**
   * Extract the word before the cursor position
   */
  private extractWordBeforeCursor(
    text: string,
    cursorPosition: number
  ): { word: string; startOffset: number; endOffset: number } {
    // We only care about the text up to the cursor.
    const textBeforeCursor = text.slice(0, cursorPosition);

    // Find the end of the last word (by trimming trailing spaces from the text before cursor)
    const trimmedText = textBeforeCursor.trimEnd();
    const wordEnd = trimmedText.length;

    // Find the start of the last word by finding the last space/nbsp before it
    const lastSpace = trimmedText.lastIndexOf(' ');
    const lastNbsp = trimmedText.lastIndexOf('\u00A0'); // Handle non-breaking space
    const wordStart = Math.max(lastSpace, lastNbsp) + 1;

    const word = trimmedText.substring(wordStart);

    if (!word) {
      return { word: '', startOffset: 0, endOffset: 0 };
    }

    return {
      word,
      startOffset: wordStart,
      endOffset: wordEnd,
    };
  }

  /**
   * Perform spell check on a specific word
   */
  private async performWordSpellCheck(
    word: string,
    startOffset: number,
    endOffset: number
  ): Promise<SpellingSuggestion[]> {
    const requestPayload = { text: word, limitSuggestions: true };
    console.log('🔤 [SPELL CHECK] Single word request:', {
      word,
      startOffset,
      endOffset,
      payload: requestPayload,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await fetch(`${this.getFunctionsUrl()}/spellCheck`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      console.log('📡 [SPELL CHECK] Single word response status:', {
        word,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result: SpellCheckResponse = await response.json();

      console.log('✅ [SPELL CHECK] Single word response data:', {
        word,
        success: result.success,
        suggestionsCount: result.suggestions?.length || 0,
        suggestions: result.suggestions,
        metrics: result.metrics,
        error: result.error,
        timestamp: new Date().toISOString()
      });

      if (!result.success) {
        throw new Error(result.error || 'API error');
      }

      // Return only the first suggestion and adjust offsets
      const processedSuggestions = result.suggestions
        .slice(0, 1) // Limit to 1 suggestion
        .map(suggestion => ({
          ...suggestion,
          startOffset,
          endOffset,
          word,
          suggestions: suggestion.suggestions.slice(0, 1), // Limit to 1 fix option
        }))
        .filter(
          suggestion =>
            suggestion.word &&
            suggestion.word.length > 0 &&
            suggestion.suggestions.length > 0
        );

      console.log('🔍 [SPELL CHECK] Processed single word suggestions:', {
        word,
        originalCount: result.suggestions?.length || 0,
        processedCount: processedSuggestions.length,
        processedSuggestions,
        timestamp: new Date().toISOString()
      });

      return processedSuggestions;
    } catch (error) {
      console.error('❌ [SPELL CHECK] Single word error:', {
        word,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      return [];
    }
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
    const delta = replacement.length - targetSuggestion.word.length;
    const targetStartOffset = targetSuggestion.startOffset;

    // Filter out the applied suggestion and update offsets of subsequent suggestions
    return suggestions
      .filter(s => s.id !== targetSuggestion.id)
      .map(s => {
        if (s.startOffset > targetStartOffset) {
          return {
            ...s,
            startOffset: s.startOffset + delta,
            endOffset: s.endOffset + delta,
          };
        }
        return s;
      });
  }

  /**
   * Get metrics for text without spell checking
   */
  public calculateMetrics(text: string): WritingMetrics {
    const words = this.getWords(text);

    return {
      wordCount: words.length,
      characterCount: text.length,
      spellingErrors: 0, // Will be updated by caller
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
        spellingErrors: suggestions.length,
      },
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

  private async processTextInChunks(
    text: string
  ): Promise<SpellingSuggestion[]> {
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
        if (
          nextSpace !== -1 &&
          (prevSpace === -1 || nextSpace - chunkEnd < chunkEnd - prevSpace)
        ) {
          actualEnd = nextSpace;
        } else if (prevSpace !== -1) {
          actualEnd = prevSpace;
        }
      }

      chunks.push({
        text: text.substring(currentPos, actualEnd + this.minChunkOverlap),
        startOffset: currentPos,
      });

      currentPos = actualEnd;
    }

    return chunks;
  }

  private async checkTextChunk(
    text: string,
    globalOffset: number
  ): Promise<SpellingSuggestion[]> {
    try {
      const response = await fetch(`${this.getFunctionsUrl()}/spellCheck`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, limitSuggestions: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result: SpellCheckResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'API error');
      }

      // Adjust offsets for global position, limit to 1 suggestion per word, and validate
      return result.suggestions
        .slice(0, 1) // Limit to 1 suggestion for cleaner UX
        .map(suggestion => ({
          ...suggestion,
          startOffset: suggestion.startOffset + globalOffset,
          endOffset: suggestion.endOffset + globalOffset,
          suggestions: suggestion.suggestions.slice(0, 1), // Limit to 1 fix option
        }))
        .filter(
          suggestion =>
            // Validate that offsets are reasonable
            suggestion.startOffset >= 0 &&
            suggestion.endOffset > suggestion.startOffset &&
            suggestion.word &&
            suggestion.word.length > 0 &&
            suggestion.suggestions.length > 0
        );
    } catch (error) {
      console.error('Chunk spell check failed:', error);
      return [];
    }
  }

  private removeDuplicateSuggestions(
    suggestions: SpellingSuggestion[]
  ): SpellingSuggestion[] {
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
