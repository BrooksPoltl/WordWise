import * as admin from 'firebase-admin';

admin.initializeApp();

// Export the new, refactored tone handlers
export { toneDetect, toneRewrite } from './handlers/tone';

// Export the new readability handler
export { readabilityRewrite } from './handlers/readability';

// Export the new passive voice handler
export { passiveRewrite } from './handlers/passive';
