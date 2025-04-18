import api from './api';

export type Review = {
  _id: string;
  userId: string | {
    _id: string;
    name: string;
  };
  remedyId: string;
  rating: number;
  title: string;
  content: string;
  effectiveness: number;
  sideEffects: number;
  ease: number;
  helpfulCount: number;
  commentIds: string[];
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'approved' | 'flagged';
};

export type ReviewListResponse = {
  reviews: Review[];
  page: number;
  pages: number;
  total: number;
};

export type CreateReviewData = {
  rating: number;
  title: string;
  content: string;
  effectiveness: number;
  sideEffects: number;
  ease: number;
};

export type UpdateReviewData = Partial<CreateReviewData>;

// Get reviews for a remedy with pagination
export const getReviewsByRemedyId = async (remedyId: string, page = 1, limit = 10) => {
  const response = await api.get<ReviewListResponse>(`/reviews/remedy/${remedyId}?page=${page}&limit=${limit}`);
  return response.data;
};

// Get a single review by ID
export const getReviewById = async (id: string) => {
  const response = await api.get<Review>(`/reviews/${id}`);
  return response.data;
};

// Create a new review
export const createReview = async (remedyId: string, reviewData: CreateReviewData) => {
  const response = await api.post<Review>(`/reviews/remedy/${remedyId}`, reviewData);
  return response.data;
};

// Update a review
export const updateReview = async (id: string, reviewData: UpdateReviewData) => {
  const response = await api.put<Review>(`/reviews/${id}`, reviewData);
  return response.data;
};

// Delete a review
export const deleteReview = async (id: string) => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data;
};

// Mark a review as helpful
export const markReviewHelpful = async (id: string) => {
  const response = await api.post<Review>(`/reviews/${id}/helpful`);
  return response.data;
};

// Admin functions

// Get pending reviews (admin/moderator only)
export const getPendingReviews = async (page = 1, limit = 10) => {
  const response = await api.get<ReviewListResponse>(`/reviews/moderation/pending?page=${page}&limit=${limit}`);
  return response.data;
};

// Update review status (admin/moderator only)
export const updateReviewStatus = async (id: string, status: 'pending' | 'approved' | 'flagged') => {
  const response = await api.put<Review>(`/reviews/${id}/status`, { status });
  return response.data;
};

const reviewService = {
  getReviewsByRemedyId,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getPendingReviews,
  updateReviewStatus
};

export default reviewService;