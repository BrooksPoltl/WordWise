import { create, StateCreator } from 'zustand';
import {
    deleteUser,
    getCurrentUser,
    updatePreferences,
    updateProfile,
    updateUser,
} from './user.actions';
import { UserStore } from './user.types';

const createUserStore: StateCreator<UserStore> = (set, _get) => ({
  loading: false,
  error: null,
  getCurrentUser: () => getCurrentUser(set),
  updateUser: userData => updateUser(set, userData),
  deleteUser: () => deleteUser(set),
  updatePreferences: preferences => updatePreferences(set, preferences),
  updateProfile: profileData => updateProfile(set, profileData),
  clearError: (): void => {
    set({ error: null });
  },
});

export const useUserStore = create<UserStore>(createUserStore); 