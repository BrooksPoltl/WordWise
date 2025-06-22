import { z } from "zod";
import { createApiHandler } from "../utils/handlers";
import { generateAdvisoryComments } from "../utils/openai";
import { withValidation } from "../utils/validation";

// Define the schema for the requestAdvisoryComments function's input
const requestAdvisoryCommentsSchema = z.object({
  documentContent: z.string().min(1, { message: "Document content must be provided." }),
  userContext: z.string().optional(),
  documentContext: z.string().optional(),
  documentType: z.string().optional(),
});

// The core advisory comments generation logic
const requestAdvisoryCommentsHandler = withValidation(
  requestAdvisoryCommentsSchema,
  async ({ documentContent, userContext = '', documentContext = '', documentType = '' }, _auth) => {
    const suggestions = await generateAdvisoryComments(
      documentContent,
      userContext,
      documentContext,
      documentType
    );
    return suggestions;
  },
);

// Export the final, wrapped function
export const requestAdvisoryComments = createApiHandler(requestAdvisoryCommentsHandler); 