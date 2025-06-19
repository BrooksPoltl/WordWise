import * as admin from 'firebase-admin';

admin.initializeApp();

// Export the new, refactored tone handlers
export { toneDetect, toneRewrite } from "./handlers/tone";
