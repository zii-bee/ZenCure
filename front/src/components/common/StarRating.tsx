// src/components/common/StarRating.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  color?: string;
  onRatingChange?: (rating: number) => void;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 20,
  color = '#FFD700',
  onRatingChange,
  disabled = false,
}) => {
  const handlePress = (index: number) => {
    if (!disabled && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <View className="flex-row">
      {[...Array(maxRating)].map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handlePress(index)}
          disabled={disabled || !onRatingChange}
        >
          <Ionicons
            name={index < Math.floor(rating) ? 'star' : (index < rating ? 'star-half' : 'star-outline')}
            size={size}
            color={color}
            style={{ marginRight: 2 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default StarRating;