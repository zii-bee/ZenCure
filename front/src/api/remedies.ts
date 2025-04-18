// src/api/remedies.ts
import apiClient from './client';
import { Remedy, RemedyQueryResponse, PaginatedResponse } from '../types/index';

export const getRemedies = async (page = 1, limit = 10): Promise<PaginatedResponse<Remedy>> => {
  const response = await apiClient.get(`/remedies?page=${page}&limit=${limit}`);
  return response.data;
};

export const getRemedyById = async (id: string): Promise<Remedy> => {
  const response = await apiClient.get(`/remedies/${id}`);
  return response.data;
};

export const searchRemedies = async (keywords: string[]): Promise<Remedy[]> => {
  const response = await apiClient.post('/remedies/search', { keywords });
  return response.data;
};

export const queryRemedies = async (keywords: string[]): Promise<RemedyQueryResponse[]> => {
  const response = await apiClient.post('/remedies/query', { keywords });
  return response.data;
};