import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendOtp } from '../../services/api-rest';

export default function SignInScreen() {
  // ✅ Get phone number if coming from OTP screen
  const { phoneNumber: passedPhone } = useLocalSearchParams<{ phoneNumber?: string }>();
  const [phoneNumber, setPhoneNumber] = useState(passedPhone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Disable back button on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backAction = () => {
        BackHandler.exitApp();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );
      return () => subscription.remove();
    }
  }, []);

  // Handle Next Button
  const handleNext = async () => {
    setErrorMessage('');

    if (phoneNumber.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendOtp({ phoneNumber });

      if (response.success) {
        router.push({ pathname: '/(auth)/otp', params: { phoneNumber } });
      } else {
        setErrorMessage('Mobile number not registered');
        setPhoneNumber('');
      }
    } catch (error) {
      setErrorMessage('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clean phone input
  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    setErrorMessage(''); // clear error when typing
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-12">
            <View className="flex-1">
              <Text className="text-2xl font-semibold text-center text-foreground mb-8">
                Sign in
              </Text>

              {/* PHONE INPUT */}
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

              {/* RED ERROR MESSAGE */}
              {errorMessage ? (
                <Text className="text-red-500 mt-2 text-sm">{errorMessage}</Text>
              ) : null}

              <Text className="text-sm text-muted-foreground mt-3">
                Example: 9014536201
              </Text>
            </View>

            {/* NEXT BUTTON */}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
