import { OpenAI } from 'openai';

const createPrompt = (text: string): string => {
  return `Rewrite the following sentence from passive voice to active voice.

**Instructions:**
1.  **Identify the Actor:** Find the subject performing the action.
2.  **Restructure the Sentence:** Place the actor at the beginning of the sentence.
3.  **Preserve the Original Tense:** Ensure the rewritten sentence maintains the original tense (past, present, future).
4.  **Clarity and Brevity:** The active voice version should be clear and direct.
5.  **Return Only the Result:** Output only the rewritten sentence, with no additional commentary or quotation marks.
6.  **If Already Active:** If the original sentence is already in active voice, return it unchanged.

**Original Passive Sentence:**
"${text}"`;
};

export const rewritePassiveToActive = async (
  text: string,
  openaiClient: OpenAI,
): Promise<string> => {
  const prompt = createPrompt(text);
  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const rewrittenText = response.choices[0].message.content?.trim();
    if (!rewrittenText) {
      throw new Error('OpenAI returned an empty response.');
    }

    // Sometimes the model returns the text in quotes, so we remove them.
    return rewrittenText.replace(/^"|"$/g, '');
  } catch (error) {
    console.error('Error rewriting passive voice to active:', error);
    throw new Error('Failed to rewrite sentence.');
  }
}; 