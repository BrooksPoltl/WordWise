import OpenAI from 'openai';

// Initialize OpenAI client (will be created when needed)
let openai: OpenAI | null = null;
const apiKey = process.env.OPENAI_API_KEY;

export function getOpenAIClient(): OpenAI {
  // Lazily create a singleton client instance
  if (openai) return openai;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  openai = new OpenAI({ apiKey });
  return openai;
} 