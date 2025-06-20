import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../../config";
import { User, UserCreatePayload, UserLoginPayload } from "../../types";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";
import { logger } from "../../utils/logger";
import { AuthStore } from "./auth.types";

type AuthSet = (
  partial:
    | AuthStore
    | Partial<AuthStore>
    | ((state: AuthStore) => AuthStore | Partial<AuthStore>),
  replace?: boolean | undefined,
) => void;

export const signUp = async (
  set: AuthSet,
  userData: UserCreatePayload,
): Promise<void> => {
  set({ loading: true, error: null });
  try {
    logger.group.start("User Registration Process");
    logger.group.log(`Email: ${userData.email}`);
    logger.group.log(`Display Name: ${userData.displayName}`);

    // Create Firebase user
    logger.firebase.auth("Creating Firebase Auth user...");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password,
    );

    const { user: firebaseUser } = userCredential;
    logger.success(`Firebase Auth user created: ${firebaseUser.uid}`);

    // Create user profile in Firestore
    const userProfile: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: userData.displayName || undefined,
      createdAt: new Date(),
      preferences: {
        language: "en-US",
      },
      onboardingCompleted: false,
    };

    logger.firebase.firestore("Creating Firestore user document...");
    logger.group.log("User profile data", userProfile);

    const userDocRef = doc(db, "users", firebaseUser.uid);
    logger.group.log(`Document reference: ${userDocRef.path}`);

    // Save to Firestore
    await setDoc(userDocRef, {
      ...userProfile,
      createdAt: Timestamp.fromDate(userProfile.createdAt),
    });

    logger.success("User document created successfully in Firestore!");

    // Verify the document was created
    const verifyDoc = await getDoc(userDocRef);
    if (verifyDoc.exists()) {
      logger.success(
        "Verification successful - document exists",
        verifyDoc.data(),
      );
    } else {
      logger.error("Verification failed - document does not exist");
    }

    set({
      user: userProfile,
      firebaseUser,
      loading: false,
      error: null,
    });

    logger.success("User registration completed successfully!");
    logger.group.end();
  } catch (error) {
    const errorObj = error as Error & { code?: string };
    logger.error("Error during user registration", error);
    logger.group.log("Error details", {
      message: errorObj.message,
      code: errorObj.code,
      stack: errorObj.stack,
    });
    logger.group.end();

    set({
      loading: false,
      error: getFriendlyErrorMessage(error, "Failed to create account"),
    });
    throw error;
  }
};

export const signIn = async (
  set: AuthSet,
  credentials: UserLoginPayload,
): Promise<void> => {
  set({ loading: true, error: null });
  try {
    logger.group.start("User Sign-In Process");
    logger.group.log(`Email: ${credentials.email}`);

    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password,
    );

    const { user: firebaseUser } = userCredential;
    logger.success(`Firebase Auth sign-in successful: ${firebaseUser.uid}`);

    // Get user profile from Firestore
    logger.firebase.firestore("Fetching user profile from Firestore...");
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

    if (userDoc.exists()) {
      logger.success("User profile found", userDoc.data());
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
        error: null,
      });
      logger.success("User sign-in completed successfully!");
      logger.group.end();
    } else {
      logger.error("User profile not found in Firestore");
      logger.group.end();
      throw new Error("User profile not found");
    }
  } catch (error) {
    logger.error("Error during user sign-in", error);
    logger.group.end();
    set({
      loading: false,
      error: getFriendlyErrorMessage(error, "Failed to sign in"),
    });
    throw error;
  }
};

export const logout = async (set: AuthSet): Promise<void> => {
  set({ loading: true, error: null });
  try {
    logger.group.start("User Sign-Out Process");
    await signOut(auth);
    set({
      user: null,
      firebaseUser: null,
      loading: false,
      error: null,
    });
    logger.success("User signed out successfully.");
    logger.group.end();
  } catch (error) {
    logger.error("Error during sign-out", error);
    logger.group.end();
    set({
      loading: false,
      error: getFriendlyErrorMessage(error, "Failed to sign out"),
    });
    throw error;
  }
};

export const signInWithGoogle = async (set: AuthSet): Promise<void> => {
  set({ loading: true, error: null });
  try {
    logger.group.start("Google Sign-In Process");

    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const { user: firebaseUser } = userCredential;

    logger.success(`Google Auth successful: ${firebaseUser.uid}`);

    // Check if user profile exists
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

    let userProfile: User;

    if (!userDoc.exists()) {
      logger.firebase.firestore(
        "Creating new user profile for Google user...",
      );
      // Create new user profile
      userProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || undefined,
        createdAt: new Date(),
        preferences: {
          language: "en-US",
        },
        onboardingCompleted: false,
      };

      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...userProfile,
        createdAt: Timestamp.fromDate(userProfile.createdAt),
      });
      logger.success("New user profile created.");
    } else {
      logger.firebase.firestore("Existing user profile found.");
      const userData = userDoc.data();
      userProfile = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        createdAt: userData.createdAt.toDate(),
        preferences: userData.preferences,
        role: userData.role,
        persona: userData.persona,
        onboardingCompleted: userData.onboardingCompleted || false,
      };
    }

    set({
      user: userProfile,
      firebaseUser,
      loading: false,
      error: null,
    });
    logger.success("Google sign-in completed successfully!");
    logger.group.end();
  } catch (error) {
    logger.error("Error during Google sign-in", error);
    logger.group.end();
    set({
      loading: false,
      error: getFriendlyErrorMessage(error, "Failed to sign in with Google"),
    });
    throw error;
  }
}; 