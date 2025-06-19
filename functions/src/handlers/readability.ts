import { z } from 'zod';
import { createApiHandler } from '../utils/handlers';
import { getOpenAIClient } from '../utils/openai';
import { rewriteForReadability } from '../utils/readability';
import { withValidation } from '../utils/validation';

const readabilityRewriteSchema = z.object({
  text: z.string().min(1, { message: 'Text must be provided.' }),
});

const readabilityRewriteHandler = withValidation(
  readabilityRewriteSchema,
  async ({ text }, _auth) => {
    const openaiClient = getOpenAIClient();
    const rewrittenText = await rewriteForReadability(text, openaiClient);
    return { success: true, text: rewrittenText };
  },
);

export const readabilityRewrite = createApiHandler(readabilityRewriteHandler); 