import { create, StateCreator } from 'zustand';
import {
    deleteUser,
    getCurrentUser,
    updatePreferences,
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
  clearError: (): void => {
    set({ error: null });
  },
});

export const useUserStore = create<UserStore>(createUserStore); 