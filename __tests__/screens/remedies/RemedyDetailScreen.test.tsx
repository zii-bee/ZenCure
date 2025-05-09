import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RemedyDetailScreen from '../../../screens/remedies/RemedyDetailScreen';
import * as remedyApi from '../../../api/remedies';
import * as reviewApi from '../../../api/reviews';
import { RootStackParamList } from '../../../types';

// Mock the API calls
jest.mock('../../../api/remedies', () => ({
  getRemedyById: jest.fn()
}));

jest.mock('../../../api/reviews', () => ({
  getReviewsByRemedyId: jest.fn()
}));

// Mock navigation
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Screen: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }),
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn()
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

const mockRoute = {
  key: 'RemedyDetail',
  name: 'RemedyDetail' as const,
  params: { id: '1' }
} as const;

const mockRemedy = {
  _id: '1',
  name: 'Test Remedy',
  description: 'Test Description',
  avgRating: 4.5,
  reviewCount: 10,
  verified: true,
  categories: ['Category 1', 'Category 2'],
  warnings: ['Warning 1', 'Warning 2'],
  symptoms: [
    { name: 'Symptom 1', relevanceScore: 90 },
    { name: 'Symptom 2', relevanceScore: 80 }
  ]
};

const mockReviews = {
  reviews: [
    {
      _id: '1',
      userId: { name: 'Test User' },
      rating: 5,
      title: 'Great Remedy',
      content: 'This remedy worked wonders!',
      effectiveness: 5,
      ease: 4,
      helpfulCount: 10,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      userId: { name: 'Another User' },
      rating: 4,
      title: 'Good Remedy',
      content: 'Pretty effective.',
      effectiveness: 4,
      ease: 3,
      helpfulCount: 5,
      createdAt: '2024-01-02T00:00:00.000Z'
    },
    {
      _id: '3',
      userId: { name: 'Third User' },
      rating: 5,
      title: 'Excellent',
      content: 'Very helpful remedy.',
      effectiveness: 5,
      ease: 5,
      helpfulCount: 8,
      createdAt: '2024-01-03T00:00:00.000Z'
    },
    {
      _id: '4',
      userId: { name: 'Fourth User' },
      rating: 4,
      title: 'Works Well',
      content: 'Recommended for everyone.',
      effectiveness: 4,
      ease: 4,
      helpfulCount: 6,
      createdAt: '2024-01-04T00:00:00.000Z'
    }
  ]
};

const renderRemedyDetailScreen = () => {
  return render(
    <NavigationContainer>
      <RemedyDetailScreen navigation={mockNavigation as any} route={mockRoute as any} />
    </NavigationContainer>
  );
};

describe('RemedyDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (remedyApi.getRemedyById as jest.Mock).mockResolvedValue(mockRemedy);
    (reviewApi.getReviewsByRemedyId as jest.Mock).mockResolvedValue(mockReviews);
  });

  it('shows loading state initially', () => {
    const { getByTestId } = renderRemedyDetailScreen();
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders remedy details correctly', async () => {
    const { getByText, findByText } = renderRemedyDetailScreen();

    // Wait for remedy details to load
    await waitFor(() => {
      expect(remedyApi.getRemedyById).toHaveBeenCalledWith('1');
    });

    // Check if remedy details are rendered
    expect(await findByText('Test Remedy')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
    expect(getByText('Category 1')).toBeTruthy();
    expect(getByText('Category 2')).toBeTruthy();
    expect(getByText('Warning 1')).toBeTruthy();
    expect(getByText('Warning 2')).toBeTruthy();
    expect(getByText('Symptom 1')).toBeTruthy();
    expect(getByText('Symptom 2')).toBeTruthy();
  });

  it('shows verified badge for verified remedies', async () => {
    const { findByText } = renderRemedyDetailScreen();
    expect(await findByText('Verified')).toBeTruthy();
  });

  it('renders reviews correctly', async () => {
    const { findByText, getByText } = renderRemedyDetailScreen();

    // Wait for reviews to load
    await waitFor(() => {
      expect(reviewApi.getReviewsByRemedyId).toHaveBeenCalledWith('1');
    });

    // Check if reviews are rendered
    expect(await findByText('Great Remedy')).toBeTruthy();
    expect(getByText('This remedy worked wonders!')).toBeTruthy();
    expect(getByText('Good Remedy')).toBeTruthy();
    expect(getByText('Pretty effective.')).toBeTruthy();
  });

  it('shows empty state when no reviews', async () => {
    (reviewApi.getReviewsByRemedyId as jest.Mock).mockResolvedValue({ reviews: [] });

    const { findByText } = renderRemedyDetailScreen();
    expect(await findByText('No reviews yet. Be the first to review!')).toBeTruthy();
  });

  it('navigates to create review screen', async () => {
    const { findByText, getByTestId } = renderRemedyDetailScreen();
    
    // Wait for content to load
    await findByText('Test Remedy');
    
    // Wait for the Write Review button to be available
    await waitFor(() => {
      expect(getByTestId('write-review-button')).toBeTruthy();
    });
    
    // Click write review button
    fireEvent.press(getByTestId('write-review-button'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CreateReview', { remedyId: '1' });
  });

  it('navigates to review detail screen', async () => {
    const { findByText } = renderRemedyDetailScreen();
    
    // Wait for content to load
    await findByText('Great Remedy');
    
    // Click on review
    fireEvent.press(await findByText('Great Remedy'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ReviewDetail', { id: '1' });
  });

  it('shows error state when remedy fetch fails', async () => {
    (remedyApi.getRemedyById as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    const { findByText } = renderRemedyDetailScreen();
    
    expect(await findByText('Something went wrong')).toBeTruthy();
    expect(await findByText('Failed to fetch')).toBeTruthy();
  });

  it('navigates back when error occurs', async () => {
    (remedyApi.getRemedyById as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    const { findByText } = renderRemedyDetailScreen();
    
    // Wait for error state
    await findByText('Something went wrong');
    
    // Click go back button
    fireEvent.press(await findByText('Go Back'));
    
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('shows correct review count', async () => {
    const { findByText } = renderRemedyDetailScreen();
    
    // Wait for content to load
    await findByText('Test Remedy');
    
    expect(await findByText('(10 reviews)')).toBeTruthy();
  });

  it('shows "View all reviews" when more than 3 reviews', async () => {
    const { findByText } = renderRemedyDetailScreen();
    
    // Wait for content to load
    await findByText('Test Remedy');
    
    expect(await findByText('View all 4 reviews')).toBeTruthy();
  });

  it('displays symptom relevance scores', async () => {
    const { findByText } = renderRemedyDetailScreen();
    
    // Wait for content to load
    await findByText('Test Remedy');
    
    expect(await findByText('Relevance: 90/100')).toBeTruthy();
    expect(await findByText('Relevance: 80/100')).toBeTruthy();
  });
}); 