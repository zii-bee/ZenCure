// src/screens/remedies/RemedyDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types';
import { Remedy, Review } from '../../types';
import * as remedyApi from '../../api/remedies';
import * as reviewApi from '../../api/reviews';
import Card from '../../components/common/Card';
import StarRating from '../../components/common/StarRating';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

type RemedyDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'RemedyDetail'>;

const RemedyDetailScreen: React.FC<RemedyDetailScreenProps> = ({ route, navigation }) => {
  const { id } = route.params;
  const [remedy, setRemedy] = useState<Remedy | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRemedyDetails = async () => {
      try {
        const remedyData = await remedyApi.getRemedyById(id);
        setRemedy(remedyData);
      } catch (err: any) {
        setError(err.message || 'Failed to load remedy details');
      } finally {
        setLoading(false);
      }
    };

    const fetchRemedyReviews = async () => {
      try {
        const reviewsData = await reviewApi.getReviewsByRemedyId(id);
        setReviews(reviewsData.reviews || []);
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchRemedyDetails();
    fetchRemedyReviews();
  }, [id]);

  const navigateToCreateReview = () => {
    navigation.navigate('CreateReview', { remedyId: id });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error || !remedy) {
    return (
      <EmptyState
        title="Something went wrong"
        message={error || 'Failed to load remedy details'}
        icon="alert-circle-outline"
        buttonText="Go Back"
        onButtonPress={() => navigation.goBack()}
      />
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-2xl font-bold text-gray-800">{remedy.name}</Text>
            {remedy.verified && (
              <Badge text="Verified" variant="success" />
            )}
          </View>
          
          <View className="flex-row items-center mb-2">
            <StarRating rating={remedy.avgRating} size={20} disabled />
            <Text className="ml-2 text-gray-600">
              ({remedy.reviewCount} {remedy.reviewCount === 1 ? 'review' : 'reviews'})
            </Text>
          </View>
          
          <View className="flex-row flex-wrap mb-4">
            {remedy.categories.map((category, index) => (
              <Badge 
                key={index} 
                text={category} 
                variant="secondary" 
                className="mr-2 mb-2" 
              />
            ))}
          </View>
          
          <Text className="text-gray-700 mb-4">{remedy.description}</Text>
          
          {remedy.warnings && remedy.warnings.length > 0 && (
            <Card className="bg-red-50 border border-red-100 shadow-none mb-4">
              <View className="flex-row items-start">
                <Ionicons name="warning-outline" size={24} color="#EF4444" />
                <View className="ml-2 flex-1">
                  <Text className="font-bold text-red-600 mb-1">Warnings</Text>
                  {remedy.warnings.map((warning, index) => (
                    <Text key={index} className="text-gray-700 mb-1">
                      • {warning}
                    </Text>
                  ))}
                </View>
              </View>
            </Card>
          )}
        </View>
        
        <View className="mb-4">
          <Text className="text-xl font-bold text-gray-800 mb-3">Symptoms Treated</Text>
          <View className="flex-row flex-wrap">
            {remedy.symptoms.map((symptom, index) => (
              <View key={index} className="mr-2 mb-2 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                <Text className="font-medium text-green-800">{symptom.name}</Text>
                <Text className="text-xs text-gray-500">
                  Relevance: {symptom.relevanceScore}/100
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-gray-800">Reviews</Text>
            <Button
              title="Write Review"
              onPress={navigateToCreateReview}
              variant="primary"
            />
          </View>
          
          {reviewsLoading ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#4CAF50" />
            </View>
          ) : reviews.length > 0 ? (
            <View>
              {reviews.slice(0, 3).map((review) => (
                <Card 
                  key={review._id}
                  onPress={() => navigation.navigate('ReviewDetail', { id: review._id })}
                >
                  <View className="flex-row justify-between items-start">
                    <View>
                      <Text className="font-bold text-gray-800">
                        {typeof review.userId === 'object' ? review.userId.name : 'Anonymous'}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <StarRating rating={review.rating} size={16} disabled />
                  </View>
                  
                  <Text className="font-medium text-gray-800 mt-2">{review.title}</Text>
                  <Text className="text-gray-600 mt-1" numberOfLines={3}>{review.content}</Text>
                  
                  <View className="flex-row justify-between items-center mt-3">
                    <View className="flex-row">
                      <Badge text={`Effectiveness: ${review.effectiveness}/5`} variant="primary" className="mr-2" />
                      <Badge text={`Ease: ${review.ease}/5`} variant="secondary" />
                    </View>
                    <Text className="text-gray-500 text-xs">
                      {review.helpfulCount} found helpful
                    </Text>
                  </View>
                </Card>
              ))}
              
              {reviews.length > 3 && (
                <TouchableOpacity className="items-center py-4">
                  <Text className="text-green-600 font-medium">
                    View all {reviews.length} reviews
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Card>
              <Text className="text-gray-600 text-center">No reviews yet. Be the first to review!</Text>
              <Button
                title="Write a Review"
                onPress={navigateToCreateReview}
                variant="outline"
                className="mt-3"
              />
            </Card>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default RemedyDetailScreen