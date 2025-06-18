import OpenAI from 'openai';

export interface SpellCheckRequest {
  mode?: 'spell' | 'toneDetect' | 'toneRewrite'
  text?: string;
  words?: Array<{ word: string; startOffset: number; endOffset: number }>;
  tone?: string;
  limitSuggestions?: boolean;
}

export interface SpellCheckResponse {
  success: boolean;
  suggestions: Array<{
    id: string;
    word: string;
    startOffset: number;
    endOffset: number;
    suggestions: string[];
    message: string;
  }>;
  metrics: {
    wordCount: number;
    characterCount: number;
    spellingErrors: number;
  };
  error?: string;
}

/**
 * Create an improved prompt that handles edge cases better
 */
export function createSpellCheckPrompt(text: string, limitSuggestions: boolean = false): string {
  const suggestionLimitRule = limitSuggestions
    ? '\n4. **Give one practical suggestion**: Provide only the single most likely correction for each error.'
    : '\n4. **Give practical suggestions**: Provide the most likely corrections for each error.';

  return `You are a highly proficient English language spell checker. Your task is to identify and correct spelling errors and obvious typos in the provided text.

IMPORTANT RULES:
1.  **Aggressively correct typos**: Flag words that are clearly misspelled. Pay special attention to short, common words (2-3 letters) that are likely typos for other words (e.g., 'teh' for 'the', 'wa' for 'was'). A standalone word like "th" should be flagged as a typo for "the" unless it follows a number (e.g., "4th"). Do not be overly conservative with these short words.
2.  **Be careful with proper nouns**: Do NOT flag proper names, acronyms, or technical jargon unless they are extremely common and clearly misspelled (e.g., 'Gogle' for 'Google').
3.  **Provide accurate character offsets**: The 'startOffset' and 'endOffset' must correspond to the exact position of the misspelled word in the original text (0-indexed).${suggestionLimitRule}
5.  **Return ONLY valid JSON**: Your entire output must be a single, valid JSON object, with no markdown formatting or other text.

Text to check: "${text}"

Return this exact JSON format:
{
  "errors": [
    {
      "word": "misspelled_word",
      "startOffset": 0,
      "endOffset": 10,
      "suggestions": ["best_correction"]
    }
  ]
}`;
}


/**
 * Perform the actual spell check with OpenAI
 */
export async function performSpellCheck(
  prompt: string, 
  originalText: string, 
  limitSuggestions: boolean = false,
  openaiClient: OpenAI
): Promise<SpellCheckResponse['suggestions']> {
  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    max_tokens: 500,
  });

  const aiResponse = completion.choices[0]?.message?.content;
  
  if (!aiResponse) {
    throw new Error('No response from OpenAI');
  }

  // Parse and validate AI response
  const parsedResult = parseAIResponse(aiResponse);
  
  // Convert to our API format with validation
  return convertToSuggestions(parsedResult.errors || [], originalText, limitSuggestions);
}

/**
 * Parse AI response with robust error handling
 */
export function parseAIResponse(response: string): any {
  try {
    // Clean up response (remove markdown if present)
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    
    return JSON.parse(cleanResponse);
  } catch (parseError) {
    console.error('Failed to parse AI response:', response);
    // Return empty result instead of throwing
    return { errors: [] };
  }
}

/**
 * Convert AI results to our API format with validation
 */
export function convertToSuggestions(
  errors: any[], 
  originalText: string,
  limitSuggestions: boolean = false
): SpellCheckResponse['suggestions'] {
  return errors
    .slice(0, limitSuggestions ? 1 : errors.length) // Limit to 1 error if requested
    .map((error: any, index: number) => {
      // Validate required fields
      if (!error.word || typeof error.word !== 'string') {
        return null;
      }
      
      let startOffset = error.startOffset ?? error.start;
      let endOffset = error.endOffset ?? error.end;
      
      // If offsets are missing or invalid, try to find the word in text
      if (typeof startOffset !== 'number' || typeof endOffset !== 'number') {
        const wordPosition = findWordInText(originalText, error.word);
        if (wordPosition) {
          startOffset = wordPosition.start;
          endOffset = wordPosition.end;
        } else {
          console.warn(`Could not locate word "${error.word}" in text`);
          return null;
        }
      }
      
      // Validate offsets
      if (startOffset < 0 || endOffset <= startOffset || endOffset > originalText.length) {
        console.warn(`Invalid offsets for word "${error.word}": ${startOffset}-${endOffset}`);
        return null;
      }
      
      // Verify the word actually exists at those offsets
      const actualWord = originalText.substring(startOffset, endOffset);
      if (actualWord !== error.word) {
        console.warn(`Offset mismatch: expected "${error.word}", found "${actualWord}"`);
        // Try to find the correct position
        const correctedPosition = findWordInText(originalText, error.word, startOffset);
        if (correctedPosition) {
          startOffset = correctedPosition.start;
          endOffset = correctedPosition.end;
        } else {
          return null;
        }
      }

      // Limit suggestions if requested
      const suggestions = Array.isArray(error.suggestions) ? error.suggestions : [];
      const limitedSuggestions = limitSuggestions ? suggestions.slice(0, 1) : suggestions;

      return {
        id: `spell-${startOffset}-${endOffset}-${index}`,
        word: error.word,
        startOffset,
        endOffset,
        suggestions: limitedSuggestions,
        message: `"${error.word}" may be misspelled`
      };
    })
    .filter(Boolean) as SpellCheckResponse['suggestions'];
}

/**
 * Find a word in text and return its position
 */
export function findWordInText(text: string, word: string, startFrom: number = 0): { start: number; end: number } | null {
  let searchStart = startFrom;
  
  while (searchStart < text.length) {
    const foundIndex = text.indexOf(word, searchStart);
    
    if (foundIndex === -1) {
      break;
    }
    
    const start = foundIndex;
    const end = foundIndex + word.length;
    
    // Check word boundaries
    const beforeChar = text[start - 1];
    const afterChar = text[end];
    const isBoundaryStart = start === 0 || /\W/.test(beforeChar);
    const isBoundaryEnd = end === text.length || /\W/.test(afterChar);
    
    if (isBoundaryStart && isBoundaryEnd) {
      return { start, end };
    }
    
    searchStart = foundIndex + 1;
  }
  
  return null;
}

/**
 * Calculate basic text metrics
 */
export function calculateBasicMetrics(text: string): { wordCount: number; characterCount: number; spellingErrors: number } {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  
  return {
    wordCount: words.length,
    characterCount: text.length,
    spellingErrors: 0
  };
} 