import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ModeratorDashboardScreen from '../../../screens/moderator/ModeratorDashboardScreen';
import { ModeratorStackParamList } from '../../../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Mock the Card component
jest.mock('../../../components/common/Card', () => 'Card');

type Props = NativeStackScreenProps<ModeratorStackParamList, 'ModeratorDashboard'>;

describe('ModeratorDashboardScreen', () => {
  const mockNavigation = {
    navigate: jest.fn()
  };

  const mockRoute = {
    params: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders moderator dashboard correctly', () => {
    const { getByText } = render(
      <ModeratorDashboardScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );
    
    expect(getByText('Moderator Dashboard')).toBeTruthy();
    expect(getByText('Manage ZenCure content')).toBeTruthy();
  });

  it('renders all moderator options', () => {
    const { getByText } = render(
      <ModeratorDashboardScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );
    
    expect(getByText('Review Management')).toBeTruthy();
    expect(getByText('View and manage user reviews')).toBeTruthy();
    expect(getByText('Comment Moderation')).toBeTruthy();
    expect(getByText('View and manage user comments')).toBeTruthy();
  });

  it('navigates to review management', () => {
    const { getByText } = render(
      <ModeratorDashboardScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    fireEvent.press(getByText('Review Management'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AdminReviewManagement');
  });

  it('navigates to comment moderation', () => {
    const { getByText } = render(
      <ModeratorDashboardScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    fireEvent.press(getByText('Comment Moderation'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AdminCommentManagement');
  });

  it('displays moderator privileges information', () => {
    const { getByText } = render(
      <ModeratorDashboardScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );
    
    expect(getByText('Moderator Privileges')).toBeTruthy();
    expect(getByText(/As a moderator, you have full access to moderate the platform/)).toBeTruthy();
  });
}); 