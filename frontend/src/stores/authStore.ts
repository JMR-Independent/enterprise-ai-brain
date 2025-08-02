import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/services/api';
import { User, LoginCredentials, RegisterData } from '@/types';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true });
          
          const response = await authApi.login(credentials);
          const { access_token } = response.data;
          
          // Store token
          localStorage.setItem('token', access_token);
          set({ token: access_token });
          
          // Fetch user data
          await get().refreshUser();
          
          toast.success('Logged in successfully!');
        } catch (error: any) {
          console.error('Login error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true });
          
          const response = await authApi.register(data);
          const user = response.data;
          
          set({ user, isAuthenticated: true });
          toast.success('Registration successful! Please log in.');
        } catch (error: any) {
          console.error('Registration error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        toast.success('Logged out successfully');
      },

      refreshUser: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            set({ isAuthenticated: false, user: null, token: null });
            return;
          }

          const response = await authApi.getCurrentUser();
          const user = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
          });
        } catch (error: any) {
          console.error('Refresh user error:', error);
          // If token is invalid, clear auth state
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);