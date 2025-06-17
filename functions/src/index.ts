import { onRequest } from 'firebase-functions/v2/https';
import cors from 'cors';
import OpenAI from 'openai';


// CORS middleware
const allowedOrigins: string[] = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsHandler = cors({ origin: allowedOrigins });

// Initialize OpenAI client (will be created when needed)
let openai: OpenAI | null = null;
const apiKey = process.env.OPENAI_API_KEY;

function getOpenAIClient(): OpenAI {
  // Lazily create a singleton client instance
  if (openai) return openai;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  openai = new OpenAI({ apiKey });
  return openai;
}

interface SpellCheckRequest {
  mode?: 'spell' | 'toneDetect' | 'toneRewrite';
  text: string;
  customWords?: string[];
  tone?: Tone; // Required if mode === 'toneRewrite'
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
    timeoutSeconds: 120,
  },
  async (request, response) => {
    // Set CORS headers
    const requestOrigin = request.headers.origin as string | undefined;
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      response.set('Access-Control-Allow-Origin', requestOrigin);
    }
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
      response.status(204).send('');
      return;
    }

    corsHandler(request, response, async () => {
      try {
        if (request.method !== 'POST') {
          response.status(405).json({ error: 'Method not allowed' });
          return;
        }

        const { mode = 'spell', text, customWords = [], tone }: SpellCheckRequest = request.body;

        if (!text || typeof text !== 'string') {
          response.status(400).json({ error: 'Text is required and must be a string' });
          return;
        }

        switch (mode) {
          case 'spell': {
            // ======== Spell Check (existing logic) ========
            // Handle empty/short text quickly
            if (!text.trim() || text.trim().length < 3) {
              const metrics = calculateBasicMetrics(text);
              response.status(200).json({ success: true, suggestions: [], metrics });
              return;
            }

            const prompt = createSpellCheckPrompt(text, customWords);
            const suggestions = await performSpellCheck(prompt, text);
            const metrics = calculateBasicMetrics(text);
            metrics.spellingErrors = suggestions.length;
            response.status(200).json({ success: true, suggestions, metrics });
            return;
          }

          case 'toneDetect': {
            const openaiClient = getOpenAIClient();
            const prompt = `You are a tone classifier. Choose the single most appropriate tone from: ${TONE_OPTIONS.join(', ')}.\nReturn ONLY JSON { \"tone\": \"<tone>\" }.\nText:\n\"${text}\"`;
            const completion = await openaiClient.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0,
              max_tokens: 100,
            });
            let aiContent = completion.choices[0]?.message?.content?.trim() || '';
            if (aiContent.startsWith('```')) {
              aiContent = aiContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
            }
            let parsed: { tone?: string } = {};
            try { parsed = JSON.parse(aiContent); } catch {}
            const detectedTone = TONE_OPTIONS.includes(parsed.tone as Tone) ? parsed.tone : null;
            response.status(200).json({ success: true, tone: detectedTone });
            return;
          }

          case 'toneRewrite': {
            if (!tone || !TONE_OPTIONS.includes(tone)) {
              response.status(400).json({ error: 'Valid tone must be provided for rewrite' });
              return;
            }
            const openaiClient = getOpenAIClient();
            const prompt = `Rewrite the text below in a ${tone} tone. Preserve meaning. Return ONLY the rewritten text.\nText:\n\"${text}\"`;
            const completion = await openaiClient.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.7,
              max_tokens: 4096,
            });
            const rewritten = completion.choices[0]?.message?.content?.trim() || '';
            response.status(200).json({ success: true, text: rewritten });
            return;
          }

          default:
            response.status(400).json({ error: 'Unknown mode' });
        }
      } catch (error) {
        console.error('Language tool error:', error);
        response.status(500).json({ success: false, error: 'Internal server error' });
      }
    });
  },
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

// -------------------- Tone Analysis & Rewrite --------------------

const TONE_OPTIONS = [
  'Formal',
  'Informal',
  'Friendly',
  'Professional',
  'Humorous',
  'Serious',
  'Academic',
  'Conversational',
  'Persuasive',
  'Empathetic',
] as const;

type Tone = typeof TONE_OPTIONS[number];

interface ToneDetectRequest { text: string; }
interface ToneDetectResponse {
  success: boolean;
  tone: Tone | null;
  confidence?: number;
  error?: string;
}

export const toneDetect = onRequest({ cors: true, timeoutSeconds: 60 }, async (request, response) => {
  const requestOrigin = request.headers.origin as string | undefined;
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    response.set('Access-Control-Allow-Origin', requestOrigin);
  }
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { text }: ToneDetectRequest = request.body;

      if (!text || typeof text !== 'string') {
        response.status(400).json({ error: 'Text must be provided' });
        return;
      }

      const openaiClient = getOpenAIClient();

      const prompt = `You are a tone classifier. Given the text below, select the single most appropriate tone from this list: ${TONE_OPTIONS.join(', ')}.\n\nReturn ONLY valid JSON in the format {\n  \"tone\": \"<chosen tone>\",\n  \"confidence\": <confidence between 0 and 1>\n}. Do not output anything else.\n\nText:\n\"\n${text}\n\"`;

      const completion = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 150,
      });

      const aiContent = completion.choices[0]?.message?.content?.trim();
      if (!aiContent) throw new Error('No response from OpenAI');

      let detected: { tone: string; confidence?: number } = { tone: '' };
      try {
        let clean = aiContent;
        if (clean.startsWith('```')) {
          clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }
        detected = JSON.parse(clean);
      } catch (e) {
        console.error('Failed to parse tone detection response:', aiContent);
        response.status(200).json({ success: true, tone: null });
        return;
      }

      const tone = TONE_OPTIONS.includes(detected.tone as Tone) ? (detected.tone as Tone) : null;

      const resBody: ToneDetectResponse = {
        success: true,
        tone,
        confidence: detected.confidence,
      };
      response.status(200).json(resBody);
    } catch (error) {
      console.error('Tone detect error:', error);
      response.status(500).json({ success: false, error: 'Internal server error', tone: null });
    }
  });
});

// -------------------- Tone Rewrite --------------------

interface ToneRewriteRequest { text: string; tone: Tone }
interface ToneRewriteResponse { success: boolean; text?: string; error?: string; }

export const toneRewrite = onRequest({ cors: true, timeoutSeconds: 120 }, async (request, response) => {
  const requestOrigin = request.headers.origin as string | undefined;
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    response.set('Access-Control-Allow-Origin', requestOrigin);
  }
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { text, tone }: ToneRewriteRequest = request.body;

      if (!text || typeof text !== 'string' || !tone) {
        response.status(400).json({ error: 'Text and tone must be provided' });
        return;
      }

      if (!TONE_OPTIONS.includes(tone)) {
        response.status(400).json({ error: 'Unsupported tone' });
        return;
      }

      const openaiClient = getOpenAIClient();

      const prompt = `Rewrite the following text in a ${tone} tone. Preserve the original meaning and factual content. Return ONLY the rewritten text without any additional commentary or formatting.\n\nText:\n\"\n${text}\n\"`;

      const completion = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      });

      const rewrittenText = completion.choices[0]?.message?.content?.trim();
      if (!rewrittenText) throw new Error('No response from OpenAI');

      const resBody: ToneRewriteResponse = {
        success: true,
        text: rewrittenText,
      };
      response.status(200).json(resBody);
    } catch (error) {
      console.error('Tone rewrite error:', error);
      response.status(500).json({ success: false, error: 'Internal server error' });
    }
  });
}); 