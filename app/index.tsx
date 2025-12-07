import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading, selectedRole, hasMultipleRoles } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // If user has multiple roles and hasn't selected one yet
  if (hasMultipleRoles && !selectedRole) {
    return <Redirect href="/(auth)/role-select" />;
  }

  return <Redirect href="/(tabs)" />;
}