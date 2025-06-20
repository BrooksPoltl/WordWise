import { z } from 'zod';
import { createApiHandler } from '../utils/handlers';
import { getOpenAIClient } from '../utils/openai';
import { rewritePassiveToActive } from '../utils/passive';
import { withValidation } from '../utils/validation';

const passiveRewriteSchema = z.object({
  text: z.string().min(1, { message: 'Text must be provided.' }),
});

const passiveRewriteHandler = withValidation(
  passiveRewriteSchema,
  async ({ text }, _auth) => {
    const openaiClient = getOpenAIClient();
    const rewrittenText = await rewritePassiveToActive(text, openaiClient);
    return { success: true, text: rewrittenText };
  },
);

export const passiveRewrite = createApiHandler(passiveRewriteHandler); 