import { z } from "zod";
import { createApiHandler } from "../utils/handlers";
import { getOpenAIClient } from "../utils/openai";
import { detectTone, rewriteInTone, TONE_OPTIONS } from "../utils/tone";
import { withValidation } from "../utils/validation";

// Define the schema for the toneDetect function's input
const toneDetectSchema = z.object({
  text: z.string().min(1, { message: "Text must be provided." }),
});

// The core tone detection logic
const toneDetectHandler = withValidation(
  toneDetectSchema,
  async ({ text }, _auth) => {
    const openaiClient = getOpenAIClient();
    const result = await detectTone(text, openaiClient);
    return { success: true, ...result };
  },
);

// Export the final, wrapped function
export const toneDetect = createApiHandler(toneDetectHandler);

// Define the schema for the toneRewrite function's input
const toneRewriteSchema = z.object({
  text: z.string().min(1, { message: "Text must be provided." }),
  tone: z.enum(TONE_OPTIONS),
});

// The core tone rewrite logic
const toneRewriteHandler = withValidation(
  toneRewriteSchema,
  async ({ text, tone }, _auth) => {
    const openaiClient = getOpenAIClient();
    const rewrittenText = await rewriteInTone(text, tone, openaiClient);
    return { success: true, text: rewrittenText };
  },
);

// Export the final, wrapped function
export const toneRewrite = createApiHandler(toneRewriteHandler); 