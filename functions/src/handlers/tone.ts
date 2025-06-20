import { z } from "zod";
import { createApiHandler } from "../utils/handlers";
import { getOpenAIClient } from "../utils/openai";
import { detectTone } from "../utils/tone";
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