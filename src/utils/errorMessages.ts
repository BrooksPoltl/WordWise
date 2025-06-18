import { FirebaseError } from 'firebase/app';

// Map Firebase Auth error codes and other common error objects to human-readable messages that we can safely surface to end-users.
// If we cannot determine a specific message, fall back to the provided default.
export function getFriendlyErrorMessage(
  error: unknown,
  fallback: string = 'Something went wrong. Please try again.'
): string {
  // Plain string errors – assume already user friendly.
  if (typeof error === 'string') {
    return error;
  }

  // Firebase errors supply a well-defined error code we can translate.
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already in use. Try signing in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with that email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/weak-password':
        return 'Please choose a stronger password (at least 6 characters).';
      case 'auth/popup-closed-by-user':
        return 'The sign-in popup was closed before completing.';
      case 'auth/popup-blocked':
        return 'Your browser blocked the sign-in popup. Please allow pop-ups and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is currently disabled.';
      case 'unavailable':
        return 'Service unavailable. Please try again later.';
      case 'internal':
        return 'An internal server error occurred. Please try again.';
      case 'deadline-exceeded':
        return 'The request timed out. Please try again.';
      case 'not-found':
        return 'The requested resource was not found.';
      case 'failed-precondition':
        return 'Operation failed due to unmet prerequisites.';
      default:
        // For any other auth error, hide the code and show generic message.
        return fallback;
    }
  }

  // Firestore & generic Firebase errors often expose a "code" property as a string.
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const { code } = error as { code: string };
    if (code === 'permission-denied') {
      return 'You do not have permission to perform this action.';
    }
  }

  // If error has a (reasonably short) message, surface it – otherwise use fallback.
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    const msg = (error as { message: string }).message.trim();
    if (msg.length > 0 && msg.length <= 120) {
      return msg;
    }
  }

  return fallback;
}
