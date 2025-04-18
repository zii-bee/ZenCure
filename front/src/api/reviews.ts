// src/api/reviews.ts
import apiClient from './client';
import { Review, PaginatedResponse, CreateReviewData } from '../types/index';

export const getReviewsByRemedyId = async (
  remedyId: string, 
  page = 1, 
  limit = 10
): Promise<PaginatedResponse<Review>> => {
  const response = await apiClient.get(`/reviews/remedy/${remedyId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const getReviewById = async (id: string): Promise<Review> => {
  const response = await apiClient.get(`/reviews/${id}`);
  return response.data;
};

export const createReview = async (remedyId: string, data: CreateReviewData): Promise<Review> => {
  const response = await apiClient.post(`/reviews/remedy/${remedyId}`, data);
  return response.data;
};

export const updateReview = async (id: string, data: Partial<CreateReviewData>): Promise<Review> => {
  const response = await apiClient.put(`/reviews/${id}`, data);
  return response.data;
};

export const deleteReview = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/reviews/${id}`);
  return response.data;
};

export const markReviewHelpful = async (id: string): Promise<Review> => {
  const response = await apiClient.post(`/reviews/${id}/helpful`);
  return response.data;
};
