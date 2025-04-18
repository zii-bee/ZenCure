// src/screens/remedies/ReviewDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types';
import { Review, Comment } from '../../types';
import * as reviewApi from '../../api/reviews';
import * as commentApi from '../../api/comments';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/common/Card';
import StarRating from '../../components/common/StarRating';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

type ReviewDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'ReviewDetail'>;

const ReviewDetailScreen: React.FC<ReviewDetailScreenProps> = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useAuthStore();
  const [review, setReview] = useState<Review | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviewDetails = async () => {
      try {
        const reviewData = await reviewApi.getReviewById(id);
        setReview(reviewData);
      } catch (err: any) {
        setError(err.message || 'Failed to load review details');
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const commentsData = await commentApi.getCommentsByReviewId(id);
        setComments(commentsData.comments || []);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchReviewDetails();
    fetchComments();
  }, [id]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Comment cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      const comment = await commentApi.createComment(id, newComment.trim());
      setComments(prevComments => [comment, ...prevComments]);
      setNewComment('');
      Alert.alert('Success', 'Your comment has been submitted for moderation');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async () => {
    if (!review) return;
    
    try {
      const updatedReview = await reviewApi.markReviewHelpful(id);
      setReview(prev => prev ? {...prev, helpfulCount: updatedReview.helpfulCount} : null);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark review as helpful');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentApi.deleteComment(commentId);
      setComments(prevComments => prevComments.filter(c => c._id !== commentId));
      Alert.alert('Success', 'Comment deleted successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error || !review) {
    return (
      <EmptyState
        title="Something went wrong"
        message={error || 'Failed to load review details'}
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
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <Text className="text-xl font-bold text-gray-800">{review.title}</Text>
              <Text className="text-gray-600">
                by {typeof review.userId === 'object' ? review.userId.name : 'Anonymous'}
              </Text>
              <Text className="text-gray-500 text-xs">
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <StarRating rating={review.rating} size={20} disabled />
          </View>
          
          <Text className="text-gray-700 mt-3 mb-4">{review.content}</Text>
          
          <View className="flex-row flex-wrap mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-gray-600 text-sm">Effectiveness</Text>
              <StarRating rating={review.effectiveness} size={16} disabled />
            </View>
            <View className="flex-1 mr-2">
              <Text className="text-gray-600 text-sm">Side Effects</Text>
              <StarRating rating={review.sideEffects} size={16} disabled />
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 text-sm">Ease of Use</Text>
              <StarRating rating={review.ease} size={16} disabled />
            </View>
          </View>
          
          <View className="flex-row justify-between items-center py-2 border-t border-b border-gray-200">
            <Text className="text-gray-600">
              {review.helpfulCount} {review.helpfulCount === 1 ? 'person' : 'people'} found this helpful
            </Text>
            <Button
              title="Helpful"
              onPress={handleMarkHelpful}
              variant="outline"
            />
          </View>
        </View>
        
        <View className="mb-4">
          <Text className="text-xl font-bold text-gray-800 mb-3">Comments</Text>
          
          {user ? (
            <View className="mb-4">
              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-2 min-h-10 bg-white"
                placeholder="Write a comment..."
                multiline
                value={newComment}
                onChangeText={setNewComment}
              />
              <Button
                title={submitting ? 'Submitting...' : 'Submit Comment'}
                onPress={handleSubmitComment}
                disabled={submitting || !newComment.trim()}
                loading={submitting}
              />
            </View>
          ) : (
            <Card className="mb-4">
              <Text className="text-gray-600 text-center">
                Please log in to leave a comment
              </Text>
            </Card>
          )}
          
          {commentsLoading ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#4CAF50" />
            </View>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <Card key={comment._id} className="mb-3">
                <View className="flex-row justify-between items-start">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-2">
                      <Text className="font-bold text-green-800">
                        {typeof comment.userId === 'object' 
                          ? comment.userId.name.charAt(0).toUpperCase() 
                          : 'A'}
                      </Text>
                    </View>
                    <View>
                      <Text className="font-bold text-gray-800">
                        {typeof comment.userId === 'object' ? comment.userId.name : 'Anonymous'}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  {user && typeof comment.userId === 'object' && comment.userId._id === user._id && (
                    <TouchableOpacity 
                      onPress={() => handleDeleteComment(comment._id)}
                      className="p-2"
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <Text className="text-gray-700 mt-2">{comment.content}</Text>
                
                <View className="flex-row justify-end items-center mt-2">
                  <Text className="text-gray-500 text-xs mr-2">
                    {comment.helpfulCount} found helpful
                  </Text>
                  <TouchableOpacity 
                    className="flex-row items-center" 
                    onPress={async () => {
                      try {
                        const updatedComment = await commentApi.markCommentHelpful(comment._id);
                        setComments(prevComments => 
                          prevComments.map(c => 
                            c._id === comment._id ? {...c, helpfulCount: updatedComment.helpfulCount} : c
                          )
                        );
                      } catch (err: any) {
                        Alert.alert('Error', err.message || 'Failed to mark comment as helpful');
                      }
                    }}
                  >
                    <Ionicons name="thumbs-up-outline" size={16} color="#4CAF50" />
                    <Text className="text-green-600 ml-1 text-sm">Helpful</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          ) : (
            <Text className="text-gray-600 text-center py-4">
              No comments yet. Be the first to comment!
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ReviewDetailScreen;