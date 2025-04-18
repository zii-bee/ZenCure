import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

// Define the User type
type User = {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  healthProfile?: {
    allergies: string[];
    conditions: string[];
    preferences: string[];
  };
};

// Define the context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        
        if (token) {
          // Get current user
          const response = await api.get('/auth/me');
          setUser(response.data);
        }
      } catch (error) {
        // Handle error (token invalid, etc.)
        console.error('Failed to load user', error);
        await SecureStore.deleteItemAsync('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      // Save token
      await SecureStore.setItemAsync('authToken', response.data.token);
      
      // Set user
      setUser({
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        healthProfile: response.data.healthProfile
      });
      
      return true;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/register', { name, email, password });
      
      // Save token
      await SecureStore.setItemAsync('authToken', response.data.token);
      
      // Set user
      setUser({
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        healthProfile: response.data.healthProfile
      });
      
      return true;
    } catch (error) {
      console.error('Registration failed', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await SecureStore.deleteItemAsync('authToken');
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.put('/auth/me', userData);
      
      // Update token if returned
      if (response.data.token) {
        await SecureStore.setItemAsync('authToken', response.data.token);
      }
      
      // Update user
      setUser(prevUser => ({
        ...prevUser!,
        ...userData,
        healthProfile: {
          ...prevUser?.healthProfile,
          ...userData.healthProfile
        }
      }));
      
      return true;
    } catch (error) {
      console.error('Profile update failed', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Provide auth context
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        isAuthenticated: !!user, 
        login, 
        register, 
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;