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

        // Create custom words list including specialized terms
        const defaultCustomWords = [
          'WordWise', 'Firebase', 'TipTap', 'TypeScript', 'React', 'COVID',
          'JavaScript', 'HTML', 'CSS', 'API', 'JSON', 'GitHub', 'README',
          'masteron', 'mast', 'testosterone', 'steroid', 'bodybuilding', 'atm',
          'mg', 'ml', 'cc', 'iu', 'mcg', 'pct', 'ai', 'serm', 'hcg', 'hgh',
          'tren', 'dbol', 'var', 'winny', 'primo', 'eq', 'deca', 'sus', 'prop',
          'enth', 'cyp', 'undec', 'phenylprop'
        ];

        const allCustomWords = [...defaultCustomWords, ...customWords];

        // Create the prompt for OpenAI
        const prompt = `You are a professional spell checker. Analyze the following text for spelling errors and provide corrections.

CUSTOM WORDS TO CONSIDER CORRECT (do not flag these as misspelled):
${allCustomWords.join(', ')}

TEXT TO CHECK:
"${text}"

Please respond with a JSON object containing an array of spelling errors found. For each error, provide:
- word: the misspelled word
- startOffset: character position where word starts (0-based)
- endOffset: character position where word ends
- suggestions: array of up to 5 suggested corrections
- message: descriptive message about the error

Only include actual spelling errors. Do not flag proper nouns, technical terms, or words that are commonly used in informal writing.

Response format:
{
  "errors": [
    {
      "word": "misspelled_word",
      "startOffset": 0,
      "endOffset": 10,
      "suggestions": ["suggestion1", "suggestion2"],
      "message": "Possible misspelling of 'correct_word'"
    }
  ]
}`;

        // Call OpenAI API
        const model = "gpt-4.1-nano";
        console.log(model);
        const openaiClient = getOpenAIClient();
        const completion = await openaiClient.chat.completions.create({
          model: model,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          stream: false,
          temperature: 0.1, // Low temperature for consistent results
          max_tokens: 1000,
        });

        const aiResponse = completion.choices[0]?.message?.content;
        
        if (!aiResponse) {
          throw new Error('No response from OpenAI');
        }

        // Parse AI response
        let aiResult;
        try {
          aiResult = JSON.parse(aiResponse);
        } catch (parseError) {
          console.error('Failed to parse AI response:', aiResponse);
          throw new Error('Invalid response format from AI');
        }

        // Convert AI results to our format
        const suggestions = (aiResult.errors || []).map((error: any, index: number) => ({
          id: `spell-${error.startOffset}-${error.endOffset}-${index}`,
          word: error.word,
          startOffset: error.startOffset,
          endOffset: error.endOffset,
          suggestions: error.suggestions || [],
          message: error.message || `"${error.word}" may be misspelled`
        }));

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