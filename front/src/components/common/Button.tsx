// src/components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return 'bg-green-600 border border-green-600';
      case 'secondary':
        return 'bg-blue-500 border border-blue-500';
      case 'outline':
        return 'bg-transparent border border-green-600';
      default:
        return 'bg-green-600 border border-green-600';
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return 'text-white';
      case 'outline':
        return 'text-green-600';
      default:
        return 'text-white';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`py-3 px-6 rounded-lg ${getButtonStyle()} ${
        disabled ? 'opacity-50' : 'opacity-100'
      } ${fullWidth ? 'w-full' : 'w-auto'} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#4CAF50' : 'white'} />
      ) : (
        <Text
          className={`text-center font-bold ${getTextStyle()}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;