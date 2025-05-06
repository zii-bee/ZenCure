import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import * as adminApi from '../../api/admin'; // Update with the correct import for your API
import { Comment } from '../../types'; // Adjust with the correct type for comments

const AdminCommentScreen: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const data = await adminApi.getAllComments(); // Update with the correct API call
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'flagged') => {
    try {
      await adminApi.updateCommentStatus(id, status); // Update with the correct API call
      setComments(prev =>
        prev.map(comment =>
          comment._id === id ? { ...comment, status } : comment
        )
      );
    } catch (err) {
      console.error('Failed to update comment status:', err);
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
      <Text style={styles.heading}>Manage Comments</Text>
      {comments.length === 0 ? (
        <Text>No comments found.</Text>
      ) : (
        comments.map((comment) => (
          <View key={comment._id} style={styles.card}>
            <Text style={styles.label}>Content:</Text>
            <Text>{comment.content}</Text>
            <Text style={styles.label}>User: {comment.userId.name}</Text>
            <Text style={styles.label}>Status: {comment.status}</Text>
            <View style={styles.buttonRow}>
              <Button
                title="Approve"
                color="#4CAF50"
                disabled={comment.status === 'approved'}
                onPress={() => handleStatusChange(comment._id, 'approved')}
              />
              <Button
                title="Reject"
                color="#F44336"
                disabled={comment.status === 'flagged'}
                onPress={() => handleStatusChange(comment._id, 'flagged')}
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

export default AdminCommentScreen;
