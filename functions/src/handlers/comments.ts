import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { getOpenAICompletion } from "../utils/openai";

// Define the structure of an AI Comment
// This will be shared with the frontend
export interface AIComment {
  id: string;
  type: "REPLACEMENT" | "ADVICE";
  suggestion: string;
  originalText?: string;
  startIndex?: number;
  endIndex?: number;
  status: "active" | "resolved";
}

const getAnalysisPrompts = (
  documentType: string,
  documentContent: string
) => {
  const commonPrompts = [
    {
      type: "REPLACEMENT",
      prompt: `Review the following text for clarity and conciseness. Your tone should be helpful and constructive.
        Respond with a JSON array of objects.
        Each object must include 'startIndex', 'endIndex', 'originalText', and a 'suggestion' with the improved text.
        If no issues are found, respond with an empty array.
        Text: "${documentContent}"`,
    },
  ];

  let specificPrompts: { type: string; prompt: string }[] = [];

  switch (documentType) {
    case "POST_MORTEM":
      specificPrompts = [
        {
          type: "ADVICE",
          prompt: `Does the following Post-Mortem document contain a section detailing "What Happened"? This section should describe the timeline of events. Respond with a JSON array containing one object with a 'suggestion' field if the section is missing. If it exists, respond with an empty array. Text: "${documentContent}"`,
        },
        {
          type: "ADVICE",
          prompt: `Does the following Post-Mortem document contain a section detailing the "Impact"? This should cover user impact, technical debt, or financial cost. Respond with a JSON array containing one object with a 'suggestion' field if the section is missing. If it exists, respond with an empty array. Text: "${documentContent}"`,
        },
        {
          type: "ADVICE",
          prompt: `Does the following Post-Mortem document contain a "Root Cause Analysis" (e.g., 5 Whys)? This is critical for understanding the core issue. Respond with a JSON array containing one object with a 'suggestion' field if the section is missing. If it exists, respond with an empty array. Text: "${documentContent}"`,
        },
        {
          type: "ADVICE",
          prompt: `Does the following Post-Mortem document contain a clear list of "Action Items"? These should be concrete tasks to prevent recurrence. Respond with a JSON array containing one object with a 'suggestion' field if the section is missing. If it exists, respond with an empty array. Text: "${documentContent}"`,
        },
      ];
      break;
    case "PRD":
      specificPrompts = [
        {
          type: "ADVICE",
          prompt: `Does this Product Requirements Document contain a clear "Problem Statement"? Respond with a JSON array containing one object with a 'suggestion' field if this section is missing or unclear. If it exists, respond with an empty array. Text: "${documentContent}"`,
        },
        {
          type: "ADVICE",
          prompt: `Does this PRD have a section for "Goals/Objectives" that are specific and measurable? Respond with a JSON array containing one object with a 'suggestion' field if this section is missing. If it exists, respond with an empty array. Text: "${documentContent}"`,
        },
        {
          type: "ADVICE",
          prompt: `Does this PRD define its "Success Metrics"? These should be quantifiable. Respond with a JSON array containing one object with a 'suggestion' field if this section is missing. If it exists, respond with an empty array. Text: "${documentContent}"`,
        },
      ];
      break;
    case "TDD":
      specificPrompts = [
        {
          type: "ADVICE",
          prompt: `Does this Technical Design Document include a "System Architecture" overview, preferably with a diagram reference? Respond with a JSON array containing one object with a 'suggestion' field if this is missing. If it exists, respond with an empty array. Text: "${documentContent}"`,
        },
        {
          type: "ADVICE",
          prompt: `Does this TDD have a "Data Model" or schema definition? Respond with a JSON array containing one object with a 'suggestion' field if this is missing. If it exists, respond with an empty array. Text: "${documentContent}"`,
        },
        {
          type: "ADVICE",
          prompt: `Does this TDD include a section on "Security Considerations"? Respond with a JSON array containing one object with a 'suggestion' field if this is missing. If it exists, respond with an empty array. Text: "${documentContent}"`,
        },
        {
          type: "ADVICE",
          prompt: `Does this TDD discuss "Alternatives Considered"? This shows thoroughness. Respond with a JSON array containing one object with a 'suggestion' field if this section is missing. If it exists, respond with an empty array. Text: "${documentContent}"`,
        },
      ];
      break;
    default:
      // For a generic document, we only run common checks
      break;
  }

  return [...commonPrompts, ...specificPrompts];
};

export const getDocumentComments = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const { documentId, documentContent, documentType } = data;

    if (!documentId || !documentContent || !documentType) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required data: documentId, documentContent, or documentType."
      );
    }

    const { uid } = context.auth;
    const db = admin.firestore();
    const docRef = db.collection("documents").doc(documentId);

    try {
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new functions.https.HttpsError("not-found", "Document not found.");
      }

      if (doc.data()?.ownerId !== uid) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You do not have permission to access this document."
        );
      }

      const commentsRef = docRef.collection("ai_comments");

      // 1. Wipe existing comments
      const existingComments = await commentsRef.get();
      const batch = db.batch();
      existingComments.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // 2. Get analysis prompts based on document type
      const analysisPrompts = getAnalysisPrompts(documentType, documentContent);

      // 3. Request analyses from OpenAI in parallel
      const analysisPromises = analysisPrompts.map(({ type, prompt }) =>
        getOpenAICompletion(prompt).then((result) => ({
          type,
          result,
        }))
      );

      const analysisResults = await Promise.all(analysisPromises);

      // 4. Process results and save new comments
      const newCommentsBatch = db.batch();
      analysisResults.forEach(({ type, result }) => {
        try {
          // Assuming the result from OpenAI is a stringified JSON array
          const comments: Partial<AIComment>[] = JSON.parse(result);
          
          comments.forEach((comment) => {
            const newCommentRef = commentsRef.doc();
            const newComment: AIComment = {
              id: newCommentRef.id,
              type: type as "REPLACEMENT" | "ADVICE",
              suggestion: comment.suggestion || "",
              originalText: comment.originalText,
              startIndex: comment.startIndex,
              endIndex: comment.endIndex,
              status: "active",
            };
            newCommentsBatch.set(newCommentRef, newComment);
          });
        } catch (error) {
          functions.logger.error("Error parsing OpenAI response:", { result, error });
          // Continue to next result even if one fails
        }
      });
      
      await newCommentsBatch.commit();

      return { success: true, message: "Comments generated successfully." };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      functions.logger.error("Error getting document comments:", error);
      throw new functions.https.HttpsError(
        "internal",
        "An error occurred while generating comments."
      );
    }
  }
); 