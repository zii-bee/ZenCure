import { StyleSheet } from 'react-native';

// Define common colors
export const colors = {
  primary: {
    light: '#60A5FA',
    default: '#3B82F6',
    dark: '#2563EB',
  },
  secondary: {
    light: '#10B981',
    default: '#059669',
    dark: '#047857',
  },
  background: {
    light: '#F9FAFB',
    default: '#F3F4F6',
    dark: '#E5E7EB',
  },
  text: {
    dark: '#1F2937',
    medium: '#4B5563',
    light: '#9CA3AF',
  },
  gray: {
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
  }
};

// Common styles that can be reused
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  section: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.dark,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 16,
    color: colors.text.medium,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary.default,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  error: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
});