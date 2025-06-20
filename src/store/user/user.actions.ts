import { httpsCallable } from 'firebase/functions';
import config, { functions } from '../../config';
import { User, UserPreferences } from '../../types';
import { useAuthStore } from '../auth/auth.store';
import { UserStore } from './user.types';

type UserSet = (
  partial:
    | UserStore
    | Partial<UserStore>
    | ((state: UserStore) => UserStore | Partial<UserStore>),
  replace?: boolean | undefined,
) => void;

export const getCurrentUser = async (set: UserSet): Promise<User | null> => {
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
};

export const updateUser = async (
  set: UserSet,
  userData: Partial<User>,
): Promise<void> => {
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
};

export const deleteUser = async (set: UserSet): Promise<void> => {
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
};

export const updatePreferences = async (
  set: UserSet,
  preferences: UserPreferences,
): Promise<void> => {
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
        errorData.detail || 'Failed to update user preferences',
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
};

export const updateProfile = async (
  set: UserSet,
  profileData: { role: string; persona?: string },
): Promise<void> => {
  set({ loading: true, error: null });

  try {
    const authStore = useAuthStore.getState();
    const { firebaseUser, user } = authStore;

    if (!firebaseUser || !user) {
      throw new Error('User not authenticated');
    }

    // Call the Firebase Function
    const updateUserProfileCallable = httpsCallable<
      { role: string; persona?: string },
      { success: boolean; message: string; data: { role: string; persona?: string } }
    >(functions, 'updateUserProfile');

    const result = await updateUserProfileCallable(profileData);
    const { success, message } = result.data;

    if (!success) {
      throw new Error(message || 'Failed to update user profile');
    }

    // Update the auth store's user state immediately
    useAuthStore.setState({
      user: {
        ...user,
        role: profileData.role,
        persona: profileData.persona,
        onboardingCompleted: true,
      },
    });

    set({ loading: false });
  } catch (error) {
    const errorObj = error as Error;
    set({
      loading: false,
      error: errorObj.message || 'Failed to update user profile',
    });
    throw error;
  }
}; 