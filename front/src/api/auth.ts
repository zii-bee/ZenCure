import apiClient from './client';
import { User, AuthResponse, LoginData, RegisterData } from '../types/index';

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await apiClient.put('/auth/me', data);
  return response.data;
};