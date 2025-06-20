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

export async function getOpenAICompletion(
  prompt: string,
  maxTokens = 2048
): Promise<string> {
  const client = getOpenAIClient();
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.2, // Lower temperature for more deterministic, factual responses
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }
    return content;
  } catch (error) {
    console.error("Error getting completion from OpenAI:", error);
    throw new Error("Failed to get completion from OpenAI.");
  }
} 