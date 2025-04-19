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
import { Source } from '../../types';
import * as adminApi from '../../api/admin';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types';

type AdminCreateRemedyScreenProps = NativeStackScreenProps<AdminStackParamList, 'AdminCreateRemedy'>;

const AdminCreateRemedyScreen: React.FC<AdminCreateRemedyScreenProps> = ({ navigation }) => {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [warningInput, setWarningInput] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);
  
  // Symptoms state with relevance scores
  const [symptoms, setSymptoms] = useState<{name: string, relevanceScore: number}[]>([]);
  const [selectedSymptomRelevance, setSelectedSymptomRelevance] = useState(75);
  
  // Sources state
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  
  // UI state
  const [existingSymptoms, setExistingSymptoms] = useState<string[]>([]);
  const [showExistingSymptoms, setShowExistingSymptoms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setFetchingData(true);
      try {
        // Fetch existing symptoms
        const symptoms = await adminApi.getUniqueSymptoms();
        setExistingSymptoms(symptoms);
        
        // Fetch sources
        const sources = await adminApi.getAllSources();
        setSources(sources);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load initial data');
      } finally {
        setFetchingData(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleAddCategory = () => {
    if (!categoryInput.trim()) return;
    
    if (!categories.includes(categoryInput.trim())) {
      setCategories([...categories, categoryInput.trim()]);
    }
    setCategoryInput('');
  };

  const handleAddWarning = () => {
    if (!warningInput.trim()) return;
    
    if (!warnings.includes(warningInput.trim())) {
      setWarnings([...warnings, warningInput.trim()]);
    }
    setWarningInput('');
  };

  const handleAddSymptom = () => {
    if (!symptomInput.trim()) return;
    
    // Check if already added
    if (symptoms.some(s => s.name === symptomInput.trim())) {
      Alert.alert('Error', 'This symptom has already been added');
      return;
    }
    
    // Add new symptom with relevance score
    setSymptoms([
      ...symptoms, 
      { name: symptomInput.trim(), relevanceScore: selectedSymptomRelevance }
    ]);
    
    // Add to existing symptoms if it's new
    if (!existingSymptoms.includes(symptomInput.trim())) {
      setExistingSymptoms([...existingSymptoms, symptomInput.trim()]);
    }
    
    setSymptomInput('');
    setSelectedSymptomRelevance(75); // Reset to default
  };

  const handleSelectExistingSymptom = (symptom: string) => {
    // Check if already added
    if (symptoms.some(s => s.name === symptom)) {
      Alert.alert('Error', 'This symptom has already been added');
      return;
    }
    
    // Add selected symptom with current relevance score
    setSymptoms([
      ...symptoms, 
      { name: symptom, relevanceScore: selectedSymptomRelevance }
    ]);
    
    setShowExistingSymptoms(false);
    setSelectedSymptomRelevance(75); // Reset to default
  };

  const toggleSourceSelection = (sourceId: string) => {
    if (selectedSourceIds.includes(sourceId)) {
      setSelectedSourceIds(selectedSourceIds.filter(id => id !== sourceId));
    } else {
      setSelectedSourceIds([...selectedSourceIds, sourceId]);
    }
  };

  const removeCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setCategories(newCategories);
  };

  const removeWarning = (index: number) => {
    const newWarnings = [...warnings];
    newWarnings.splice(index, 1);
    setWarnings(newWarnings);
  };

  const removeSymptom = (index: number) => {
    const newSymptoms = [...symptoms];
    newSymptoms.splice(index, 1);
    setSymptoms(newSymptoms);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'Remedy name is required');
      return false;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Description is required');
      return false;
    }
    
    if (categories.length === 0) {
      Alert.alert('Error', 'At least one category is required');
      return false;
    }
    
    if (symptoms.length === 0) {
      Alert.alert('Error', 'At least one symptom is required');
      return false;
    }
    
    if (selectedSourceIds.length === 0) {
      Alert.alert('Error', 'At least one source is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const remedyData: adminApi.CreateRemedyData = {
        name,
        description,
        categories,
        symptoms,
        warnings,
        sourceIds: selectedSourceIds,
        verified
      };
      
      await adminApi.createRemedy(remedyData);
      
      Alert.alert(
        'Success',
        'Remedy created successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create remedy');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="mt-4 text-gray-600">Loading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-800 mb-4">Add New Remedy</Text>
        
        {/* Basic Info Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-700 mb-2">Basic Information</Text>
          
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Remedy Name *</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-2 bg-white"
              value={name}
              onChangeText={setName}
              placeholder="Enter remedy name"
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Description *</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-2 min-h-24 bg-white"
              value={description}
              onChangeText={setDescription}
              placeholder="Enter a detailed description"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm font-medium text-gray-700">Verified Remedy</Text>
              <Switch
                value={verified}
                onValueChange={setVerified}
                trackColor={{ false: '#767577', true: '#4CAF50' }}
              />
            </View>
            <Text className="text-xs text-gray-500">
              Only mark as verified if the remedy has strong scientific backing
            </Text>
          </View>
        </View>
        
        {/* Categories Section */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-700 mb-2">Categories *</Text>
          
          <View className="flex-row items-center mb-2">
            <TextInput
              className="flex-1 border border-gray-300 rounded-l-md p-2 bg-white"
              value={categoryInput}
              onChangeText={setCategoryInput}
              placeholder="e.g., Herb, Tea, Essential Oil"
            />
            <TouchableOpacity
              className="bg-green-600 p-2 rounded-r-md"
              onPress={handleAddCategory}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap">
            {categories.map((category, index) => (
              <View key={index} className="bg-green-100 rounded-full px-3 py-1 m-1 flex-row items-center">
                <Text className="text-green-800">{category}</Text>
                <TouchableOpacity
                  className="ml-1"
                  onPress={() => removeCategory(index)}
                >
                  <Ionicons name="close-circle" size={16} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Card>
        
        {/* Symptoms Section */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-700 mb-2">Symptoms *</Text>
          
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <TextInput
                className="flex-1 border border-gray-300 rounded-l-md p-2 bg-white"
                value={symptomInput}
                onChangeText={setSymptomInput}
                placeholder="Add symptom or condition"
              />
              <TouchableOpacity
                className="bg-green-600 p-2 rounded-r-md"
                onPress={handleAddSymptom}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              className="mb-2"
              onPress={() => setShowExistingSymptoms(!showExistingSymptoms)}
            >
              <Text className="text-green-600">
                {showExistingSymptoms ? "Hide existing symptoms" : "Choose from existing symptoms"}
              </Text>
            </TouchableOpacity>
            
            {showExistingSymptoms && (
              <View className="mb-3 p-2 border border-gray-200 rounded-md bg-gray-50 max-h-40">
                <ScrollView>
                  {existingSymptoms.map((symptom, index) => (
                    <TouchableOpacity 
                      key={index}
                      onPress={() => handleSelectExistingSymptom(symptom)}
                      className="py-2 border-b border-gray-200"
                    >
                      <Text>{symptom}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            
            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Relevance Score: {selectedSymptomRelevance}
              </Text>
              <View className="flex-row items-center">
                <Text className="mr-2">0</Text>
                <View className="flex-1 h-1 bg-gray-200 rounded-full">
                  <View 
                    className="h-1 bg-green-600 rounded-full" 
                    style={{ width: `${selectedSymptomRelevance}%` }} 
                  />
                </View>
                <Text className="ml-2">100</Text>
              </View>
              <TouchableOpacity 
                className="flex-row items-center justify-center mt-2" 
                onPress={() => setSelectedSymptomRelevance(Math.max(0, selectedSymptomRelevance - 5))}
              >
                <Ionicons name="remove" size={20} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-row items-center justify-center mt-1" 
                onPress={() => setSelectedSymptomRelevance(Math.min(100, selectedSymptomRelevance + 5))}
              >
                <Ionicons name="add" size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text className="font-medium text-gray-700 mb-2">Added Symptoms:</Text>
          {symptoms.length > 0 ? (
            symptoms.map((symptom, index) => (
              <View key={index} className="flex-row justify-between items-center bg-gray-50 p-2 rounded-md mb-2">
                <View className="flex-row items-center">
                  <Text className="font-medium">{symptom.name}</Text>
                  <View className="ml-2 px-2 py-1 bg-blue-100 rounded">
                    <Text className="text-xs text-blue-800">Score: {symptom.relevanceScore}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => removeSymptom(index)}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 italic">No symptoms added yet</Text>
          )}
        </Card>
        
        {/* Warnings Section */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-700 mb-2">Warnings (Optional)</Text>
          
          <View className="flex-row items-center mb-2">
            <TextInput
              className="flex-1 border border-gray-300 rounded-l-md p-2 bg-white"
              value={warningInput}
              onChangeText={setWarningInput}
              placeholder="Add warning or precaution"
            />
            <TouchableOpacity
              className="bg-red-500 p-2 rounded-r-md"
              onPress={handleAddWarning}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap">
            {warnings.map((warning, index) => (
              <View key={index} className="bg-red-100 rounded-md px-3 py-2 m-1 flex-row items-center justify-between w-full">
                <Text className="text-red-800 flex-1">{warning}</Text>
                <TouchableOpacity
                  className="ml-1"
                  onPress={() => removeWarning(index)}
                >
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Card>
        
        {/* Sources Section */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-700 mb-2">Sources *</Text>
          <Text className="text-gray-600 mb-3">Select sources that reference this remedy:</Text>
          
          {sources.length > 0 ? (
            sources.map((source) => (
              <TouchableOpacity 
                key={source._id}
                onPress={() => toggleSourceSelection(source._id)}
                className={`flex-row items-center p-3 mb-2 rounded-md ${
                  selectedSourceIds.includes(source._id) ? 'bg-green-100' : 'bg-gray-50'
                }`}
              >
                <Ionicons 
                  name={selectedSourceIds.includes(source._id) ? "checkbox" : "square-outline"} 
                  size={22} 
                  color="#4CAF50" 
                  style={{ marginRight: 10 }}
                />
                <View className="flex-1">
                  <Text className="font-medium">{source.title}</Text>
                  <Text className="text-xs text-gray-500">{source.url}</Text>
                  <View className="flex-row mt-1">
                    <View className="bg-blue-100 rounded px-2 py-0.5 mr-1">
                      <Text className="text-xs text-blue-800">Score: {source.credibilityScore}/10</Text>
                    </View>
                    {source.isPeerReviewed && (
                      <View className="bg-purple-100 rounded px-2 py-0.5">
                        <Text className="text-xs text-purple-800">Peer Reviewed</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center py-4">
              <Text className="text-gray-500">No sources available</Text>
              <TouchableOpacity 
                className="mt-2" 
                onPress={() => navigation.navigate('AdminCreateSource')}
              >
                <Text className="text-green-600 font-medium">Add a new source</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <TouchableOpacity 
            className="mt-2" 
            onPress={() => navigation.navigate('AdminCreateSource')}
          >
            <Text className="text-green-600 font-medium">Add a new source</Text>
          </TouchableOpacity>
        </Card>
        
        <Button
          title={loading ? "Creating Remedy..." : "Create Remedy"}
          onPress={handleSubmit}
          fullWidth
          loading={loading}
          className="mb-8"
        />
      </View>
    </ScrollView>
  );
};

export default AdminCreateRemedyScreen;