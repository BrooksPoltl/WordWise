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
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      
      const { user: firebaseUser } = userCredential;

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

      // Save to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userProfile,
        createdAt: Timestamp.fromDate(userProfile.createdAt),
      });

      set({ 
        user: userProfile,
        firebaseUser,
        loading: false,
        error: null,
      });
    } catch (error: any) {
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      const { user: firebaseUser } = userCredential;

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
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
      } else {
        throw new Error('User profile not found');
      }
    } catch (error: any) {
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
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const { user: firebaseUser } = userCredential;

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      let userProfile: User;

      if (!userDoc.exists()) {
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

        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...userProfile,
          createdAt: Timestamp.fromDate(userProfile.createdAt),
        });
      } else {
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
    } catch (error: any) {
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
      await signOut(auth);
      set({ 
        user: null,
        firebaseUser: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
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
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
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
            set({ 
              user: null,
              firebaseUser: null,
              isInitialized: true,
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          set({ 
            user: null,
            firebaseUser: null,
            isInitialized: true,
          });
        }
      } else {
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