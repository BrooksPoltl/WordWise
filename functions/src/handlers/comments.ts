import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { generateAdvisoryComments } from "../utils/openai";

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



export const getDocumentComments = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const { documentId, documentContent, documentType, documentContext, userContext } = data;

    if (!documentId || !documentContent) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required data: documentId or documentContent."
      );
    }

    // documentType is optional - can be empty string for generic analysis
    const safeDocumentType = documentType || 'Generic Document';

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

      // 2. Generate advisory comments using the new concurrent system
      const advisoryComments = await generateAdvisoryComments(
        documentContent,
        userContext || '',
        documentContext || '',
        safeDocumentType
      );

      // 3. Process and save new comments  
      const newCommentsBatch = db.batch();
      const processedComments: any[] = [];
      
      advisoryComments.forEach((comment) => {
        try {
          const newCommentRef = commentsRef.doc();
          const newComment: AIComment = {
            id: newCommentRef.id,
            type: "ADVICE", // All advisory comments are ADVICE type
            suggestion: comment.explanation || "",
            originalText: comment.sentence,
            startIndex: undefined, // Advisory comments don't need precise positioning
            endIndex: undefined,
            status: "active",
          };
          newCommentsBatch.set(newCommentRef, newComment);
          
          // Also add to the response for frontend processing
          processedComments.push({
            sentence: comment.sentence,
            explanation: comment.explanation,
            reason: comment.reason
          });
        } catch (error) {
          functions.logger.error("Error processing advisory comment:", { comment, error });
          // Continue to next comment even if one fails
        }
      });
      
      await newCommentsBatch.commit();

      return processedComments; // Return the comments for frontend processing
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