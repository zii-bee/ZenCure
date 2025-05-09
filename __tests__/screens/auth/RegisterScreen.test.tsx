import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from '../../../screens/auth/RegisterScreen';
import { useAuthStore } from '../../../store/authStore';
import { RootStackParamList } from '../../../types';
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
  key: 'Register',
  name: 'Register' as const
} as const;

const renderRegisterScreen = () => {
  return render(
    <NavigationContainer>
      <RegisterScreen navigation={mockNavigation as any} route={mockRoute as any} />
    </NavigationContainer>
  );
};

describe('RegisterScreen', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the auth store implementation
    (useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
      register: jest.fn(),
      isLoading: false,
      error: null,
      clearError: jest.fn()
    }));
  });

  it('renders registration form correctly', () => {
    const { getByPlaceholderText, getByText } = renderRegisterScreen();

    expect(getByPlaceholderText('Enter your full name')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Create a password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm your password')).toBeTruthy();
    expect(getByText('Create Account')).toBeTruthy();
    expect(getByText('Already have an account?')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('shows validation errors for empty fields', async () => {
    const { getByText } = renderRegisterScreen();

    // Try to submit without entering any data
    fireEvent.press(getByText('Create Account'));

    // Check for validation messages
    await waitFor(() => {
      expect(getByText('Name is required')).toBeTruthy();
      expect(getByText('Email is required')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
      expect(getByText('Please confirm your password')).toBeTruthy();
    });
  });

  it('shows validation error for invalid email', async () => {
    const { getByText, getByPlaceholderText } = renderRegisterScreen();

    // Enter invalid email
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'invalid-email');

    // Try to submit
    fireEvent.press(getByText('Create Account'));

    // Check for validation message
    await waitFor(() => {
      expect(getByText('Invalid email address')).toBeTruthy();
    });
  });

  it('shows validation error for short password', async () => {
    const { getByText, getByPlaceholderText } = renderRegisterScreen();

    // Enter short password
    fireEvent.changeText(getByPlaceholderText('Create a password'), '123');

    // Try to submit
    fireEvent.press(getByText('Create Account'));

    // Check for validation message
    await waitFor(() => {
      expect(getByText('Password must be at least 6 characters')).toBeTruthy();
    });
  });

  it('shows error when passwords do not match', async () => {
    const { getByText, getByPlaceholderText } = renderRegisterScreen();

    // Enter different passwords
    fireEvent.changeText(getByPlaceholderText('Create a password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'password456');

    // Try to submit
    fireEvent.press(getByText('Create Account'));

    // Check for error message
    await waitFor(() => {
      expect(getByText('Passwords do not match')).toBeTruthy();
    });
  });

  it('calls register function with form data', async () => {
    const mockRegister = jest.fn();
    (useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
      register: mockRegister,
      isLoading: false,
      error: null,
      clearError: jest.fn()
    }));

    const { getByText, getByPlaceholderText } = renderRegisterScreen();

    // Enter valid data
    fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Create a password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'password123');

    // Submit form
    fireEvent.press(getByText('Create Account'));

    // Check if register was called with correct data
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('shows loading state during registration', () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
      register: jest.fn(),
      isLoading: true,
      error: null,
      clearError: jest.fn()
    }));

    const { UNSAFE_getByType } = renderRegisterScreen();
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('shows error alert when registration fails', async () => {
    const mockRegister = jest.fn().mockRejectedValue(new Error('Registration failed'));
    (useAuthStore as unknown as jest.Mock).mockImplementation(() => ({
      register: mockRegister,
      isLoading: false,
      error: null,
      clearError: jest.fn()
    }));

    const { getByText, getByPlaceholderText } = renderRegisterScreen();

    // Enter valid data
    fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Create a password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'password123');

    // Submit form
    fireEvent.press(getByText('Create Account'));

    // Check if error alert was shown
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Registration Failed',
        'Registration failed'
      );
    });
  });

  it('toggles password visibility', () => {
    const { getByText, getByPlaceholderText } = renderRegisterScreen();

    // Initially passwords should be hidden
    expect(getByPlaceholderText('Create a password').props.secureTextEntry).toBe(true);
    expect(getByPlaceholderText('Confirm your password').props.secureTextEntry).toBe(true);

    // Toggle password visibility
    fireEvent.press(getByText('Show Password'));

    // Passwords should be visible
    expect(getByPlaceholderText('Create a password').props.secureTextEntry).toBe(false);
    expect(getByPlaceholderText('Confirm your password').props.secureTextEntry).toBe(false);

    // Toggle back
    fireEvent.press(getByText('Hide Password'));

    // Passwords should be hidden again
    expect(getByPlaceholderText('Create a password').props.secureTextEntry).toBe(true);
    expect(getByPlaceholderText('Confirm your password').props.secureTextEntry).toBe(true);
  });

  it('navigates to login screen', () => {
    const { getByText } = renderRegisterScreen();
    fireEvent.press(getByText('Sign In'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });
}); 