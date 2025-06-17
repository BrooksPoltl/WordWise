import { create, StateCreator } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../config';
import { User, UserCreatePayload, UserLoginPayload } from '../types';
import { logger } from '../utils/logger';

interface AuthStore {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // Actions
  signUp: (userData: UserCreatePayload) => Promise<void>;
  signIn: (credentials: UserLoginPayload) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}

const createAuthStore: StateCreator<AuthStore> = (set, _get) => ({
  user: null,
  firebaseUser: null,
  loading: false,
  error: null,
  isInitialized: false,

  signUp: async (userData: UserCreatePayload): Promise<void> => {
    set({ loading: true, error: null });
    try {
      logger.group.start('User Registration Process');
      logger.group.log(`Email: ${userData.email}`);
      logger.group.log(`Display Name: ${userData.displayName}`);
      
      // Create Firebase user
      logger.firebase.auth('Creating Firebase Auth user...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      
      const { user: firebaseUser } = userCredential;
      logger.success(`Firebase Auth user created: ${firebaseUser.uid}`);

      // Create user profile in Firestore
      const userProfile: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: userData.displayName || undefined,
        createdAt: new Date(),
        preferences: {
          language: 'en-US',
        },
      };

      logger.firebase.firestore('Creating Firestore user document...');
      logger.group.log('User profile data', userProfile);
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      logger.group.log(`Document reference: ${userDocRef.path}`);
      
      // Save to Firestore
      await setDoc(userDocRef, {
        ...userProfile,
        createdAt: Timestamp.fromDate(userProfile.createdAt),
      });
      
      logger.success('User document created successfully in Firestore!');
      
      // Verify the document was created
      const verifyDoc = await getDoc(userDocRef);
      if (verifyDoc.exists()) {
        logger.success('Verification successful - document exists', verifyDoc.data());
      } else {
        logger.error('Verification failed - document does not exist');
      }

      set({ 
        user: userProfile,
        firebaseUser,
        loading: false,
        error: null,
      });
      
      logger.success('User registration completed successfully!');
      logger.group.end();
    } catch (error: any) {
      logger.error('Error during user registration', error);
      logger.group.log('Error details', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      logger.group.end();
      
      set({ 
        loading: false, 
        error: error.message || 'Failed to create account',
      });
      throw error;
    }
  },

  signIn: async (credentials: UserLoginPayload): Promise<void> => {
    set({ loading: true, error: null });
    try {
      logger.group.start('User Sign-In Process');
      logger.group.log(`Email: ${credentials.email}`);
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      const { user: firebaseUser } = userCredential;
      logger.success(`Firebase Auth sign-in successful: ${firebaseUser.uid}`);

      // Get user profile from Firestore
      logger.firebase.firestore('Fetching user profile from Firestore...');
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        logger.success('User profile found', userDoc.data());
        const userData = userDoc.data();
        const userProfile: User = {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          createdAt: userData.createdAt.toDate(),
          preferences: userData.preferences,
        };

        set({ 
          user: userProfile,
          firebaseUser,
          loading: false,
          error: null,
        });
        logger.success('User sign-in completed successfully!');
        logger.group.end();
      } else {
        logger.error('User profile not found in Firestore');
        logger.group.end();
        throw new Error('User profile not found');
      }
    } catch (error: any) {
      logger.error('Error during user sign-in', error);
      logger.group.end();
      set({ 
        loading: false, 
        error: error.message || 'Failed to sign in',
      });
      throw error;
    }
  },

  signInWithGoogle: async (): Promise<void> => {
    set({ loading: true, error: null });
    try {
      logger.group.start('Google Sign-In Process');
      
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const { user: firebaseUser } = userCredential;
      
      logger.success(`Google Auth successful: ${firebaseUser.uid}`);

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      let userProfile: User;

      if (!userDoc.exists()) {
        logger.firebase.firestore('Creating new user profile for Google user...');
        // Create new user profile
        userProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
          createdAt: new Date(),
          preferences: {
            language: 'en-US',
          },
        };

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userDocRef, {
          ...userProfile,
          createdAt: Timestamp.fromDate(userProfile.createdAt),
        });
        
        logger.success('Google user profile created in Firestore');
      } else {
        logger.success('Existing Google user profile found');
        // Use existing profile
        const userData = userDoc.data();
        userProfile = {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          createdAt: userData.createdAt.toDate(),
          preferences: userData.preferences,
        };
      }

      set({ 
        user: userProfile,
        firebaseUser,
        loading: false,
        error: null,
      });
      
      logger.success('Google sign-in completed successfully!');
      logger.group.end();
    } catch (error: any) {
      logger.error('Error during Google sign-in', error);
      logger.group.end();
      set({ 
        loading: false, 
        error: error.message || 'Failed to sign in with Google',
      });
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    set({ loading: true, error: null });
    try {
      logger.firebase.auth('Signing out user...');
      await signOut(auth);
      set({ 
        user: null,
        firebaseUser: null,
        loading: false,
        error: null,
      });
      logger.success('User signed out successfully');
    } catch (error: any) {
      logger.error('Error during sign out', error);
      set({ 
        loading: false, 
        error: error.message || 'Failed to sign out',
      });
      throw error;
    }
  },

  clearError: (): void => {
    set({ error: null });
  },

  initializeAuth: (): void => {
    logger.debug('Initializing auth state listener...');
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        logger.debug(`Auth state changed - user signed in: ${firebaseUser.uid}`);
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            logger.debug('User profile loaded from Firestore');
            const userData = userDoc.data();
            const userProfile: User = {
              uid: userData.uid,
              email: userData.email,
              displayName: userData.displayName,
              createdAt: userData.createdAt.toDate(),
              preferences: userData.preferences,
            };

            set({ 
              user: userProfile,
              firebaseUser,
              isInitialized: true,
            });
          } else {
            logger.warning('User authenticated but no profile found in Firestore');
            set({ 
              user: null,
              firebaseUser: null,
              isInitialized: true,
            });
          }
        } catch (error) {
          logger.error('Error fetching user profile during auth state change', error);
          set({ 
            user: null,
            firebaseUser: null,
            isInitialized: true,
          });
        }
      } else {
        logger.debug('Auth state changed - user signed out');
        set({ 
          user: null,
          firebaseUser: null,
          isInitialized: true,
        });
      }
    });
  },
});

export const useAuthStore = create<AuthStore>(createAuthStore); 