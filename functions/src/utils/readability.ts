import { logger } from 'firebase-functions/v1';
import { OpenAI } from 'openai';

const createPrompt = (text: string): string => {
  return `Rewrite the following sentence to make it simpler and easier to read. Aim for a grade 6 reading level. Only return the rewritten sentence, without any additional explanation or pleasantries.
Sentence: "${text}"`;
};

export const rewriteForReadability = async (
  text: string,
  openai: OpenAI,
): Promise<string> => {
  const prompt = createPrompt(text);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
      n: 1,
    });

    const rewrittenText = response.choices[0]?.message?.content?.trim();

    if (!rewrittenText) {
      throw new Error('OpenAI did not return a rewritten text.');
    }

    // Sometimes the model returns the text in quotes, so we remove them.
    return rewrittenText.replace(/^"|"$/g, '');
  } catch (error) {
    logger.error('Error rewriting text for readability:', error);
    throw new Error('Failed to rewrite text due to an API error.');
  }
}; 