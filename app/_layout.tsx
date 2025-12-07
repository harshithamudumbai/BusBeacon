import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import '../global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="profile" />
      </Stack>
    </AuthProvider>
  );
}
