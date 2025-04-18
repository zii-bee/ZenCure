import api from './api';

export type Symptom = {
  name: string;
  relevanceScore: number;
};

export type Remedy = {
  _id: string;
  name: string;
  description: string;
  categories: string[];
  symptoms: Symptom[];
  warnings: string[];
  sourceIds: string[];
  avgRating: number;
  reviewCount: number;
  reviewIds: string[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RemedyListResponse = {
  remedies: Remedy[];
  page: number;
  pages: number;
  total: number;
};

export type ScoredRemedy = Remedy & {
  calculatedRelevanceScore: number;
};

// Get all remedies with pagination
export const getRemedies = async (page = 1, limit = 10) => {
  const response = await api.get<RemedyListResponse>(`/remedies?page=${page}&limit=${limit}`);
  return response.data;
};

// Get a single remedy by ID
export const getRemedyById = async (id: string) => {
  const response = await api.get<Remedy>(`/remedies/${id}`);
  return response.data;
};

// Search remedies by keywords
export const searchRemedies = async (keywords: string[]) => {
  const response = await api.post<Remedy[]>('/remedies/search', { keywords });
  return response.data;
};

// Query remedies with advanced algorithm
export const queryRemedies = async (keywords: string[]) => {
  const response = await api.post<ScoredRemedy[]>('/remedies/query', { keywords });
  return response.data;
};

// Utility function to get common symptoms
export const getCommonSymptoms = async () => {
  // This is a simulated endpoint - you might want to add this to your backend API
  // For now, we'll return a set of common symptoms as a fallback
  try {
    const response = await api.get('/remedies/symptoms');
    return response.data;
  } catch (error) {
    // Fallback common symptoms
    return [
      "Headache",
      "Fatigue",
      "Insomnia",
      "Anxiety",
      "Stress",
      "Joint pain",
      "Muscle pain",
      "Indigestion",
      "Nausea",
      "Bloating",
      "Constipation",
      "Diarrhea",
      "Cough",
      "Sore throat",
      "Congestion",
      "Allergies",
      "Skin rash",
      "Dry skin",
      "Inflammation",
      "Depression"
    ];
  }
};

const remedyService = {
  getRemedies,
  getRemedyById,
  searchRemedies,
  queryRemedies,
  getCommonSymptoms
};

export default remedyService;