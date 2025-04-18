// src/store/authStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginData, RegisterData, AuthResponse } from '../types';
import * as authApi from '../api/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  
  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });
    try {
      const response: AuthResponse = await authApi.login(data);
      await AsyncStorage.setItem('token', response.token);
      const validatedUser: User = {
        ...response,
        role: response.role as 'user' | 'moderator' | 'admin'
      };
      set({ 
        user: validatedUser, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },
  
  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response: AuthResponse = await authApi.register(data);
      await AsyncStorage.setItem('token', response.token);
      const validatedUser: User = {
        ...response,
        role: response.role as 'user' | 'moderator' | 'admin'
      };
      set({ 
        user: validatedUser, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
  
  updateUser: async (data: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await authApi.updateProfile(data);
      set({ 
        user: { ...get().user, ...updatedUser } as User, 
        isLoading: false 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Update failed';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },
  
  checkAuth: async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false });
      return false;
    }
    
    set({ isLoading: true });
    try {
      const user = await authApi.getCurrentUser();
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } catch (error) {
      await AsyncStorage.removeItem('token');
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
      return false;
    }
  },
  
  clearError: () => set({ error: null }),
}));