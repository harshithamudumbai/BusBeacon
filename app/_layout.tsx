import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import '../global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth screens */}
        <Stack.Screen name="(auth)" />

        {/* Tabs navigator */}
        <Stack.Screen name="(tabs)" />

        {/* Full-screen screens outside tabs */}
        <Stack.Screen name="help-support" />
        <Stack.Screen name="settings" />
      </Stack>
    </AuthProvider>
  );
}
