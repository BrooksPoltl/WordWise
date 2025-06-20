import { User, UserPreferences } from '../../types';

export interface UserStore {
  loading: boolean;
  error: string | null;

  // User CRUD operations
  getCurrentUser: () => Promise<User | null>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  deleteUser: () => Promise<void>;

  // Preferences operations
  updatePreferences: (preferences: UserPreferences) => Promise<void>;

  // Profile operations
  updateProfile: (profileData: { role: string; persona?: string }) => Promise<void>;

  // Utility functions
  clearError: () => void;
} 