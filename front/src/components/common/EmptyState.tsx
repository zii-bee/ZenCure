// src/components/common/EmptyState.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = 'leaf-outline',
  buttonText,
  onButtonPress,
}) => {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <Ionicons name={icon as any} size={80} color="#9CA3AF" />
      <Text className="text-xl font-bold text-gray-700 mt-4 text-center">{title}</Text>
      {message && <Text className="text-gray-500 text-center mt-2">{message}</Text>}
      {buttonText && onButtonPress && (
        <View className="mt-6">
          <Button title={buttonText} onPress={onButtonPress} />
        </View>
      )}
    </View>
  );
};

export default EmptyState;