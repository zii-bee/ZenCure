// src/screens/home/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Remedy } from '../../types';
import * as remedyApi from '../../api/remedies';
import Card from '../../components/common/Card';
import StarRating from '../../components/common/StarRating';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchRemedies = async (pageNum = 1, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else if (pageNum === 1) {
      setLoading(true);
    }

    try {
      const response = await remedyApi.getRemedies(pageNum);
      const newRemedies = response.remedies || [];
      
      if (pageNum === 1 || refresh) {
        setRemedies(newRemedies);
      } else {
        setRemedies(prev => [...prev, ...newRemedies]);
      }
      
      setHasMore(newRemedies.length > 0 && pageNum < response.pages);
      setPage(pageNum);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load remedies');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRemedies();
  }, []);

  const handleRefresh = () => {
    fetchRemedies(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchRemedies(page + 1);
    }
  };

  const renderRemedyItem = ({ item }: { item: Remedy }) => (
    <Card
      onPress={() => navigation.navigate('RemedyDetail', { id: item._id })}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
          <View className="flex-row items-center mt-1">
            <StarRating rating={item.avgRating} size={16} disabled />
            <Text className="ml-2 text-gray-600">
              ({item.reviewCount} {item.reviewCount === 1 ? 'review' : 'reviews'})
            </Text>
          </View>
        </View>
        {item.verified && (
          <Badge text="Verified" variant="success" />
        )}
      </View>
      
      <Text 
        className="text-gray-600 mt-2" 
        numberOfLines={2}
      >
        {item.description}
      </Text>
      
      <View className="flex-row flex-wrap mt-3">
        {item.categories.slice(0, 3).map((category, index) => (
          <Badge 
            key={index} 
            text={category} 
            variant="secondary" 
            className="mr-2 mb-2" 
          />
        ))}
        {item.categories.length > 3 && (
          <Badge 
            text={`+${item.categories.length - 3}`} 
            variant="secondary" 
            className="mr-2 mb-2" 
          />
        )}
      </View>
    </Card>
  );

  if (loading && page === 1) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error && remedies.length === 0) {
    return (
      <EmptyState
        title="Something went wrong"
        message={error}
        icon="alert-circle-outline"
        buttonText="Try Again"
        onButtonPress={handleRefresh}
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={remedies}
        renderItem={renderRemedyItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <EmptyState
            title="No remedies found"
            message="Try refreshing or check back later"
            icon="leaf-outline"
            buttonText="Refresh"
            onButtonPress={handleRefresh}
          />
        }
        ListFooterComponent={
          hasMore ? (
            <ActivityIndicator 
              size="small" 
              color="#4CAF50" 
              style={{ marginVertical: 16 }} 
            />
          ) : null
        }
      />
    </View>
  );
};

export default HomeScreen;