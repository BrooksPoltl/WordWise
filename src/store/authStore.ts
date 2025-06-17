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
      console.log('🚀 Starting user registration process...');
      console.log('📧 Email:', userData.email);
      console.log('👤 Display Name:', userData.displayName);
      
      // Create Firebase user
      console.log('🔑 Creating Firebase Auth user...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      
      const { user: firebaseUser } = userCredential;
      console.log('✅ Firebase Auth user created:', firebaseUser.uid);

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

      console.log('💾 Creating Firestore user document...');
      console.log('📄 User profile data:', userProfile);
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      console.log('📍 Document reference:', userDocRef.path);
      
      // Save to Firestore
      await setDoc(userDocRef, {
        ...userProfile,
        createdAt: Timestamp.fromDate(userProfile.createdAt),
      });
      
      console.log('✅ User document created successfully in Firestore!');
      
      // Verify the document was created
      const verifyDoc = await getDoc(userDocRef);
      if (verifyDoc.exists()) {
        console.log('✅ Verification successful - document exists:', verifyDoc.data());
      } else {
        console.error('❌ Verification failed - document does not exist');
      }

      set({ 
        user: userProfile,
        firebaseUser,
        loading: false,
        error: null,
      });
      
      console.log('🎉 User registration completed successfully!');
    } catch (error: any) {
      console.error('❌ Error during user registration:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
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
      console.log('🔑 Starting user sign-in process...');
      console.log('📧 Email:', credentials.email);
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      const { user: firebaseUser } = userCredential;
      console.log('✅ Firebase Auth sign-in successful:', firebaseUser.uid);

      // Get user profile from Firestore
      console.log('📄 Fetching user profile from Firestore...');
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        console.log('✅ User profile found:', userDoc.data());
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
        console.log('🎉 User sign-in completed successfully!');
      } else {
        console.error('❌ User profile not found in Firestore');
        throw new Error('User profile not found');
      }
    } catch (error: any) {
      console.error('❌ Error during user sign-in:', error);
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
      console.log('🔑 Starting Google sign-in process...');
      
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const { user: firebaseUser } = userCredential;
      
      console.log('✅ Google Auth successful:', firebaseUser.uid);

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      let userProfile: User;

      if (!userDoc.exists()) {
        console.log('📄 Creating new user profile for Google user...');
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
        
        console.log('✅ Google user profile created in Firestore');
      } else {
        console.log('✅ Existing Google user profile found');
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
      
      console.log('🎉 Google sign-in completed successfully!');
    } catch (error: any) {
      console.error('❌ Error during Google sign-in:', error);
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
      console.log('👋 Signing out user...');
      await signOut(auth);
      set({ 
        user: null,
        firebaseUser: null,
        loading: false,
        error: null,
      });
      console.log('✅ User signed out successfully');
    } catch (error: any) {
      console.error('❌ Error during sign out:', error);
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
    console.log('🔧 Initializing auth state listener...');
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('👤 Auth state changed - user signed in:', firebaseUser.uid);
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            console.log('✅ User profile loaded from Firestore');
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
            console.log('⚠️ User authenticated but no profile found in Firestore');
            set({ 
              user: null,
              firebaseUser: null,
              isInitialized: true,
            });
          }
        } catch (error) {
          console.error('❌ Error fetching user profile during auth state change:', error);
          set({ 
            user: null,
            firebaseUser: null,
            isInitialized: true,
          });
        }
      } else {
        console.log('👤 Auth state changed - user signed out');
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