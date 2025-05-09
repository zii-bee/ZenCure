import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../../types';
import AdminDashboardScreen from '../../../screens/admin/AdminDashboardScreen';

type AdminDashboardScreenProps = NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>;

describe('AdminDashboardScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders admin dashboard correctly', () => {
    const { getByText } = render(
      <AdminDashboardScreen
        navigation={mockNavigation as any}
        route={{} as any}
      />
    );

    expect(getByText('Admin Dashboard')).toBeTruthy();
    expect(getByText('Manage ZenCure content and users')).toBeTruthy();
  });

  it('renders all admin options', () => {
    const { getByText } = render(
      <AdminDashboardScreen
        navigation={mockNavigation as any}
        route={{} as any}
      />
    );

    expect(getByText('User Management')).toBeTruthy();
    expect(getByText('Add New Remedy')).toBeTruthy();
    expect(getByText('Add New Source')).toBeTruthy();
    expect(getByText('Review Management')).toBeTruthy();
    expect(getByText('Comment Moderation')).toBeTruthy();
  });

  it('navigates to user management', () => {
    const { getByText } = render(
      <AdminDashboardScreen
        navigation={mockNavigation as any}
        route={{} as any}
      />
    );

    fireEvent.press(getByText('User Management'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AdminUserManagement');
  });

  it('navigates to create remedy', () => {
    const { getByText } = render(
      <AdminDashboardScreen
        navigation={mockNavigation as any}
        route={{} as any}
      />
    );

    fireEvent.press(getByText('Add New Remedy'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AdminCreateRemedy');
  });

  it('navigates to create source', () => {
    const { getByText } = render(
      <AdminDashboardScreen
        navigation={mockNavigation as any}
        route={{} as any}
      />
    );

    fireEvent.press(getByText('Add New Source'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AdminCreateSource');
  });

  it('navigates to review management', () => {
    const { getByText } = render(
      <AdminDashboardScreen
        navigation={mockNavigation as any}
        route={{} as any}
      />
    );

    fireEvent.press(getByText('Review Management'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AdminReviewManagement');
  });

  it('navigates to comment moderation', () => {
    const { getByText } = render(
      <AdminDashboardScreen
        navigation={mockNavigation as any}
        route={{} as any}
      />
    );

    fireEvent.press(getByText('Comment Moderation'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AdminCommentManagement');
  });

  it('displays admin privileges information', () => {
    const { getByText } = render(
      <AdminDashboardScreen
        navigation={mockNavigation as any}
        route={{} as any}
      />
    );

    expect(getByText('Admin Privileges')).toBeTruthy();
    expect(getByText(/As an admin, you have full access to manage users/)).toBeTruthy();
  });
}); 