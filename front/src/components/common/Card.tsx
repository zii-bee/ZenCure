// src/components/common/Card.tsx
import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CardProps {
  children: ReactNode;
  title?: string;
  onPress?: () => void;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  onPress,
  className = '',
  headerClassName = '',
  bodyClassName = '',
}) => {
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      onPress={onPress}
      className={`bg-white rounded-lg shadow-md overflow-hidden mb-4 ${className}`}
    >
      {title && (
        <View className={`border-b border-gray-200 px-4 py-3 ${headerClassName}`}>
          <Text className="font-bold text-lg">{title}</Text>
        </View>
      )}
      <View className={`p-4 ${bodyClassName}`}>{children}</View>
    </CardWrapper>
  );
};

export default Card;