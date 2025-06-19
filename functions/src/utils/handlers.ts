import * as admin from "firebase-admin";
import { https, logger } from "firebase-functions/v2";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";

type AuthenticatedHandler<T, U> = (
  data: T,
  auth: admin.auth.DecodedIdToken,
) => Promise<U> | U;

export const createApiHandler = <T, U>(
  handler: AuthenticatedHandler<T, U>,
) => {
  return https.onCall(async (request: CallableRequest<T>) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
      );
    }

    try {
      const result = await handler(request.data, request.auth.token);
      return result;
    } catch (error) {
      if (error instanceof HttpsError) {
        logger.error("Function error:", {
          code: error.code,
          message: error.message,
          details: error.details,
        });
        throw error;
      }

      logger.error("Unhandled error in handler:", {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });

      throw new HttpsError("internal", "An internal error occurred.");
    }
  });
}; 