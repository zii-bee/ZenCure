// src/components/common/Badge.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  size = 'small',
  className = '',
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-100 text-blue-800';
      case 'secondary':
        return 'bg-gray-100 text-gray-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'danger':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return 'text-xs px-2 py-0.5';
      case 'medium':
        return 'text-sm px-2.5 py-1';
      case 'large':
        return 'text-base px-3 py-1.5';
      default:
        return 'text-xs px-2 py-0.5';
    }
  };

  return (
    <View
      className={`rounded-full ${getVariantStyle().split(' ')[0]} ${className}`}
    >
      <Text
        className={`font-medium ${getVariantStyle().split(' ')[1]} ${getSizeStyle()}`}
      >
        {text}
      </Text>
    </View>
  );
};

export default Badge;