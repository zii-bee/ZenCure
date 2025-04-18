// src/api/comments.ts
import apiClient from './client';
import { Comment, PaginatedResponse } from '../types/index';

export const getCommentsByReviewId = async (
  reviewId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<Comment>> => {
  const response = await apiClient.get(`/comments/review/${reviewId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const createComment = async (reviewId: string, content: string): Promise<Comment> => {
  const response = await apiClient.post(`/comments/review/${reviewId}`, { content });
  return response.data;
};

export const updateComment = async (id: string, content: string): Promise<Comment> => {
  const response = await apiClient.put(`/comments/${id}`, { content });
  return response.data;
};

export const deleteComment = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/comments/${id}`);
  return response.data;
};

export const markCommentHelpful = async (id: string): Promise<Comment> => {
  const response = await apiClient.post(`/comments/${id}/helpful`);
  return response.data;
};