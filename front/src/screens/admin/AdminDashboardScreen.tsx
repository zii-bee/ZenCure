import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../types';
import Card from '../../components/common/Card';

type AdminDashboardScreenProps = NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>;

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const adminOptions = [
    {
      title: 'User Management',
      description: 'View and manage user roles and permissions',
      icon: 'people',
      screen: 'AdminUserManagement'
    },
    {
      title: 'Add New Remedy',
      description: 'Create a new naturopathic remedy',
      icon: 'leaf',
      screen: 'AdminCreateRemedy'
    },
    {
      title: 'Add New Source',
      description: 'Add a new source reference',
      icon: 'document-text',
      screen: 'AdminCreateSource'
    }
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</Text>
          <Text className="text-gray-600">Manage ZenCure content and users</Text>
        </View>

        {adminOptions.map((option, index) => (
          <TouchableOpacity 
            key={index}
            onPress={() => navigation.navigate(option.screen as any)}
            className="mb-4"
          >
            <Card>
              <View className="flex-row items-center">
                <View className="bg-green-100 p-3 rounded-full mr-4">
                  <Ionicons name={option.icon as any} size={28} color="#4CAF50" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">{option.title}</Text>
                  <Text className="text-gray-600">{option.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#4CAF50" />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
        
        <Card className="mt-4 bg-yellow-50">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={24} color="#F59E0B" style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Text className="font-bold text-gray-800 mb-1">Admin Privileges</Text>
              <Text className="text-gray-700">
                As an admin, you have full access to manage users, create content, and moderate the platform. 
                Please use these privileges responsibly.
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

export default AdminDashboardScreen;