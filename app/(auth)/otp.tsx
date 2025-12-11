import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { verifyOtp } from '../../services/api-rest';
import { isTermsAccepted } from '../../services/storage';

export default function OtpScreen() {
  // ✅ State for phone number
  const { phoneNumber: passedPhone } = useLocalSearchParams<{ phoneNumber?: string }>();
  const [phoneNumber, setPhoneNumber] = useState(passedPhone || '');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const inputRefs = useRef<TextInput[]>([]);
  const { login } = useAuth();

  // Auto-focus first input on screen focus
  useFocusEffect(
    useCallback(() => {
      if (!phoneNumber) {
        router.replace('./(auth)/sign-in');
        return;
      }

      const timeout = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);

      return () => clearTimeout(timeout);
    }, [phoneNumber])
  );

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Android back button → go to Sign-In with phone number
  useEffect(() => {
    const onBackPress = () => {
      router.replace({
        pathname: '/(auth)/sign-in',
        params: { phoneNumber },
      });
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [phoneNumber]);

  // Handle OTP input changes
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];

    if (value === '') {
      newOtp[index] = '';
      setOtp(newOtp);
      if (index > 0) inputRefs.current[index - 1]?.focus();
      return;
    }

    newOtp[index] = value[0];
    setOtp(newOtp);
    if (index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
        return;
      }
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const prevOtp = [...otp];
        prevOtp[index - 1] = '';
        setOtp(prevOtp);
      }
    }
  };

  const handleResendOtp = () => {
    setTimer(30);
    alert('OTP sent successfully!');
  };

  const handleNext = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await verifyOtp({ phoneNumber, otp: otpString });

      if (response.success && response.data) {
        await login(response.data.token, response.data.user);

        const termsAccepted = await isTermsAccepted();
        if (termsAccepted) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/terms');
        }
      } else {
        setError('Oops! The code you entered is incorrect. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 120,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1">
            {/* Header */}
            <Text className="text-2xl font-semibold text-center text-foreground mb-2">
              Enter code sent to your phone
            </Text>
            <Text className="text-sm text-muted-foreground text-center mb-4">
              We sent it to +91 {phoneNumber}
            </Text>

            {/* Error */}
            {error ? (
              <Text className="text-red-500 text-center mb-4">{error}</Text>
            ) : null}

            {/* OTP Inputs */}
            <View className="flex-row justify-between mb-6">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref!)}
                  autoFocus={index === 0}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  style={{
                    width: 48,
                    height: 56,
                    borderRadius: 12,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: '600',
                    backgroundColor: '#1F1F1F',
                    color: '#FFFFFF',
                    borderWidth: focusedIndex === index ? 2 : 1,
                    borderColor: focusedIndex === index ? '#FFFFFF' : '#3F3F46',
                  }}
                />
              ))}
            </View>

            {/* Resend OTP */}
            <View className="flex-row justify-center items-center mb-6">
              {timer > 0 ? (
                <Text className="text-sm text-muted-foreground">
                  Resend OTP in {timer}s
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResendOtp}>
                  <Text className="text-sm text-primary font-medium">Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Fixed Next Button */}
        <View style={{ padding: 16, backgroundColor: 'transparent' }}>
          <TouchableOpacity
            onPress={handleNext}
            disabled={otp.join('').length !== 6 || isLoading}
            className={`w-full py-4 rounded-2xl items-center ${
              otp.join('').length !== 6 || isLoading ? 'bg-primary/50' : 'bg-primary'
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
