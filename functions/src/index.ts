import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

functions.logger.info("Cold start: Initializing Firebase Admin SDK.", {
  structuredData: true,
});
admin.initializeApp();

// Export the new, refactored tone handlers
export { toneDetect } from "./handlers/tone";

// Export the new readability handler
export { readabilityRewrite } from "./handlers/readability";

// Export the new passive voice handler
export { passiveRewrite } from "./handlers/passive";

// Export the new user profile handler
export { updateUserProfile } from "./handlers/userProfile";

// Export the new comments handler
export { getDocumentComments } from "./handlers/comments";

