// src/screens/profile/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import * as authApi from '../../api/auth';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const ProfileScreen: React.FC = () => {
  const { user, logout, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Health profile states
  const [allergiesInput, setAllergiesInput] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditionsInput, setConditionsInput] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [preferencesInput, setPreferencesInput] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAllergies(user.healthProfile?.allergies || []);
      setConditions(user.healthProfile?.conditions || []);
      setPreferences(user.healthProfile?.preferences || []);
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout() }
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await updateUser({
        name,
        email,
        healthProfile: {
          allergies,
          conditions,
          preferences
        }
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addItem = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, setInput: React.Dispatch<React.SetStateAction<string>>) => {
    if (!item.trim()) return;
    if (!list.includes(item.trim())) {
      setList([...list, item.trim()]);
    }
    setInput('');
  };

  const removeItem = (index: number, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    const newList = [...list];
    newList.splice(index, 1);
    setList(newList);
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-lg text-gray-600 mb-4">Please log in to view your profile</Text>
        <Button title="Login" onPress={() => logout()} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-2">
            <Text className="text-4xl font-bold text-green-800">{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          {!isEditing ? (
            <>
              <Text className="text-2xl font-bold text-gray-800">{user.name}</Text>
              <Text className="text-gray-600">{user.email}</Text>
              <Badge text={user.role.toUpperCase()} variant="primary" className="mt-2" />
            </>
          ) : (
            <Text className="text-xl font-bold text-gray-800">Edit Profile</Text>
          )}
        </View>
        
        {isEditing ? (
          <View>
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">Name</Text>
              <TextInput
                className="border border-gray-300 rounded-md p-2 bg-white"
                value={name}
                onChangeText={setName}
                placeholder="Your name"
              />
            </View>
            
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
              <TextInput
                className="border border-gray-300 rounded-md p-2 bg-white"
                value={email}
                onChangeText={setEmail}
                placeholder="Your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <Card title="Health Profile" className="mb-6">
              <View className="mb-4">
                <Text className="font-medium text-gray-700 mb-2">Allergies</Text>
                <View className="flex-row items-center mb-2">
                  <TextInput
                    className="flex-1 border border-gray-300 rounded-l-md p-2 bg-white"
                    value={allergiesInput}
                    onChangeText={setAllergiesInput}
                    placeholder="Add an allergy"
                  />
                  <TouchableOpacity
                    className="bg-green-600 p-2 rounded-r-md"
                    onPress={() => addItem(allergiesInput, allergies, setAllergies, setAllergiesInput)}
                  >
                    <Ionicons name="add" size={24} color="white" />
                  </TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap">
                  {allergies.map((allergy, index) => (
                    <View key={index} className="bg-red-100 rounded-full px-3 py-1 m-1 flex-row items-center">
                      <Text className="text-red-800">{allergy}</Text>
                      <TouchableOpacity
                        className="ml-1"
                        onPress={() => removeItem(index, allergies, setAllergies)}
                      >
                        <Ionicons name="close-circle" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
              
              <View className="mb-4">
                <Text className="font-medium text-gray-700 mb-2">Medical Conditions</Text>
                <View className="flex-row items-center mb-2">
                  <TextInput
                    className="flex-1 border border-gray-300 rounded-l-md p-2 bg-white"
                    value={conditionsInput}
                    onChangeText={setConditionsInput}
                    placeholder="Add a condition"
                  />
                  <TouchableOpacity
                    className="bg-green-600 p-2 rounded-r-md"
                    onPress={() => addItem(conditionsInput, conditions, setConditions, setConditionsInput)}
                  >
                    <Ionicons name="add" size={24} color="white" />
                  </TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap">
                  {conditions.map((condition, index) => (
                    <View key={index} className="bg-yellow-100 rounded-full px-3 py-1 m-1 flex-row items-center">
                      <Text className="text-yellow-800">{condition}</Text>
                      <TouchableOpacity
                        className="ml-1"
                        onPress={() => removeItem(index, conditions, setConditions)}
                      >
                        <Ionicons name="close-circle" size={16} color="#EAB308" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
              
              <View>
                <Text className="font-medium text-gray-700 mb-2">Preferences</Text>
                <View className="flex-row items-center mb-2">
                  <TextInput
                    className="flex-1 border border-gray-300 rounded-l-md p-2 bg-white"
                    value={preferencesInput}
                    onChangeText={setPreferencesInput}
                    placeholder="Add a preference"
                  />
                  <TouchableOpacity
                    className="bg-green-600 p-2 rounded-r-md"
                    onPress={() => addItem(preferencesInput, preferences, setPreferences, setPreferencesInput)}
                  >
                    <Ionicons name="add" size={24} color="white" />
                  </TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap">
                  {preferences.map((preference, index) => (
                    <View key={index} className="bg-blue-100 rounded-full px-3 py-1 m-1 flex-row items-center">
                      <Text className="text-blue-800">{preference}</Text>
                      <TouchableOpacity
                        className="ml-1"
                        onPress={() => removeItem(index, preferences, setPreferences)}
                      >
                        <Ionicons name="close-circle" size={16} color="#3B82F6" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
            
            <View className="flex-row justify-between mb-4">
              <Button
                title="Cancel"
                onPress={() => setIsEditing(false)}
                variant="outline"
                className="flex-1 mr-2"
              />
              <Button
                title={loading ? 'Saving...' : 'Save Changes'}
                onPress={handleSaveProfile}
                loading={loading}
                className="flex-1 ml-2"
              />
            </View>
          </View>
        ) : (
          <View>
            <Card title="Health Profile" className="mb-4">
              <View className="mb-4">
                <Text className="font-medium text-gray-700 mb-1">Allergies</Text>
                {allergies.length > 0 ? (
                  <View className="flex-row flex-wrap">
                    {allergies.map((allergy, index) => (
                      <Badge 
                        key={index} 
                        text={allergy} 
                        variant="danger" 
                        className="mr-2 mb-2" 
                      />
                    ))}
                  </View>
                ) : (
                  <Text className="text-gray-500">No allergies added</Text>
                )}
              </View>
              
              <View className="mb-4">
                <Text className="font-medium text-gray-700 mb-1">Medical Conditions</Text>
                {conditions.length > 0 ? (
                  <View className="flex-row flex-wrap">
                    {conditions.map((condition, index) => (
                      <Badge 
                        key={index} 
                        text={condition} 
                        variant="warning" 
                        className="mr-2 mb-2" 
                      />
                    ))}
                  </View>
                ) : (
                  <Text className="text-gray-500">No medical conditions added</Text>
                )}
              </View>
              
              <View>
                <Text className="font-medium text-gray-700 mb-1">Preferences</Text>
                {preferences.length > 0 ? (
                  <View className="flex-row flex-wrap">
                    {preferences.map((preference, index) => (
                      <Badge 
                        key={index} 
                        text={preference} 
                        variant="primary" 
                        className="mr-2 mb-2" 
                      />
                    ))}
                  </View>
                ) : (
                  <Text className="text-gray-500">No preferences added</Text>
                )}
              </View>
            </Card>
            
            <View className="mb-6">
              <Button
                title="Edit Profile"
                onPress={() => setIsEditing(true)}
                variant="primary"
                fullWidth
              />
            </View>
            
            <TouchableOpacity
              className="py-3 flex-row justify-center items-center"
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text className="text-red-500 font-medium ml-2">Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;