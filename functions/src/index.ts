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

export const spellCheck = onRequest(
  { 
    cors: true,
    secrets: [openaiApiKey]
  },
  async (request, response) => {
    // Set CORS headers manually
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
        // Only allow POST requests
        if (request.method !== 'POST') {
          response.status(405).json({ error: 'Method not allowed' });
          return;
        }

        const { text, customWords = [] }: SpellCheckRequest = request.body;

        if (!text || typeof text !== 'string') {
          response.status(400).json({ error: 'Text is required and must be a string' });
          return;
        }

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
          response.status(500).json({ 
            success: false, 
            error: 'OpenAI API key not configured',
            suggestions: [],
            metrics: { wordCount: 0, characterCount: 0, spellingErrors: 0 }
          });
          return;
        }

        // Create a more robust prompt, demanding the required fields.
        const prompt = `Find all spelling errors in the text below. For each error, you MUST provide the 'word', its 'startOffset' and 'endOffset' (0-indexed character offsets in the original text), and an array of 'suggestions'.

Text: "${text}"

Return ONLY a raw JSON object (no markdown) with an "errors" key, like this:
{"errors": [{"word": "badword", "startOffset": 12, "endOffset": 19, "suggestions": ["good word"]}]}`;

        // Call OpenAI API with optimized settings
        const openaiClient = getOpenAIClient();
        const completion = await openaiClient.chat.completions.create({
          model: "gpt-4o-mini", // Correct model name
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0,
          max_tokens: 300, // Reduced for faster response
        });

        const aiResponse = completion.choices[0]?.message?.content;
        
        if (!aiResponse) {
          throw new Error('No response from OpenAI');
        }

        // Parse AI response (handle markdown code blocks)
        let aiResult;
        try {
          // Remove markdown code blocks if present
          let cleanResponse = aiResponse.trim();
          if (cleanResponse.startsWith('```json') || cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
          }
          
          aiResult = JSON.parse(cleanResponse);
        } catch (parseError) {
          console.error('Failed to parse AI response:', aiResponse);
          throw new Error('Invalid response format from AI');
        }

        // Convert AI results to our expected API format
        const suggestions = (aiResult.errors || [])
          .map((error: any, index: number) => {
            const startOffset = error.startOffset ?? error.start;
            const endOffset = error.endOffset ?? error.end;
            
            // If offsets are still missing (null or undefined), log it and skip this error.
            if (startOffset == null || endOffset == null) {
              console.error('AI response for an error is missing offset fields:', JSON.stringify(error));
              return null;
            }

            return {
              id: `spell-${startOffset}-${endOffset}-${index}`,
              word: error.word,
              startOffset: startOffset,
              endOffset: endOffset,
              suggestions: error.suggestions || [],
              message: `"${error.word}" may be misspelled`
            };
          })
          .filter(Boolean) as SpellCheckResponse['suggestions']; // Filter out null values and assert type

        // Calculate metrics
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const metrics = {
          wordCount: words.length,
          characterCount: text.length,
          spellingErrors: suggestions.length
        };

        const responseData: SpellCheckResponse = {
          success: true,
          suggestions,
          metrics
        };

        response.status(200).json(responseData);

      } catch (error) {
        console.error('Spell check error:', error);
        response.status(500).json({ 
          success: false, 
          error: 'Internal server error',
          suggestions: [],
          metrics: { wordCount: 0, characterCount: 0, spellingErrors: 0 }
        });
      }
    });
  }
); 