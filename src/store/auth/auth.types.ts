import { User as FirebaseUser } from "firebase/auth";
import { User, UserCreatePayload, UserLoginPayload } from "../../types";

export interface AuthStore {
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