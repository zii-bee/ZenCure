import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import RemedyDetailScreen from '../screens/remedies/RemedyDetailScreen';
import ReviewDetailScreen from '../screens/remedies/ReviewDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SearchScreen from '../screens/home/SearchScreen';
import CreateReviewScreen from '../screens/remedies/CreateReviewScreen';

// Import admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUserManagementScreen from '../screens/admin/AdminUserManagementScreen';
import AdminCreateRemedyScreen from '../screens/admin/AdminCreateRemedyScreen';
import AdminCreateSourceScreen from '../screens/admin/AdminCreateSourceScreen';
import AdminReviewManagementScreen from '../screens/admin/AdminReviewManagementScreen';
import AdminCommentManagementScreen from '../screens/admin/AdminCommentManagementScreen';

// Import moderator screens
import ModeratorDashboardScreen from '../screens/moderator/ModeratorDashboardScreen';  // New Moderator Dashboard Screen

// Import store and types
import { useAuthStore } from '../store/authStore';
import { RootStackParamList, BottomTabParamList, AdminStackParamList, ModeratorStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();
const AdminStack = createNativeStackNavigator<AdminStackParamList>();
const ModeratorStack = createNativeStackNavigator<ModeratorStackParamList>()

function AdminStackNavigator() {
  return (
    <AdminStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <AdminStack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      <AdminStack.Screen
        name="AdminUserManagement"
        component={AdminUserManagementScreen}
        options={{ title: 'User Management' }}
      />
      <AdminStack.Screen
        name="AdminCreateRemedy"
        component={AdminCreateRemedyScreen}
        options={{ title: 'Add New Remedy' }}
      />
      <AdminStack.Screen
        name="AdminCreateSource"
        component={AdminCreateSourceScreen}
        options={{ title: 'Add New Source' }}
      />
      <AdminStack.Screen
        name="AdminReviewManagement"
        component={AdminReviewManagementScreen}
        options={{ title: 'Manage Reviews' }}
      />
      <AdminStack.Screen
        name="AdminCommentManagement"
        component={AdminCommentManagementScreen}
        options={{ title: 'Manage Comments' }}
      />
    </AdminStack.Navigator>
  );
}

function ModeratorStackNavigator() {
  return (
    <AdminStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <ModeratorStack.Screen
        name="ModeratorDashboard"
        component={ModeratorDashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />

      <AdminStack.Screen
        name="AdminReviewManagement"
        component={AdminReviewManagementScreen}
        options={{ title: 'Manage Reviews' }}
      />
      <AdminStack.Screen
        name="AdminCommentManagement"
        component={AdminCommentManagementScreen}
        options={{ title: 'Manage Comments' }}
      />
    </AdminStack.Navigator>
  );
}

function HomeTabs() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator'; // Check if the user is a moderator

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'shield' : 'shield-outline';
          } else if (route.name === 'Moderator') {  // Icon for Moderator tab
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'ZenCure' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ title: 'Find Remedies' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'My Profile' }}
      />

      {/* Admin Tab - Only visible for admins */}
      {isAdmin && (
        <Tab.Screen 
          name="Admin" 
          component={AdminStackNavigator} 
          options={{ 
            title: 'Admin',
            headerShown: false,
          }}
        />
      )}

      {/* Moderator Tab - Only visible for moderators */}
      {isModerator && (
        <Tab.Screen 
          name="Moderator" 
          component={ModeratorStackNavigator}  // The screen for moderators
          options={{ 
            title: 'Moderator', 
            headerShown: false, // Hide the header for this screen
          }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth();
      setIsLoading(false);
    };

    initializeAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RemedyDetail"
              component={RemedyDetailScreen}
              options={{ title: 'Remedy Details' }}
            />
            <Stack.Screen
              name="ReviewDetail"
              component={ReviewDetailScreen}
              options={{ title: 'Review' }}
            />
            <Stack.Screen
              name="CreateReview"
              component={CreateReviewScreen}
              options={{ title: 'Write a Review' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'ZenCure', headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Create Account' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
