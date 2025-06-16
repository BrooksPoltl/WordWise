import { create, StateCreator } from 'zustand';
import { User, UserCreatePayload } from '../types';

interface UserStore {
  users: User[];
  loading: boolean;
  createUser: (user: UserCreatePayload) => Promise<void>;
}

const createUserStore: StateCreator<UserStore> = (set) => ({
  users: [],
  loading: false,
  
  createUser: async (userData: UserCreatePayload): Promise<void> => {
    set({ loading: true });
    try {
      const response: Response = await fetch('http://localhost:8000/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        const newUser: User = await response.json() as User;
        set((state: UserStore) => ({ 
          users: [...state.users, newUser],
          loading: false,
        }));
      } else {
        console.error('Failed to create user');
        set({ loading: false });
      }
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      set({ loading: false });
    }
  },
});

export const useUserStore = create<UserStore>(createUserStore); 