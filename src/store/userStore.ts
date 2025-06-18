import { create, StateCreator } from 'zustand';
import config from '../config';
import { User, UserPreferences } from '../types';
import { useAuthStore } from './authStore';

interface UserStore {
  loading: boolean;
  error: string | null;

  // User CRUD operations
  getCurrentUser: () => Promise<User | null>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  deleteUser: () => Promise<void>;

  // Preferences operations
  updatePreferences: (preferences: UserPreferences) => Promise<void>;

  // Utility functions
  clearError: () => void;
}

const createUserStore: StateCreator<UserStore> = (set, _get) => ({
  loading: false,
  error: null,

  getCurrentUser: async (): Promise<User | null> => {
    set({ loading: true, error: null });

    try {
      const authStore = useAuthStore.getState();
      const { firebaseUser } = authStore;

      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();

      const response = await fetch(`${config.apiUrl}/v1/users/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // User profile doesn't exist, return null
          set({ loading: false });
          return null;
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch user profile');
      }

      const result = await response.json();
      set({ loading: false });
      return result.data;
    } catch (error) {
      const errorObj = error as Error;
      set({
        loading: false,
        error: errorObj.message || 'Failed to fetch user profile',
      });
      return null;
    }
  },

  updateUser: async (userData: Partial<User>): Promise<void> => {
    set({ loading: true, error: null });

    try {
      const authStore = useAuthStore.getState();
      const { firebaseUser } = authStore;

      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();

      // Prepare update payload
      const updatePayload: {
        display_name?: string;
        preferences?: UserPreferences;
      } = {};

      if (userData.displayName !== undefined) {
        updatePayload.display_name = userData.displayName;
      }

      if (userData.preferences !== undefined) {
        updatePayload.preferences = userData.preferences;
      }

      const response = await fetch(`${config.apiUrl}/v1/users/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update user profile');
      }

      set({ loading: false });
    } catch (error) {
      const errorObj = error as Error;
      set({
        loading: false,
        error: errorObj.message || 'Failed to update user profile',
      });
      throw error;
    }
  },

  deleteUser: async (): Promise<void> => {
    set({ loading: true, error: null });

    try {
      const authStore = useAuthStore.getState();
      const { firebaseUser } = authStore;

      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();

      const response = await fetch(`${config.apiUrl}/v1/users/me`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete user account');
      }

      set({ loading: false });
    } catch (error) {
      const errorObj = error as Error;
      set({
        loading: false,
        error: errorObj.message || 'Failed to delete user account',
      });
      throw error;
    }
  },

  updatePreferences: async (preferences: UserPreferences): Promise<void> => {
    set({ loading: true, error: null });

    try {
      const authStore = useAuthStore.getState();
      const { firebaseUser } = authStore;

      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();

      const response = await fetch(`${config.apiUrl}/v1/users/me/preferences`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || 'Failed to update user preferences'
        );
      }

      set({ loading: false });
    } catch (error) {
      const errorObj = error as Error;
      set({
        loading: false,
        error: errorObj.message || 'Failed to update user preferences',
      });
      throw error;
    }
  },

  clearError: (): void => {
    set({ error: null });
  },
});

export const useUserStore = create<UserStore>(createUserStore);
