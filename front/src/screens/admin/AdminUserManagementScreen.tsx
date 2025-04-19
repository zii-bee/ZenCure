import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../types';
import * as adminApi from '../../api/admin';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const AdminUserManagementScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const roles = ['user', 'moderator', 'admin'];
    const currentIndex = roles.indexOf(currentRole);
    
    // Get next role in the cycle
    const nextRole = roles[(currentIndex + 1) % roles.length] as 'user' | 'moderator' | 'admin';
    
    try {
      const result = await adminApi.updateUserRole(userId, nextRole);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, role: nextRole } : user
        )
      );
      
      Alert.alert('Success', `User role updated to ${nextRole}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update user role');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge text="Admin" variant="primary" />;
      case 'moderator':
        return <Badge text="Moderator" variant="secondary" />;
      default:
        return <Badge text="User" variant="success" />;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-800 mb-4">User Management</Text>
        
        <Card className="bg-yellow-50 mb-4">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#F59E0B" style={{ marginRight: 10 }} />
            <Text className="text-gray-700 flex-1">
              Tap on a user's role to cycle between User, Moderator, and Admin roles.
            </Text>
          </View>
        </Card>
      </View>
      
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <Card className="mb-3">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="font-bold text-gray-800">{item.name}</Text>
                <Text className="text-gray-600 text-sm">{item.email}</Text>
                <Text className="text-gray-500 text-xs mt-1">
                  ID: {item._id}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => handleRoleChange(item._id, item.role)}
                className="p-1"
              >
                {getRoleBadge(item.role)}
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View className="py-4 items-center">
            <Text className="text-gray-600">No users found</Text>
          </View>
        }
        refreshing={loading}
        onRefresh={fetchUsers}
      />
    </View>
  );
};

export default AdminUserManagementScreen;