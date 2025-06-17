import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import cors from 'cors';
import OpenAI from 'openai';

// Define the OpenAI API key as a secret
const openaiApiKey = defineSecret('OPENAI_API_KEY');

// CORS middleware
const corsHandler = cors({ origin: true });

// Initialize OpenAI client (will be created when needed)
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = openaiApiKey.value() || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

interface SpellCheckRequest {
  text: string;
  customWords?: string[];
}

interface SpellCheckResponse {
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
 * Improved spell check function with better error handling and edge case management
 */
export const spellCheck = onRequest(
  { 
    cors: true,
    secrets: [openaiApiKey],
    timeoutSeconds: 60 // Increased timeout for larger texts
  },
  async (request, response) => {
    // Set CORS headers
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      response.status(204).send('');
      return;
    }

    corsHandler(request, response, async () => {
      try {
        // Validate request method
        if (request.method !== 'POST') {
          response.status(405).json({ error: 'Method not allowed' });
          return;
        }

        const { text, customWords = [] }: SpellCheckRequest = request.body;

        // Validate input
        if (!text || typeof text !== 'string') {
          response.status(400).json({ error: 'Text is required and must be a string' });
          return;
        }

        // Handle empty or very short text
        if (!text.trim() || text.trim().length < 3) {
          const metrics = calculateBasicMetrics(text);
          response.status(200).json({
            success: true,
            suggestions: [],
            metrics
          });
          return;
        }

        // Check API key
        if (!process.env.OPENAI_API_KEY) {
          response.status(500).json({ 
            success: false, 
            error: 'OpenAI API key not configured',
            suggestions: [],
            metrics: calculateBasicMetrics(text)
          });
          return;
        }

        // Create improved prompt with better instructions
        const prompt = createSpellCheckPrompt(text, customWords);

        // Call OpenAI with error handling
        const suggestions = await performSpellCheck(prompt, text);

        // Calculate metrics
        const metrics = calculateBasicMetrics(text);
        metrics.spellingErrors = suggestions.length;

        const responseData: SpellCheckResponse = {
          success: true,
          suggestions,
          metrics
        };

        response.status(200).json(responseData);

      } catch (error) {
        console.error('Spell check error:', error);
        const fallbackMetrics = request.body?.text ? calculateBasicMetrics(request.body.text) : 
          { wordCount: 0, characterCount: 0, spellingErrors: 0 };
        
        response.status(500).json({ 
          success: false, 
          error: 'Internal server error',
          suggestions: [],
          metrics: fallbackMetrics
        });
      }
    });
  }
);

/**
 * Create an improved prompt that handles edge cases better
 */
function createSpellCheckPrompt(text: string, customWords: string[]): string {
  const customWordsSection = customWords.length > 0 
    ? `\n\nThese words should NOT be flagged as errors: ${customWords.join(', ')}`
    : '';

  return `You are a spell checker. Find ONLY genuine spelling errors in the text below.

IMPORTANT RULES:
1. Only flag words that are clearly misspelled
2. Do NOT flag: proper names, technical terms, abbreviations, or uncommon but valid words
3. Provide accurate character offsets (0-indexed) in the original text
4. Give practical suggestions for each error
5. Return ONLY valid JSON, no markdown formatting

Text to check: "${text}"${customWordsSection}

Return this exact JSON format:
{
  "errors": [
    {
      "word": "misspelled_word",
      "startOffset": 0,
      "endOffset": 10,
      "suggestions": ["correct_word1", "correct_word2"]
    }
  ]
}`;
}

/**
 * Perform the actual spell check with OpenAI
 */
async function performSpellCheck(prompt: string, originalText: string): Promise<SpellCheckResponse['suggestions']> {
  const openaiClient = getOpenAIClient();
  
  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
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
  return convertToSuggestions(parsedResult.errors || [], originalText);
}

/**
 * Parse AI response with robust error handling
 */
function parseAIResponse(response: string): any {
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
function convertToSuggestions(
  errors: any[], 
  originalText: string
): SpellCheckResponse['suggestions'] {
  return errors
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

      return {
        id: `spell-${startOffset}-${endOffset}-${index}`,
        word: error.word,
        startOffset,
        endOffset,
        suggestions: Array.isArray(error.suggestions) ? error.suggestions : [],
        message: `"${error.word}" may be misspelled`
      };
    })
    .filter(Boolean) as SpellCheckResponse['suggestions'];
}

/**
 * Find a word in text and return its position
 */
function findWordInText(text: string, word: string, startFrom: number = 0): { start: number; end: number } | null {
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
function calculateBasicMetrics(text: string): { wordCount: number; characterCount: number; spellingErrors: number } {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  
  return {
    wordCount: words.length,
    characterCount: text.length,
    spellingErrors: 0
  };
} 