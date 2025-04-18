// src/screens/home/SearchScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { RemedyQueryResponse } from '../../types';
import * as remedyApi from '../../api/remedies';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import StarRating from '../../components/common/StarRating';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

type SearchScreenProps = NativeStackScreenProps<RootStackParamList, 'Search'>;

// Common symptom categories for quick selection
const commonSymptoms = [
  'Headache', 'Nausea', 'Fatigue', 'Insomnia', 'Anxiety',
  'Stress', 'Digestive Issues', 'Joint Pain', 'Inflammation', 
  'Cold', 'Flu', 'Allergies', 'Skin Issues'
];

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [results, setResults] = useState<RemedyQueryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSelectSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms(prev => [...prev, symptom]);
    }
  };

  const handleAddSearchTermAsSymptom = () => {
    if (!searchTerm.trim()) return;
    
    if (!selectedSymptoms.includes(searchTerm.trim())) {
      setSelectedSymptoms(prev => [...prev, searchTerm.trim()]);
    }
    setSearchTerm('');
  };

  const handleSearch = async () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('Search Error', 'Please select at least one symptom');
      return;
    }

    setLoading(true);
    try {
      const data = await remedyApi.queryRemedies(selectedSymptoms);
      setResults(data);
      setHasSearched(true);
    } catch (error: any) {
      Alert.alert('Search Error', error.message || 'Failed to search remedies');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSelectedSymptoms([]);
    setResults([]);
    setHasSearched(false);
  };

  const renderRemedyItem = ({ item }: { item: RemedyQueryResponse }) => (
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
        <View>
          <Badge 
            text={`Score: ${Math.round(item.calculatedRelevanceScore)}`} 
            variant="primary"
          />
        </View>
      </View>
      
      <Text className="text-gray-600 mt-2" numberOfLines={2}>
        {item.description}
      </Text>
      
      <View className="mt-3">
        <Text className="font-medium text-gray-700 mb-1">Matching symptoms:</Text>
        <View className="flex-row flex-wrap">
          {item.symptoms
            .filter(s => selectedSymptoms.includes(s.name))
            .slice(0, 3)
            .map((symptom, index) => (
              <Badge 
                key={index} 
                text={symptom.name} 
                variant="success" 
                className="mr-2 mb-2" 
              />
            ))}
          {item.symptoms.filter(s => selectedSymptoms.includes(s.name)).length > 3 && (
            <Badge 
              text={`+${item.symptoms.filter(s => selectedSymptoms.includes(s.name)).length - 3}`} 
              variant="success" 
              className="mr-2 mb-2" 
            />
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-4 shadow-sm">
        <Text className="text-lg font-bold text-gray-800 mb-2">
          Find Natural Remedies
        </Text>
        
        <View className="flex-row items-center mb-4">
          <TextInput
            className="flex-1 border border-gray-300 rounded-l-lg p-2 bg-white"
            placeholder="Enter a symptom"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <TouchableOpacity 
            className="bg-green-600 p-2 rounded-r-lg"
            onPress={handleAddSearchTermAsSymptom}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {selectedSymptoms.length > 0 && (
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-medium text-gray-700">Selected Symptoms:</Text>
              <TouchableOpacity onPress={clearSearch}>
                <Text className="text-green-600">Clear All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="pb-2"
            >
              {selectedSymptoms.map((symptom, index) => (
                <TouchableOpacity 
                  key={index}
                  onPress={() => handleSelectSymptom(symptom)}
                  className="bg-green-100 rounded-full px-3 py-1 mr-2 flex-row items-center"
                >
                  <Text className="text-green-800">{symptom}</Text>
                  <Ionicons name="close-circle" size={16} color="#4CAF50" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        <TouchableOpacity 
          className="bg-green-600 py-3 rounded-lg items-center"
          onPress={handleSearch}
          disabled={loading || selectedSymptoms.length === 0}
        >
          <Text className="text-white font-bold">
            {loading ? 'Searching...' : 'Search Remedies'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View className="px-4 py-3">
        <Text className="font-medium text-gray-700 mb-2">Common Symptoms:</Text>
        <View className="flex-row flex-wrap">
          {commonSymptoms.map((symptom, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => handleSelectSymptom(symptom)}
              className={`rounded-full px-3 py-1 mr-2 mb-2 ${
                selectedSymptoms.includes(symptom) 
                  ? 'bg-green-600' 
                  : 'bg-gray-200'
              }`}
            >
              <Text 
                className={selectedSymptoms.includes(symptom) 
                  ? 'text-white' 
                  : 'text-gray-800'
                }
              >
                {symptom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text className="mt-4 text-gray-600">Searching for remedies...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderRemedyItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            hasSearched ? (
              <EmptyState
                title="No remedies found"
                message="Try different symptoms or check our common symptoms list"
                icon="search-outline"
              />
            ) : null
          }
        />
      )}
    </View>
  );
};

export default SearchScreen;