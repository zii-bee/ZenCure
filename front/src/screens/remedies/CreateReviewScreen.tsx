// src/screens/remedies/CreateReviewScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TextInput,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { RootStackParamList } from '../../types';
import { CreateReviewData } from '../../types';
import * as reviewApi from '../../api/reviews';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import StarRating from '../../components/common/StarRating';

type CreateReviewScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateReview'>;

const CreateReviewScreen: React.FC<CreateReviewScreenProps> = ({ route, navigation }) => {
  const { remedyId } = route.params;
  const [submitting, setSubmitting] = useState(false);
  
  const { control, handleSubmit, setValue, formState: { errors }, watch } = useForm<CreateReviewData>({
    defaultValues: {
      rating: 0,
      title: '',
      content: '',
      effectiveness: 0,
      sideEffects: 0,
      ease: 0,
    },
  });

  const watchedRating = watch('rating');
  const watchedEffectiveness = watch('effectiveness');
  const watchedSideEffects = watch('sideEffects');
  const watchedEase = watch('ease');

  const onSubmit = async (data: CreateReviewData) => {
    if (data.rating === 0 || data.effectiveness === 0 || data.sideEffects === 0 || data.ease === 0) {
      Alert.alert('Error', 'Please provide ratings for all categories');
      return;
    }

    setSubmitting(true);
    try {
      await reviewApi.createReview(remedyId, data);
      Alert.alert(
        'Success',
        'Your review has been submitted for moderation.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to submit review';
      Alert.alert('Error', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-800 mb-4">Write Your Review</Text>
        
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Overall Rating</Text>
          <Controller
            control={control}
            name="rating"
            rules={{ validate: value => value > 0 || 'Please provide an overall rating' }}
            render={({ field }) => (
              <View>
                <StarRating
                  rating={field.value}
                  onRatingChange={(rating) => setValue('rating', rating)}
                  size={32}
                  color="#FFD700"
                />
                {errors.rating && (
                  <Text className="text-red-500 text-xs mt-1">{errors.rating.message}</Text>
                )}
              </View>
            )}
          />
        </View>
        
        <Controller
          control={control}
          name="title"
          rules={{
            required: 'Title is required',
            minLength: {
              value: 3,
              message: 'Title must be at least 3 characters',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Review Title"
              placeholder="Summarize your experience"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.title?.message}
            />
          )}
        />
        
        <Controller
          control={control}
          name="content"
          rules={{
            required: 'Review content is required',
            minLength: {
              value: 10,
              message: 'Review must be at least 10 characters',
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">Review</Text>
              <TextInput
                className={`border ${errors.content ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 min-h-32 bg-white`}
                placeholder="Share your experience with this remedy..."
                multiline
                numberOfLines={6}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              {errors.content && (
                <Text className="text-red-500 text-xs mt-1">{errors.content.message}</Text>
              )}
            </View>
          )}
        />
        
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-3">Effectiveness</Text>
          <Controller
            control={control}
            name="effectiveness"
            rules={{ validate: value => value > 0 || 'Please rate effectiveness' }}
            render={({ field }) => (
              <View>
                <StarRating
                  rating={field.value}
                  onRatingChange={(rating) => setValue('effectiveness', rating)}
                  size={24}
                />
                {errors.effectiveness && (
                  <Text className="text-red-500 text-xs mt-1">{errors.effectiveness.message}</Text>
                )}
              </View>
            )}
          />
        </View>
        
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-3">Side Effects (1=severe, 5=none)</Text>
          <Controller
            control={control}
            name="sideEffects"
            rules={{ validate: value => value > 0 || 'Please rate side effects' }}
            render={({ field }) => (
              <View>
                <StarRating
                  rating={field.value}
                  onRatingChange={(rating) => setValue('sideEffects', rating)}
                  size={24}
                />
                {errors.sideEffects && (
                  <Text className="text-red-500 text-xs mt-1">{errors.sideEffects.message}</Text>
                )}
              </View>
            )}
          />
        </View>
        
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-3">Ease of Use</Text>
          <Controller
            control={control}
            name="ease"
            rules={{ validate: value => value > 0 || 'Please rate ease of use' }}
            render={({ field }) => (
              <View>
                <StarRating
                  rating={field.value}
                  onRatingChange={(rating) => setValue('ease', rating)}
                  size={24}
                />
                {errors.ease && (
                  <Text className="text-red-500 text-xs mt-1">{errors.ease.message}</Text>
                )}
              </View>
            )}
          />
        </View>
        
        <Button
          title={submitting ? 'Submitting...' : 'Submit Review'}
          onPress={handleSubmit(onSubmit)}
          fullWidth
          loading={submitting}
        />
      </View>
    </ScrollView>
  );
};

export default CreateReviewScreen;