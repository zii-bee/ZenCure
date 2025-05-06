// src/types/index.ts

// Auth Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  healthProfile?: {
    allergies: string[];
    conditions: string[];
    preferences: string[];
  };
  reviewIds?: string[];
  commentIds?: string[];
  createdAt?: Date;
  token?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  healthProfile?: {
    allergies: string[];
    conditions: string[];
    preferences: string[];
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Remedy Types
export interface Remedy {
  _id: string;
  name: string;
  description: string;
  categories: string[];
  symptoms: {
    name: string;
    relevanceScore: number;
  }[];
  warnings: string[];
  sourceIds: string[];
  avgRating: number;
  reviewCount: number;
  reviewIds: string[];
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
}

export interface RemedyQueryResponse extends Remedy {
  calculatedRelevanceScore: number;
}

// Review Types
export interface Review {
  _id: string;
  userId: User;
  remedyId: Remedy;
  rating: number;
  title: string;
  content: string;
  effectiveness: number;
  sideEffects: number;
  ease: number;
  helpfulCount: number;
  commentIds: string[] | Comment[];
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'approved' | 'flagged';
}


export interface CreateReviewData {
  rating: number;
  title: string;
  content: string;
  effectiveness: number;
  sideEffects: number;
  ease: number;
}

// Comment Types
export interface Comment {
  _id: string;
  userId: User;
  reviewId: Review;
  content: string;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'approved' | 'flagged';
}

// Shared Types
export interface PaginatedResponse<T> {
  page: number;
  pages: number;
  total: number;
  [key: string]: any; // For data array with dynamic key (remedies, reviews, comments)
}

// Source Types
export interface Source {
  _id: string;
  title: string;
  url: string;
  credibilityScore: number;
  publicationDate?: Date;
  authors?: string[];
  publisher?: string;
  isPeerReviewed: boolean;
  remedyIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  RemedyDetail: { id: string };
  ReviewDetail: { id: string };
  Profile: undefined;
  Search: undefined;
  CreateReview: { remedyId: string };
};

export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
  Admin?: undefined;
  Moderator?: undefined;
};

// Admin Navigation Types
export type AdminStackParamList = {
AdminDashboard: undefined;
AdminUserManagement: undefined;
AdminCreateRemedy: undefined;
AdminCreateSource: undefined;
AdminReviewManagement: undefined;
AdminCommentManagement: undefined;
};

export type ModeratorStackParamList = {
ModeratorDashboard: undefined;
AdminReviewManagement: undefined;
};

