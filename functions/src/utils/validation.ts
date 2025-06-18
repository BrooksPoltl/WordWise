import { HttpsError } from "firebase-functions/v2/https";
import { z, ZodError } from "zod";

/**
 * A higher-order function that validates the data object of a callable function
 * against a provided Zod schema before executing the handler.
 *
 * @param schema The Zod schema to validate the data against.
 * @param handler The callable function to wrap.
 * @returns A new callable function that first validates the request data.
 * @throws Throws an 'invalid-argument' https error if validation fails.
 */
export const withValidation = <
  T extends z.ZodType<any, any>,
  A extends any[],
  U,
>(
  schema: T,
  handler: (data: z.infer<T>, ...args: A) => U,
) => {
  return (data: unknown, ...args: A): U => {
    try {
      const parsedData = schema.parse(data);
      return handler(parsedData, ...args);
    } catch (error) {
      if (error instanceof ZodError) {
        // Provide more detailed error information for debugging
        const errorDetails = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: 'received' in err ? err.received : undefined,
        }));
        
        throw new HttpsError(
          "invalid-argument",
          `Request data validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          errorDetails,
        );
      }
      throw error;
    }
  };
}; 