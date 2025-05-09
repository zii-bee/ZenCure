import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import CreateReviewScreen from '../../../screens/remedies/CreateReviewScreen';
import * as reviewApi from '../../../api/reviews';
import { Alert } from 'react-native';

// Polyfill setImmediate
const setImmediatePolyfill = (callback: Function) => setTimeout(callback, 0);
setImmediatePolyfill.__promisify__ = () => new Promise(resolve => setTimeout(resolve, 0));
(global as any).setImmediate = setImmediatePolyfill;

// Mock the navigation module
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Test data constants
const TEST_DATA = {
  validTitle: 'Valid Title',
  validContent: 'Valid review content that is long enough',
  shortTitle: 'Hi',
  shortContent: 'Hi',
  longContent: 'This is a very long review content that exceeds the minimum length requirement and should be valid for submission.',
  errorMessage: 'Failed to submit review',
  networkError: 'Network error occurred',
  serverError: 'Server error occurred'
};

// Mock Alert.alert
jest.spyOn(Alert, 'alert');

// Mock the API calls
jest.mock('../../../api/reviews', () => ({
  createReview: jest.fn(),
}));

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

const mockRoute = {
  params: { remedyId: '1' },
};

describe('CreateReviewScreen', () => {
  let cleanup: () => void;

  beforeEach(() => {
    jest.clearAllMocks();
    (Alert.alert as jest.Mock).mockClear();
    (reviewApi.createReview as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    if (cleanup) {
      cleanup();
    }
  });

  const renderCreateReviewScreen = () => {
    const result = render(
      <NavigationContainer>
        <CreateReviewScreen 
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      </NavigationContainer>
    );
    cleanup = result.unmount;
    return result;
  };

  it('renders review form correctly', () => {
    const { getByTestId } = renderCreateReviewScreen();
    expect(getByTestId('review-title-input')).toBeTruthy();
    expect(getByTestId('review-content-input')).toBeTruthy();
    expect(getByTestId('submit-button')).toBeTruthy();
  });

  it('shows validation errors for empty fields', async () => {
    const { getByTestId, getByText } = renderCreateReviewScreen();

    await act(async () => {
      fireEvent.press(getByTestId('submit-button'));
    });

    expect(getByText('Title is required')).toBeTruthy();
    expect(getByText('Review content is required')).toBeTruthy();
  });

  it('shows validation error for short title', async () => {
    const { getByTestId, getByText } = renderCreateReviewScreen();

    await act(async () => {
      fireEvent.changeText(getByTestId('review-title-input'), 'Hi');
      fireEvent.press(getByTestId('submit-button'));
    });

    expect(getByText('Title must be at least 3 characters')).toBeTruthy();
  });

  it('shows validation error for short content', async () => {
    const { getByTestId, getByText } = renderCreateReviewScreen();

    await act(async () => {
      fireEvent.changeText(getByTestId('review-content-input'), 'Hi');
      fireEvent.press(getByTestId('submit-button'));
    });

    expect(getByText('Review must be at least 10 characters')).toBeTruthy();
  });

  it('shows loading state during submission', async () => {
    const { getByTestId } = renderCreateReviewScreen();

    // Fill in all required fields
    await act(async () => {
      fireEvent.changeText(getByTestId('review-title-input'), 'Test Review');
      fireEvent.changeText(getByTestId('review-content-input'), 'This is a test review');
      fireEvent.press(getByTestId('star-rating-overall-5'));
      fireEvent.press(getByTestId('star-rating-effectiveness-4'));
      fireEvent.press(getByTestId('star-rating-side-effects-5'));
      fireEvent.press(getByTestId('star-rating-ease-4'));
    });

    // Mock slow API call
    (reviewApi.createReview as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    // Submit the form
    await act(async () => {
      fireEvent.press(getByTestId('submit-button'));
    });

    expect(getByTestId('submit-button')).toBeDisabled();
  });

  it('shows error alert when submission fails', async () => {
    const { getByTestId } = renderCreateReviewScreen();

    // Fill in all required fields
    await act(async () => {
      fireEvent.changeText(getByTestId('review-title-input'), 'Test Review');
      fireEvent.changeText(getByTestId('review-content-input'), 'This is a test review');
      fireEvent.press(getByTestId('star-rating-overall-5'));
      fireEvent.press(getByTestId('star-rating-effectiveness-4'));
      fireEvent.press(getByTestId('star-rating-side-effects-5'));
      fireEvent.press(getByTestId('star-rating-ease-4'));
    });

    // Mock API failure
    (reviewApi.createReview as jest.Mock).mockRejectedValueOnce(new Error('Failed to submit review'));

    // Submit the form
    await act(async () => {
      fireEvent.press(getByTestId('submit-button'));
    });

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to submit review');
  });
}); 