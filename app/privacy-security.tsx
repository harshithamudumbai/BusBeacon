import { router } from 'expo-router';
import { ArrowLeft, Info, Lock, MapPin, Shield } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function PrivacySecurityScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FAFAFA" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-foreground">
          Privacy & Security
        </Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Account Section */}
        <View className="bg-card rounded-2xl p-5 mb-4">
          <View className="flex-row items-center mb-3">
            <Lock size={18} color="#22C55E" />
            <Text className="ml-2 text-base font-semibold text-foreground">
              Account
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-muted-foreground">Login Method</Text>
            <Text className="text-foreground font-medium">Phone OTP</Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-muted-foreground">Role</Text>
            <Text className="text-foreground font-medium">
              {user?.role || 'Attender'}
            </Text>
          </View>
        </View>

        {/* Permissions Section */}
        <View className="bg-card rounded-2xl p-5 mb-4">
          <View className="flex-row items-center mb-3">
            <MapPin size={18} color="#22C55E" />
            <Text className="ml-2 text-base font-semibold text-foreground">
              Permissions
            </Text>
          </View>

          <Text className="text-sm text-foreground mb-2">
            • Location access is used only during active trips.
          </Text>
          <Text className="text-sm text-foreground">
            • Notifications are used only for service and safety alerts.
          </Text>
        </View>

        {/* Note Section */}
        <View className="bg-secondary/40 rounded-2xl p-5">
          <View className="flex-row items-center mb-2">
            <Info size={18} color="#71717A" />
            <Text className="ml-2 text-base font-semibold text-foreground">
              Note
            </Text>
          </View>

          <Text className="text-sm text-muted-foreground">
            Profile and security settings cannot be edited.  
            If you need to make changes, please contact the administrator.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
