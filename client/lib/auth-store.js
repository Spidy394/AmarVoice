'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';

const useAuthStore = create(
  persist(
    (set, get) => ({      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      needsProfileSetup: false,

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
      },      // Check authentication status
      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null });
          
          console.log('Checking authentication status...');
          
          const response = await api.get('/auth/check');
          const { isAuthenticated, user } = response.data;
          
          console.log('Auth check result:', { isAuthenticated, hasUser: !!user });
          
          const needsSetup = isAuthenticated && user && (!user.username || !user.name);
          
          set({ 
            isAuthenticated,
            user: user || null,
            needsProfileSetup: needsSetup,
            isLoading: false 
          });
          
          if (isAuthenticated && user) {
            console.log('User authenticated:', { id: user._id, name: user.name, username: user.username });
          }
          
          return isAuthenticated;
        } catch (error) {
          console.error('Auth check error:', error);
          set({ 
            isAuthenticated: false,
            user: null,
            needsProfileSetup: false,
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
          
          set({ user, isAuthenticated: true, needsProfileSetup: user && (!user.username || !user.name) });
          return user;
        } catch (error) {
          console.error('Get user error:', error);
          set({ user: null, isAuthenticated: false, needsProfileSetup: false });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Update user
      updateUser: (userData) => {
        const updatedUser = { ...get().user, ...userData };
        set({ 
          user: updatedUser,
          needsProfileSetup: updatedUser && (!updatedUser.username || !updatedUser.name)
        });
      },      // Complete profile setup
      completeProfileSetup: (userData) => {
        console.log('Completing profile setup with user data:', userData);
        set({ 
          user: userData,
          needsProfileSetup: false
        });
      },

      // Debug function to check database stats
      checkDatabaseStats: async () => {
        try {
          const response = await api.get('/auth/db-stats');
          console.log('Database stats:', response.data);
          return response.data;
        } catch (error) {
          console.error('Failed to get database stats:', error);
          return null;
        }
      }
    }),
    {
      name: 'auth-storage',      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        needsProfileSetup: state.needsProfileSetup
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