import { logger } from 'firebase-functions/v1';
import { OpenAI } from 'openai';

const createPrompt = (text: string): string => {
  return `Rewrite the following sentence to improve its readability.

**Instructions:**
1.  **Simplify Vocabulary:** Replace complex words with simpler alternatives.
2.  **Shorten Sentences:** Break down long sentences into shorter, more direct ones.
3.  **Use Active Voice:** Convert any passive voice constructions to active voice.
4.  **Target Readability Score:** The final text should have a Flesch-Kincaid grade level of 8 or lower.
5.  **Output:** Return only the rewritten sentence, with no additional commentary.

**Original Sentence:**
"${text}"`;
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