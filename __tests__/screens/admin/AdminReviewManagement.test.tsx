import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AdminReviewManagementScreen from '../../../screens/admin/AdminReviewManagementScreen';
import { useAuthStore } from '../../../store/authStore';
import * as adminApi from '../../../api/admin';

// Mock the auth store
const mockUseAuthStore = jest.fn();
jest.mock('../../../store/authStore', () => ({
  useAuthStore: () => mockUseAuthStore()
}));

// Mock the admin API
jest.mock('../../../api/admin', () => ({
  getAllReviews: jest.fn(),
  updateReviewStatus: jest.fn()
}));

// Mock setImmediate for React Native animations
(global as any).setImmediate = jest.fn((fn: () => void) => setTimeout(fn, 0));

describe('AdminReviewManagementScreen', () => {
  const mockReviews = [
    {
      _id: '1',
      userId: {
        _id: 'user1',
        name: 'Test User 1'
      },
      remedyId: {
        _id: 'remedy1',
        name: 'Test Remedy 1'
      },
      rating: 4,
      content: 'Great remedy!',
      status: 'pending',
      createdAt: '2024-01-01'
    },
    {
      _id: '2',
      userId: {
        _id: 'user2',
        name: 'Test User 2'
      },
      remedyId: {
        _id: 'remedy2',
        name: 'Test Remedy 2'
      },
      rating: 3,
      content: 'Good remedy',
      status: 'flagged',
      createdAt: '2024-01-02'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockImplementation(() => ({
      user: { role: 'admin' },
      isLoading: false,
      error: null
    }));
    (adminApi.getAllReviews as jest.Mock).mockResolvedValue(mockReviews);
  });

  it('renders review management screen correctly', async () => {
    const { getByText } = render(<AdminReviewManagementScreen />);
    
    await waitFor(() => {
      expect(getByText('Manage Reviews')).toBeTruthy();
    });
  });

  it('loads and displays reviews', async () => {
    const { getByText } = render(<AdminReviewManagementScreen />);
    
    await waitFor(() => {
      expect(getByText('User: Test User 1')).toBeTruthy();
      expect(getByText('Remedy: Test Remedy 1')).toBeTruthy();
      expect(getByText('Great remedy!')).toBeTruthy();
      expect(getByText('User: Test User 2')).toBeTruthy();
      expect(getByText('Remedy: Test Remedy 2')).toBeTruthy();
      expect(getByText('Good remedy')).toBeTruthy();
    });
  });

  it('shows loading state while fetching reviews', () => {
    (adminApi.getAllReviews as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    const { getByTestId } = render(<AdminReviewManagementScreen />);
    
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });

  it('shows no reviews message when there are no reviews', async () => {
    (adminApi.getAllReviews as jest.Mock).mockResolvedValue([]);
    
    const { getByText } = render(<AdminReviewManagementScreen />);
    
    await waitFor(() => {
      expect(getByText('No reviews found.')).toBeTruthy();
    });
  });

  it('approves review successfully', async () => {
    const { getByTestId } = render(<AdminReviewManagementScreen />);
    
    await waitFor(() => {
      expect(getByTestId('approve-review-1')).toBeTruthy();
    });

    fireEvent.press(getByTestId('approve-review-1'));

    await waitFor(() => {
      expect(adminApi.updateReviewStatus).toHaveBeenCalledWith('1', 'approved');
    });
  });

  it('flags review successfully', async () => {
    const { getByTestId } = render(<AdminReviewManagementScreen />);
    
    await waitFor(() => {
      expect(getByTestId('reject-review-1')).toBeTruthy();
    });

    fireEvent.press(getByTestId('reject-review-1'));

    await waitFor(() => {
      expect(adminApi.updateReviewStatus).toHaveBeenCalledWith('1', 'flagged');
    });
  });

  it('disables approve button for approved reviews', async () => {
    const mockReviewsWithApproved = [
      {
        _id: '1',
        userId: {
          _id: 'user1',
          name: 'Test User 1'
        },
        remedyId: {
          _id: 'remedy1',
          name: 'Test Remedy 1'
        },
        rating: 4,
        content: 'Great remedy!',
        status: 'approved',
        createdAt: '2024-01-01'
      },
      {
        _id: '2',
        userId: {
          _id: 'user2',
          name: 'Test User 2'
        },
        remedyId: {
          _id: 'remedy2',
          name: 'Test Remedy 2'
        },
        rating: 3,
        content: 'Good remedy',
        status: 'flagged',
        createdAt: '2024-01-02'
      }
    ];

    (adminApi.getAllReviews as jest.Mock).mockResolvedValue(mockReviewsWithApproved);
    
    const { getByTestId } = render(<AdminReviewManagementScreen />);
    
    await waitFor(() => {
      const approveButton = getByTestId('approve-review-1');
      expect(approveButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  it('disables reject button for flagged reviews', async () => {
    const { getByTestId } = render(<AdminReviewManagementScreen />);
    
    await waitFor(() => {
      const rejectButton = getByTestId('reject-review-2');
      expect(rejectButton.props.accessibilityState.disabled).toBe(true);
    });
  });
}); 