import api from './api';

export type Comment = {
  _id: string;
  userId: string | {
    _id: string;
    name: string;
  };
  reviewId: string;
  content: string;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'approved' | 'flagged';
};

export type CommentListResponse = {
  comments: Comment[];
  page: number;
  pages: number;
  total: number;
};

// Get comments for a review with pagination
export const getCommentsByReviewId = async (reviewId: string, page = 1, limit = 10) => {
  const response = await api.get<CommentListResponse>(`/comments/review/${reviewId}?page=${page}&limit=${limit}`);
  return response.data;
};

// Create a new comment
export const createComment = async (reviewId: string, content: string) => {
  const response = await api.post<Comment>(`/comments/review/${reviewId}`, { content });
  return response.data;
};

// Update a comment
export const updateComment = async (id: string, content: string) => {
  const response = await api.put<Comment>(`/comments/${id}`, { content });
  return response.data;
};

// Delete a comment
export const deleteComment = async (id: string) => {
  const response = await api.delete(`/comments/${id}`);
  return response.data;
};

// Mark a comment as helpful
export const markCommentHelpful = async (id: string) => {
  const response = await api.post<Comment>(`/comments/${id}/helpful`);
  return response.data;
};

// Admin functions

// Get pending comments (admin/moderator only)
export const getPendingComments = async (page = 1, limit = 10) => {
  const response = await api.get<CommentListResponse>(`/comments/moderation/pending?page=${page}&limit=${limit}`);
  return response.data;
};

// Update comment status (admin/moderator only)
export const updateCommentStatus = async (id: string, status: 'pending' | 'approved' | 'flagged') => {
  const response = await api.put<Comment>(`/comments/${id}/status`, { status });
  return response.data;
};

const commentService = {
  getCommentsByReviewId,
  createComment,
  updateComment,
  deleteComment,
  markCommentHelpful,
  getPendingComments,
  updateCommentStatus
};

export default commentService;