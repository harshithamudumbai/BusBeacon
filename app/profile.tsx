import { router } from 'expo-router';
import { ArrowLeft, Bell, ChevronRight, HelpCircle, LogOut, Settings, Shield, User } from 'lucide-react-native';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/sign-in'); // Go back to sign-in
  };

  // Menu items
  const menuItems = [
    { icon: User, label: 'Edit Profile', onPress: () => {} },
    { icon: Bell, label: 'Notification Settings', onPress: () => {} },
    { icon: Shield, label: 'Privacy & Security', onPress: () => {} },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      onPress: () => router.push('/help-support') 
    },
    { label: 'App Settings', onPress: () => router.push('/settings') },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FAFAFA" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-foreground">Profile</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Profile Card */}
        <View className="bg-card rounded-2xl p-6 items-center mb-6">
          <Image
            source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
            className="w-24 h-24 rounded-full bg-secondary mb-4"
          />
          <Text className="text-xl font-semibold text-foreground">
            {user?.name || 'John Doe'}
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">
            {user?.role || 'Driver'}
          </Text>
          <View className="flex-row mt-4 gap-4">
            <View className="bg-secondary px-4 py-2 rounded-xl">
              <Text className="text-xs text-muted-foreground">Route</Text>
              <Text className="text-base font-semibold text-foreground">
                {user?.routeNumber || 'R-12'}
              </Text>
            </View>
            <View className="bg-secondary px-4 py-2 rounded-xl">
              <Text className="text-xs text-muted-foreground">Bus</Text>
              <Text className="text-base font-semibold text-foreground">
                {user?.busNumber || 'KA-01-1234'}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-card rounded-2xl overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              className={`flex-row items-center px-4 py-4 ${
                index < menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <Text className="flex-1 text-foreground ml-3">{item.label}</Text>
              <ChevronRight size={20} color="#71717A" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-destructive/10 rounded-2xl py-4 items-center flex-row justify-center"
        >
          <LogOut size={20} color="#EF4444" />
          <Text className="text-destructive font-semibold ml-2">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
