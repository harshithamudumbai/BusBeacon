import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Config';

// --- 1. PRIMARY BUTTON (Green) ---
export const PrimaryButton = ({ title, onPress, loading, disabled }: any) => (
  <TouchableOpacity 
    onPress={onPress}
    disabled={disabled || loading}
    style={[styles.btn, (disabled || loading) && styles.btnDisabled]}
  >
    {loading ? (
      <ActivityIndicator color="#FFF" />
    ) : (
      <Text style={styles.btnText}>{title}</Text>
    )}
  </TouchableOpacity>
);

// --- 2. PHONE INPUT (+91 Box) ---
export const PhoneInput = ({ value, onChangeText }: any) => (
  <View style={styles.inputContainer}>
    <View style={styles.countryCode}>
      <Text style={styles.countryText}>+91</Text>
    </View>
    <TextInput 
      style={styles.input}
      placeholder="Enter phone number"
      placeholderTextColor="#A1A1A1"
      keyboardType="phone-pad"
      maxLength={10}
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

// --- 3. OTP INPUT BOX ---
export const OtpInputBox = ({ value, onChangeText }: any) => (
  <TextInput
    style={styles.otpInput}
    value={value}
    onChangeText={onChangeText}
    keyboardType="number-pad"
    maxLength={6}
    textAlign="center"
    autoFocus
  />
);

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.primary, // The Green color
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#000', // Black text on green button as per your design
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  countryCode: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 10,
  },
  countryText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    fontWeight: '500',
  },
  otpInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 8,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  }
});