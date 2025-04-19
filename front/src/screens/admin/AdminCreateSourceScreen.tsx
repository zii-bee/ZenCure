import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types';
import * as adminApi from '../../api/admin';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

type AdminCreateSourceScreenProps = NativeStackScreenProps<AdminStackParamList, 'AdminCreateSource'>;

const AdminCreateSourceScreen: React.FC<AdminCreateSourceScreenProps> = ({ navigation }) => {
  // Form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [credibilityScore, setCredibilityScore] = useState(7);
  const [publisher, setPublisher] = useState('');
  const [isPeerReviewed, setIsPeerReviewed] = useState(false);
  const [authorInput, setAuthorInput] = useState('');
  const [authors, setAuthors] = useState<string[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);

  const handleAddAuthor = () => {
    if (!authorInput.trim()) return;
    
    if (!authors.includes(authorInput.trim())) {
      setAuthors([...authors, authorInput.trim()]);
    }
    setAuthorInput('');
  };

  const removeAuthor = (index: number) => {
    const newAuthors = [...authors];
    newAuthors.splice(index, 1);
    setAuthors(newAuthors);
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Error', 'Source title is required');
      return false;
    }
    
    if (!url.trim()) {
      Alert.alert('Error', 'URL is required');
      return false;
    }
    
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      Alert.alert('Error', 'Please enter a valid URL');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const sourceData: adminApi.CreateSourceData = {
        title,
        url,
        credibilityScore,
        publisher: publisher.trim() || undefined,
        authors: authors.length > 0 ? authors : undefined,
        isPeerReviewed,
        publicationDate: new Date()
      };
      
      await adminApi.createSource(sourceData);
      
      Alert.alert(
        'Success',
        'Source created successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create source');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-800 mb-4">Add New Source</Text>
        
        {/* Basic Info Section */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-700 mb-2">Source Information</Text>
          
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Title *</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-2 bg-white"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Journal of Natural Medicine"
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">URL *</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-2 bg-white"
              value={url}
              onChangeText={setUrl}
              placeholder="e.g., https://example.com/journal"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Publisher</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-2 bg-white"
              value={publisher}
              onChangeText={setPublisher}
              placeholder="e.g., Academic Publishing Group"
            />
          </View>
        </Card>
        
        {/* Credibility Section */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-700 mb-2">Credibility</Text>
          
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Credibility Score: {credibilityScore}/10
            </Text>
            <View className="flex-row items-center">
              <Text className="mr-2">1</Text>
              <View className="flex-1 h-1 bg-gray-200 rounded-full">
                <View 
                  className="h-1 bg-green-600 rounded-full" 
                  style={{ width: `${(credibilityScore / 10) * 100}%` }} 
                />
              </View>
              <Text className="ml-2">10</Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <TouchableOpacity 
                className="p-2" 
                onPress={() => setCredibilityScore(Math.max(1, credibilityScore - 1))}
                disabled={credibilityScore <= 1}
              >
                <Ionicons 
                  name="remove-circle" 
                  size={24} 
                  color={credibilityScore <= 1 ? "#9CA3AF" : "#4CAF50"} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                className="p-2" 
                onPress={() => setCredibilityScore(Math.min(10, credibilityScore + 1))}
                disabled={credibilityScore >= 10}
              >
                <Ionicons 
                  name="add-circle" 
                  size={24} 
                  color={credibilityScore >= 10 ? "#9CA3AF" : "#4CAF50"} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-sm font-medium text-gray-700">Peer Reviewed</Text>
            <Switch
              value={isPeerReviewed}
              onValueChange={setIsPeerReviewed}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
            />
          </View>
        </Card>
        
        {/* Authors Section */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-700 mb-2">Authors (Optional)</Text>
          
          <View className="flex-row items-center mb-2">
            <TextInput
              className="flex-1 border border-gray-300 rounded-l-md p-2 bg-white"
              value={authorInput}
              onChangeText={setAuthorInput}
              placeholder="Add author name"
            />
            <TouchableOpacity
              className="bg-green-600 p-2 rounded-r-md"
              onPress={handleAddAuthor}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap">
            {authors.map((author, index) => (
              <View key={index} className="bg-blue-100 rounded-full px-3 py-1 m-1 flex-row items-center">
                <Text className="text-blue-800">{author}</Text>
                <TouchableOpacity
                  className="ml-1"
                  onPress={() => removeAuthor(index)}
                >
                  <Ionicons name="close-circle" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Card>
        
        <Button
          title={loading ? "Creating Source..." : "Create Source"}
          onPress={handleSubmit}
          fullWidth
          loading={loading}
          className="mb-8"
        />
      </View>
    </ScrollView>
  );
};

export default AdminCreateSourceScreen;