// AdminReviewManagementScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import * as adminApi from '../../api/admin';
import axios from 'axios';
import { Review } from '../../types';


const AdminReviewScreen: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    
    try {
      
      const data = await adminApi.getAllReviews();
      setReviews(data);
      
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'flagged') => {
    try {
      await adminApi.updateReviewStatus(id, status);
      setReviews(prev =>
        prev.map(review =>
          review._id === id ? { ...review, status } : review
        )
      );
    } catch (err) {
      console.error('Failed to update review status:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Manage Reviews</Text>
      {reviews.length === 0 ? (
        <Text>No reviews found.</Text>
      ) : (
        reviews.map((review) => (
    
          <View key={review._id} style={styles.card}>
            <Text style={styles.label}>Content:</Text>
            <Text>{review.content}</Text>
            <Text style={styles.label}>User: {review.userId.name}</Text>
            <Text style={styles.label}>Remedy: {review.remedyId.name}</Text>
            <Text style={styles.label}>Status: {review.status}</Text>
            <View style={styles.buttonRow}>
              <Button
                title="Approve"
                color="#4CAF50"
                disabled={review.status === 'approved'}
                onPress={() => handleStatusChange(review._id, 'approved')}
              />
              <Button
                title="Reject"
                color="#F44336"
                disabled={review.status === 'flagged'}
                onPress={() => handleStatusChange(review._id, 'flagged')}
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: { padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 12, borderColor: '#ccc' },
  label: { fontWeight: 'bold', marginTop: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});

export default AdminReviewScreen;
