import { z } from "zod";
import { createApiHandler } from "../utils/handlers";
import { getOpenAIClient } from "../utils/openai";
import {
    performSpellCheck
} from "../utils/spellcheck";
import { withValidation } from "../utils/validation";

// Define the schema for the spellCheck function's input
const spellCheckSchema = z.object({
  words: z.array(z.string()).min(1, "At least one word must be provided."),
  limitSuggestions: z.boolean().optional().default(false),
});

// The core spell-checking logic
const spellCheckHandler = withValidation(
  spellCheckSchema,
  async ({ words, limitSuggestions }, _auth) => {
    const openaiClient = getOpenAIClient();
    const suggestionMap = await performSpellCheck(
      words,
      limitSuggestions,
      openaiClient,
    );

    // The Map will be automatically serialized into an object by Firebase.
    return { success: true, suggestions: suggestionMap };
  },
);

// Export the final, wrapped function
export const spellCheck = createApiHandler(spellCheckHandler); 