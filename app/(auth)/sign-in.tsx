import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendOtp } from '../../services/api';

export default function SignInScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (phoneNumber.length !== 10) {
      // Show alert or toast
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendOtp({ phoneNumber });
      if (response.success) {
        router.push({ pathname: '/(auth)/otp', params: { phoneNumber } });
      }
    } catch (error) {
      alert('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-12">
        <View className="flex-1">
          <Text className="text-2xl font-semibold text-center text-foreground mb-8">
            Sign in
          </Text>
          
          <View className="flex-row items-center bg-secondary rounded-xl overflow-hidden">
            <Text className="px-4 py-4 text-foreground font-medium border-r border-border">
              +91
            </Text>
            <TextInput
              keyboardType="phone-pad"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              className="flex-1 px-4 py-4 text-foreground text-base"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          <Text className="text-sm text-muted-foreground mt-3">
            Example: 9014536201
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={handleNext}
          disabled={phoneNumber.length !== 10 || isLoading}
          className={`w-full py-4 rounded-2xl items-center ${
            phoneNumber.length !== 10 || isLoading 
              ? 'bg-primary/50' 
              : 'bg-primary'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-primary-foreground font-semibold text-base">
              Next
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
