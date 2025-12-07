import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { verifyOtp } from '../../services/api';
import { isTermsAccepted } from '../../services/storage';

export default function OtpScreen() {
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  const { login } = useAuth();

  useEffect(() => {
    if (!phoneNumber) {
      router.replace('./(auth)/sign-in');
    }
  }, [phoneNumber]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    setTimer(30);
    alert('OTP sent successfully!');
  };

  const handleNext = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyOtp({ phoneNumber: phoneNumber!, otp: otpString });
      
      if (response.success && response.data) {
        await login(response.data.token, response.data.user);
        
        const termsAccepted = await isTermsAccepted();
        if (termsAccepted) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/terms');
        }
      }
    } catch (error) {
      alert('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-12">
        <View className="flex-1">
          <Text className="text-2xl font-semibold text-center text-foreground mb-2">
            Enter code sent to your phone
          </Text>
          <Text className="text-sm text-muted-foreground text-center mb-8">
            We sent it to +91 {phoneNumber}
          </Text>
          
          <View className="flex-row justify-between mb-6">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref!)}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                className="w-12 h-14 bg-secondary rounded-xl text-center text-xl font-semibold text-foreground"
              />
            ))}
          </View>
          
          <View className="flex-row justify-center items-center">
            {timer > 0 ? (
              <Text className="text-sm text-muted-foreground">
                Resend OTP in {timer}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text className="text-sm text-primary font-medium">
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <TouchableOpacity
          onPress={handleNext}
          disabled={otp.join('').length !== 6 || isLoading}
          className={`w-full py-4 rounded-2xl items-center ${
            otp.join('').length !== 6 || isLoading 
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
