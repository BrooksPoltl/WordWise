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
 * Create a prompt to get spelling suggestions for a list of words.
 *
 * @param words An array of words that might be misspelled.
 * @param limitSuggestions Whether to limit the suggestions to the single most likely correction.
 * @returns A prompt string for the OpenAI API.
 */
export function createSpellCheckPrompt(
  words: string[],
  limitSuggestions: boolean = false,
): string {
  const suggestionLimitRule = limitSuggestions
    ? "Provide only the single most likely correction for each word."
    : "Provide the most likely corrections for each word.";

  const wordList = words.join(", ");

  return `You are a highly proficient English language spell checker. For the following list of words, please provide spelling corrections.

IMPORTANT RULES:
1.  **Correct typos and misspellings**: For each word in the list, provide the correct spelling.
2.  **Do not correct proper nouns or technical jargon**: If a word seems correct (e.g., a name, brand, or technical term), do not suggest a correction.
3.  **${suggestionLimitRule}**
4.  **Return ONLY valid JSON**: Your entire output must be a single, valid JSON object with no markdown formatting or other text. The keys of the object should be the original words, and the values should be an array of suggested corrections.

Word list: "${wordList}"

Return this exact JSON format, omitting words that do not need correction:
{
  "word1": ["correction1", "correction2"],
  "word2": ["correction1"]
}`;
}

/**
 * Perform the actual spell check with OpenAI and return a map of corrections.
 *
 * @param words An array of words to check.
 * @param limitSuggestions Whether to limit to one suggestion per word.
 * @param openaiClient The OpenAI client instance.
 * @returns A promise that resolves to a Map where keys are misspelled words
 *          and values are arrays of suggestions.
 */
export async function performSpellCheck(
  words: string[],
  limitSuggestions: boolean = false,
  openaiClient: OpenAI,
): Promise<Map<string, string[]>> {
  if (words.length === 0) {
    return new Map();
  }

  const prompt = createSpellCheckPrompt(words, limitSuggestions);

  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    max_tokens: 500, // Adjust as needed
  });

  const aiResponse = completion.choices[0]?.message?.content;

  if (!aiResponse) {
    throw new Error("No response from OpenAI");
  }

  const parsedResult = parseAIResponse(aiResponse);
  const suggestionMap = new Map<string, string[]>();

  for (const word in parsedResult) {
    if (Object.prototype.hasOwnProperty.call(parsedResult, word)) {
      const suggestions = parsedResult[word];
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        suggestionMap.set(
          word,
          limitSuggestions ? suggestions.slice(0, 1) : suggestions,
        );
      }
    }
  }

  return suggestionMap;
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