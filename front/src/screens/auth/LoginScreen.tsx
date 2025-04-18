// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { RootStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

type FormData = {
  email: string;
  password: string;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <View className="items-center mb-8">
        <Image 
          source={require('../../../assets/logo.png')} 
          className="w-24 h-24" 
          resizeMode="contain"
        />
        <Text className="text-3xl font-bold text-green-600 mt-4">ZenCure</Text>
        <Text className="text-gray-600 mt-2">Your Natural Healing Companion</Text>
      </View>
      
      <Controller
        control={control}
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.email?.message}
          />
        )}
        name="email"
      />

      <Controller
        control={control}
        rules={{
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.password?.message}
          />
        )}
        name="password"
      />

      <TouchableOpacity
        onPress={() => setShowPassword(!showPassword)}
        className="items-end mb-4"
      >
        <Text className="text-green-600">
          {showPassword ? 'Hide Password' : 'Show Password'}
        </Text>
      </TouchableOpacity>

      <Button
        title="Sign In"
        onPress={handleSubmit(onSubmit)}
        fullWidth
        loading={isLoading}
      />

      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-600">Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text className="text-green-600 font-bold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;