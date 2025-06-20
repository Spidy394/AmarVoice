'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Get login URL from server
          const response = await api.get('/auth/login');
          const { loginUrl } = response.data;
          
          // Redirect to Civic Auth
          window.location.href = loginUrl;
          
        } catch (error) {
          console.error('Login error:', error);
          set({ 
            error: error.response?.data?.error || 'Login failed',
            isLoading: false 
          });
        }
      },

      // Logout action
      logout: async () => {
        try {
          set({ isLoading: true });
          
          // Get logout URL from server
          const response = await api.get('/auth/logout');
          const { logoutUrl } = response.data;
          
          // Clear local state
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
          
          // Redirect to Civic logout
          window.location.href = logoutUrl;
          
        } catch (error) {
          console.error('Logout error:', error);
          // Clear state anyway
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
        }
      },

      // Check authentication status
      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.get('/auth/check');
          const { isAuthenticated, user } = response.data;
          
          set({ 
            isAuthenticated,
            user: user || null,
            isLoading: false 
          });
          
          return isAuthenticated;
        } catch (error) {
          console.error('Auth check error:', error);
          set({ 
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null
          });
          return false;
        }
      },

      // Get current user
      getCurrentUser: async () => {
        try {
          const response = await api.get('/auth/user');
          const user = response.data;
          
          set({ user, isAuthenticated: true });
          return user;
        } catch (error) {
          console.error('Get user error:', error);
          set({ user: null, isAuthenticated: false });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Update user
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Custom hook for easier usage
export const useAuth = () => {
  const store = useAuthStore();
  return store;
};

export default useAuthStore;