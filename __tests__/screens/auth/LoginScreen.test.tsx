import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../../../screens/auth/LoginScreen';
import { useAuthStore } from '../../../store/authStore';
import { Alert, ActivityIndicator } from 'react-native';

// Mock the auth store
jest.mock('../../../store/authStore', () => ({
  useAuthStore: jest.fn()
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock navigation
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Screen: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }),
}));

const mockNavigation = {
  navigate: jest.fn()
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

const mockRoute = {
  key: 'Login',
  name: 'Login' as const
} as const;

const renderLoginScreen = () => {
  return render(
    <NavigationContainer>
      <LoginScreen navigation={mockNavigation as any} route={mockRoute as any} />
    </NavigationContainer>
  );
};

describe('LoginScreen', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the auth store implementation
    (useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
      login: jest.fn(),
      isLoading: false,
      error: null,
      clearError: jest.fn()
    }));
  });

  it('renders login form correctly', () => {
    const { getByPlaceholderText, getByText } = renderLoginScreen();

    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText('Don\'t have an account?')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('shows validation errors for empty fields', async () => {
    const { getByText } = renderLoginScreen();

    // Try to submit without entering any data
    fireEvent.press(getByText('Sign In'));

    // Check for validation messages
    await waitFor(() => {
      expect(getByText('Email is required')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
    });
  });

  it('shows validation error for invalid email', async () => {
    const { getByText, getByPlaceholderText } = renderLoginScreen();

    // Enter invalid email
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'invalid-email');

    // Try to submit
    fireEvent.press(getByText('Sign In'));

    // Check for validation message
    await waitFor(() => {
      expect(getByText('Invalid email address')).toBeTruthy();
    });
  });

  it('calls login function with form data', async () => {
    const mockLogin = jest.fn();
    (useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: jest.fn()
    }));

    const { getByText, getByPlaceholderText } = renderLoginScreen();

    // Enter valid data
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');

    // Submit form
    fireEvent.press(getByText('Sign In'));

    // Check if login was called with correct data
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('shows loading state during login', () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
      login: jest.fn(),
      isLoading: true,
      error: null,
      clearError: jest.fn()
    }));

    const { getByText } = renderLoginScreen();
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('shows error alert when login fails', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Login failed'));
    (useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: jest.fn()
    }));

    const { getByText, getByPlaceholderText } = renderLoginScreen();

    // Enter valid data
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');

    // Submit form
    fireEvent.press(getByText('Sign In'));

    // Check if error alert was shown
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Failed',
        'Login failed'
      );
    });
  });

  it('navigates to register screen', () => {
    const { getByText } = renderLoginScreen();
    fireEvent.press(getByText('Sign Up'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
  });
}); 