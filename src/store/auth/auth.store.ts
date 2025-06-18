import { create, StateCreator } from 'zustand';
import { UserCreatePayload, UserLoginPayload } from '../../types';
import {
    logout as logoutAction,
    signIn as signInAction,
    signInWithGoogle as signInWithGoogleAction,
    signUp as signUpAction,
} from './auth.actions';
import { initializeAuthListener } from './auth.listener';
import { AuthStore } from './auth.types';

const createAuthStore: StateCreator<AuthStore> = (set, _get) => ({
  user: null,
  firebaseUser: null,
  loading: false,
  error: null,
  isInitialized: false,

  signUp: (userData: UserCreatePayload) => signUpAction(set, userData),

  signIn: (credentials: UserLoginPayload) => signInAction(set, credentials),

  signInWithGoogle: () => signInWithGoogleAction(set),

  logout: () => logoutAction(set),

  clearError: () => {
    set({ error: null });
  },

  initializeAuth: () => {
    initializeAuthListener(set);
  },
});

export const useAuthStore = create(createAuthStore);

// Initialize auth state listener when the store is created
useAuthStore.getState().initializeAuth();
