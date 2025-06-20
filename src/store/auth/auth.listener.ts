import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../config";
import { User } from "../../types";
import { logger } from "../../utils/logger";
import { AuthStore } from "./auth.types";

type AuthSet = (
  partial:
    | AuthStore
    | Partial<AuthStore>
    | ((state: AuthStore) => AuthStore | Partial<AuthStore>),
  replace?: boolean | undefined,
) => void;

export const initializeAuthListener = (set: AuthSet) => {
  set({ isInitialized: false });
  logger.firebase.auth("Setting up onAuthStateChanged listener...");

  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      logger.success("onAuthStateChanged: User is signed in", {
        uid: firebaseUser.uid,
      });

      // User is signed in, get their profile
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userProfile: User = {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          createdAt: userData.createdAt.toDate(),
          preferences: userData.preferences,
          role: userData.role,
          persona: userData.persona,
          onboardingCompleted: userData.onboardingCompleted || false,
        };
        set({
          user: userProfile,
          firebaseUser,
          loading: false,
          isInitialized: true,
        });
        logger.success("User profile loaded into store.");
      } else {
        // This case should ideally not happen if a user is authenticated
        logger.error("onAuthStateChanged: User profile not found in Firestore!");
        set({
          user: null,
          firebaseUser: null,
          loading: false,
          isInitialized: true,
        });
      }
    } else {
      // User is signed out
      logger.firebase.auth("onAuthStateChanged: User is signed out.");
      set({
        user: null,
        firebaseUser: null,
        loading: false,
        isInitialized: true,
      });
    }
  });
}; 