// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { RootStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  
  const { control, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          Create your ZenCure account
        </Text>
        
        <Controller
          control={control}
          rules={{
            required: 'Name is required',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              autoCapitalize="words"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.name?.message}
            />
          )}
          name="name"
        />

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
              placeholder="Create a password"
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

        <Controller
          control={control}
          rules={{
            required: 'Please confirm your password',
            validate: value => 
              value === password || 'Passwords do not match',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.confirmPassword?.message}
            />
          )}
          name="confirmPassword"
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
          title="Create Account"
          onPress={handleSubmit(onSubmit)}
          fullWidth
          loading={isLoading}
        />

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-green-600 font-bold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;