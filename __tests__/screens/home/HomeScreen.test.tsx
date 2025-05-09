import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import HomeScreen from '../../../screens/home/HomeScreen';
import * as remedyApi from '../../../api/remedies';

jest.mock('../../../api/remedies');

describe('HomeScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const mockRoute = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    const { getByTestId } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('loads and displays remedies', async () => {
    const mockRemedies = [
      {
        _id: '1',
        name: 'Test Remedy 1',
        description: 'Test Description 1',
        categories: ['Category 1'],
        avgRating: 4.5,
        reviewCount: 10,
        verified: true,
      },
    ];

    (remedyApi.getRemedies as jest.Mock).mockResolvedValue({
      remedies: mockRemedies,
      pages: 1,
    });

    const { getByText, getByTestId } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    await waitFor(() => {
      expect(getByText('Test Remedy 1')).toBeTruthy();
    });

    expect(getByTestId('verified-badge-1')).toBeTruthy();
  });

  it('handles refresh', async () => {
    const mockRemedies = [
      {
        _id: '1',
        name: 'Test Remedy 1',
        description: 'Test Description 1',
        categories: ['Category 1'],
        avgRating: 4.5,
        reviewCount: 10,
        verified: true,
      },
    ];

    const mockRemedies2 = [
      ...mockRemedies,
      {
        _id: '2',
        name: 'Test Remedy 2',
        description: 'Test Description 2',
        categories: ['Category 1'],
        avgRating: 4.0,
        reviewCount: 5,
        verified: false,
      },
    ];

    (remedyApi.getRemedies as jest.Mock)
      .mockResolvedValueOnce({
        remedies: mockRemedies,
        pages: 1,
      })
      .mockResolvedValueOnce({
        remedies: mockRemedies2,
        pages: 1,
      });

    const { getByText, getByTestId } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Wait for initial load
    await waitFor(() => {
      expect(getByText('Test Remedy 1')).toBeTruthy();
    });

    // Trigger refresh
    const scrollView = getByTestId('remedies-scroll-view');
    await act(async () => {
      scrollView.props.refreshControl.props.onRefresh();
    });

    // Wait for refresh to complete and new content to appear
    await waitFor(() => {
      expect(getByText('Test Remedy 2')).toBeTruthy();
    });
  });

  it('loads more remedies when scrolling', async () => {
    const mockRemedies = [
      {
        _id: '1',
        name: 'Test Remedy 1',
        description: 'Test Description 1',
        categories: ['Category 1'],
        avgRating: 4.5,
        reviewCount: 10,
        verified: true,
      },
    ];

    const mockRemedies2 = [
      {
        _id: '2',
        name: 'Test Remedy 2',
        description: 'Test Description 2',
        categories: ['Category 1'],
        avgRating: 4.0,
        reviewCount: 5,
        verified: false,
      },
    ];

    (remedyApi.getRemedies as jest.Mock)
      .mockResolvedValueOnce({
        remedies: mockRemedies,
        pages: 2,
      })
      .mockResolvedValueOnce({
        remedies: mockRemedies2,
        pages: 2,
      });

    const { getByText, getByTestId } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Wait for initial load
    await waitFor(() => {
      expect(getByText('Test Remedy 1')).toBeTruthy();
    });

    // Simulate scroll to bottom
    const scrollView = getByTestId('remedies-scroll-view');
    await act(async () => {
      scrollView.props.onEndReached();
    });

    // Wait for new content
    await waitFor(() => {
      expect(getByText('Test Remedy 2')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('shows error state when fetch fails', async () => {
    (remedyApi.getRemedies as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    const { getByText, getByTestId, queryByTestId } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Wait for loading indicator to disappear and error state to appear
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
    });

    await waitFor(() => {
      expect(getByTestId('error-state')).toBeTruthy();
      expect(getByText('Something went wrong')).toBeTruthy();
      expect(getByText('Failed to fetch')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('shows empty state when no remedies', async () => {
    (remedyApi.getRemedies as jest.Mock).mockResolvedValueOnce({
      remedies: [],
      pages: 0,
    });

    const { getByText, getByTestId, queryByTestId } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Wait for loading indicator to disappear
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
    });

    // Wait for empty state to appear
    await waitFor(() => {
      expect(getByTestId('empty-state')).toBeTruthy();
      expect(getByText('No remedies found')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('navigates to remedy detail when pressing a remedy', async () => {
    const mockRemedies = [
      {
        _id: '1',
        name: 'Test Remedy 1',
        description: 'Test Description 1',
        categories: ['Category 1'],
        avgRating: 4.5,
        reviewCount: 10,
        verified: true,
      },
    ];

    (remedyApi.getRemedies as jest.Mock).mockResolvedValueOnce({
      remedies: mockRemedies,
      pages: 1,
    });

    const { getByTestId } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(getByTestId('remedy-card-1')).toBeTruthy();
    }, { timeout: 3000 });

    // Press the remedy card
    await act(async () => {
      fireEvent.press(getByTestId('remedy-card-1'));
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith('RemedyDetail', { id: '1' });
  });

  it('displays correct review count text for single review', async () => {
    const mockRemedies = [
      {
        _id: '1',
        name: 'Test Remedy 1',
        description: 'Test Description 1',
        categories: ['Category 1'],
        avgRating: 4.5,
        reviewCount: 1,
        verified: true,
      },
    ];

    (remedyApi.getRemedies as jest.Mock).mockResolvedValueOnce({
      remedies: mockRemedies,
      pages: 1,
    });

    const { getByTestId, getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Wait for review count to appear
    await waitFor(() => {
      expect(getByTestId('review-count-1')).toBeTruthy();
      expect(getByText('(1 review)')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('displays categories with overflow indicator', async () => {
    const mockRemedies = [
      {
        _id: '1',
        name: 'Test Remedy 1',
        description: 'Test Description 1',
        categories: ['Category 1', 'Category 2', 'Category 3', 'Category 4'],
        avgRating: 4.5,
        reviewCount: 10,
        verified: true,
      },
    ];

    (remedyApi.getRemedies as jest.Mock).mockResolvedValueOnce({
      remedies: mockRemedies,
      pages: 1,
    });

    const { getByTestId, getByText } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Wait for categories to appear
    await waitFor(() => {
      expect(getByTestId('category-1')).toBeTruthy();
      expect(getByTestId('category-2')).toBeTruthy();
      expect(getByTestId('category-3')).toBeTruthy();
      expect(getByTestId('category-overflow')).toBeTruthy();
      expect(getByText('+1')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('handles retry after error', async () => {
    (remedyApi.getRemedies as jest.Mock)
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce({
        remedies: [
          {
            _id: '1',
            name: 'Test Remedy 1',
            description: 'Test Description 1',
            categories: ['Category 1'],
            avgRating: 4.5,
            reviewCount: 10,
            verified: true,
          },
        ],
        pages: 1,
      });

    const { getByText, getByTestId } = render(
      <HomeScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Wait for error state to appear
    await waitFor(() => {
      expect(getByTestId('error-state')).toBeTruthy();
      expect(getByText('Something went wrong')).toBeTruthy();
    }, { timeout: 3000 });

    // Press retry button
    const retryButton = getByText('Try Again');
    await act(async () => {
      fireEvent.press(retryButton);
    });

    // Wait for remedy to appear after retry
    await waitFor(() => {
      expect(getByText('Test Remedy 1')).toBeTruthy();
    }, { timeout: 3000 });
  });
}); 