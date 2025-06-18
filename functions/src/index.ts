import { onRequest } from 'firebase-functions/v2/https';
import { corsHandler, handleOptionsRequest, setCorsHeaders } from './utils/cors';
import { getOpenAIClient } from './utils/openai';
import {
  SpellCheckRequest,
  calculateBasicMetrics,
  createSpellCheckPrompt,
  performSpellCheck
} from './utils/spellcheck';
import {
  TONE_OPTIONS,
  Tone,
  ToneDetectRequest,
  ToneDetectResponse,
  ToneRewriteRequest,
  ToneRewriteResponse,
  detectTone,
  rewriteInTone
} from './utils/tone';

/**
 * Main spell check function with support for different modes
 */
export const spellCheck = onRequest(
  {
    cors: true,
    timeoutSeconds: 120,
  },
  async (request, response) => {
    setCorsHeaders(request, response);

    if (handleOptionsRequest(request, response)) {
      return;
    }

    corsHandler(request, response, async () => {
      try {
        if (request.method !== 'POST') {
          response.status(405).json({ error: 'Method not allowed' });
          return;
        }

        const { mode = 'spell', text, tone, limitSuggestions = false }: SpellCheckRequest = request.body;

        const openaiClient = getOpenAIClient();

        switch (mode) {
          case 'spell': {
            // Handle empty/short text quickly
            if (!text.trim() || text.trim().length < 3) {
              const metrics = calculateBasicMetrics(text);
              response.status(200).json({ success: true, suggestions: [], metrics });
              return;
            }

            const prompt = createSpellCheckPrompt(text, limitSuggestions);
            const suggestions = await performSpellCheck(prompt, text, limitSuggestions, openaiClient);
            const metrics = calculateBasicMetrics(text);
            metrics.spellingErrors = suggestions.length;
            response.status(200).json({ success: true, suggestions, metrics });
            return;
          }

          case 'toneDetect': {
            const result = await detectTone(text, openaiClient);
            response.status(200).json({ success: true, ...result });
            return;
          }
          case 'toneRewrite': {
            if (!tone || !TONE_OPTIONS.includes(tone as Tone)) {
              response.status(400).json({ error: 'Valid tone must be provided for rewrite' });
              return;
            }
            const rewritten = await rewriteInTone(text, tone as Tone, openaiClient);
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
 * Tone detection endpoint
 */
export const toneDetect = onRequest(
  { cors: true, timeoutSeconds: 60 }, 
  async (request, response) => {
    setCorsHeaders(request, response);

    if (handleOptionsRequest(request, response)) {
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
        const result = await detectTone(text, openaiClient);

        const resBody: ToneDetectResponse = {
          success: true,
          ...result,
        };
        response.status(200).json(resBody);
      } catch (error) {
        console.error('Tone detect error:', error);
        response.status(500).json({ success: false, error: 'Internal server error', tone: null });
      }
    });
  }
);

/**
 * Tone rewrite endpoint
 */
export const toneRewrite = onRequest(
  { cors: true, timeoutSeconds: 120 }, 
  async (request, response) => {
    setCorsHeaders(request, response);

    if (handleOptionsRequest(request, response)) {
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
        const rewrittenText = await rewriteInTone(text, tone, openaiClient);

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
  }
); 