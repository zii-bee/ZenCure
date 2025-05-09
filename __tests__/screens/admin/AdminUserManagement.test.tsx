// Add setImmediate polyfill
(global as any).setImmediate = (callback: () => void) => setTimeout(callback, 0);

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AdminUserManagementScreen from '../../../screens/admin/AdminUserManagementScreen';
import * as adminApi from '../../../api/admin';

// Mock the Card component
jest.mock('../../../components/common/Card', () => 'Card');

// Mock the admin API
jest.mock('../../../api/admin', () => ({
  getAllUsers: jest.fn(),
  updateUserRole: jest.fn()
}));

describe('AdminUserManagementScreen', () => {
  const mockUsers = [
    { _id: '1', name: 'User One', email: 'user1@example.com', role: 'user' },
    { _id: '2', name: 'User Two', email: 'user2@example.com', role: 'moderator' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (adminApi.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);
    (adminApi.updateUserRole as jest.Mock).mockResolvedValue({ success: true });
  });

  it('renders user management screen correctly', async () => {
    const { getByText, getByTestId } = render(<AdminUserManagementScreen />);
    
    // First check loading state
    expect(getByTestId('loading-indicator')).toBeTruthy();
    
    // Wait for data to load
    await waitFor(() => {
      expect(getByText('User Management')).toBeTruthy();
    }, { timeout: 3000 });

    // Check if users are rendered
    expect(getByText('User One')).toBeTruthy();
    expect(getByText('User Two')).toBeTruthy();
  });

  it('loads and displays users', async () => {
    const { getByText, getByTestId } = render(<AdminUserManagementScreen />);
    
    // First check loading state
    expect(getByTestId('loading-indicator')).toBeTruthy();
    
    // Wait for data to load
    await waitFor(() => {
      expect(adminApi.getAllUsers).toHaveBeenCalled();
      expect(getByText('user1@example.com')).toBeTruthy();
    }, { timeout: 3000 });

    expect(getByText('user2@example.com')).toBeTruthy();
  });

  it('shows loading state while fetching users', () => {
    const { getByTestId } = render(<AdminUserManagementScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('shows error state when user fetch fails', async () => {
    const mockAlert = jest.spyOn(Alert, 'alert');
    (adminApi.getAllUsers as jest.Mock).mockRejectedValue(new Error('Failed to load users'));

    render(<AdminUserManagementScreen />);
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Error', 'Failed to load users');
    }, { timeout: 3000 });
  });

  it('updates user role successfully', async () => {
    const mockAlert = jest.spyOn(Alert, 'alert');
    const { getByText } = render(<AdminUserManagementScreen />);

    // Wait for data to load
    await waitFor(() => {
      expect(getByText('User One')).toBeTruthy();
    }, { timeout: 3000 });

    // Click on the current role to change it
    fireEvent.press(getByText('User'));
    
    await waitFor(() => {
      expect(adminApi.updateUserRole).toHaveBeenCalledWith('1', 'moderator');
      expect(mockAlert).toHaveBeenCalledWith('Success', 'User role updated to moderator');
    }, { timeout: 3000 });
  });

  it('handles role update failure', async () => {
    const mockAlert = jest.spyOn(Alert, 'alert');
    (adminApi.updateUserRole as jest.Mock).mockRejectedValue(new Error('Failed to update role'));

    const { getByText } = render(<AdminUserManagementScreen />);

    await waitFor(() => {
      expect(getByText('User One')).toBeTruthy();
    }, { timeout: 3000 });

    // Click on the current role to change it
    fireEvent.press(getByText('User'));
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Error', 'Failed to update role');
    }, { timeout: 3000 });
  });

  it('shows empty state when no users', async () => {
    (adminApi.getAllUsers as jest.Mock).mockResolvedValue([]);

    const { getByText, getByTestId } = render(<AdminUserManagementScreen />);

    // First check loading state
    expect(getByTestId('loading-indicator')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('No users found')).toBeTruthy();
    }, { timeout: 3000 });
  });
}); 