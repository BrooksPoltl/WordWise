import OpenAI from 'openai';

export const TONE_OPTIONS = [
  'Friendly',
  'Professional',
  'Humorous',
  'Serious',
  'Academic',
  'Persuasive',
  'Empathetic',
] as const;

export type Tone = typeof TONE_OPTIONS[number];

export interface ToneDetectRequest { 
  text: string; 
}

export interface ToneDetectResponse {
  success: boolean;
  tone: Tone | null;
  confidence?: number;
  error?: string;
}



/**
 * Detect tone from text using OpenAI
 */
export async function detectTone(text: string, openaiClient: OpenAI): Promise<{ tone: Tone | null; confidence?: number }> {
  const prompt = `You are a tone classifier. Given the text below, select the single most appropriate tone from this list: ${TONE_OPTIONS.join(', ')}.\n\nReturn ONLY valid JSON in the format {\n  \"tone\": \"<chosen tone>\",\n  \"confidence\": <confidence between 0 and 1>\n}. Do not output anything else.\n\nText:\n\"\n${text}\n\"`;
  
  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4o-2024-11-20",
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
    return { tone: null };
  }

  const tone = TONE_OPTIONS.includes(detected.tone as Tone) ? (detected.tone as Tone) : null;
  
  return {
    tone,
    confidence: detected.confidence,
  };
}

 