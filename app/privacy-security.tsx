import { ArrowLeft, Shield } from 'lucide-react-native';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function PrivacySecurityScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FAFAFA" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-foreground">Privacy & Security</Text>
      </View>

      <ScrollView className="flex-1 px-4 space-y-6">
        {/* Info Card */}
        <View className="bg-card rounded-2xl p-6">
          <View className="flex-row items-center mb-4">
            <Shield size={24} color="#22C55E" />
            <Text className="ml-3 text-lg font-semibold text-foreground">Your Privacy</Text>
          </View>
          <Text className="text-sm text-muted-foreground mb-2">
            • The app only collects information necessary for attendance and trip management.
          </Text>
          <Text className="text-sm text-muted-foreground mb-2">
            • All data is securely stored on the server.
          </Text>
          <Text className="text-sm text-muted-foreground mb-2">
            • Your phone number is used only for authentication.
          </Text>
          <Text className="text-sm text-muted-foreground mb-2">
            • Location is tracked only during active trips for safety.
          </Text>
          <Text className="text-sm text-muted-foreground">
            • For any changes or issues, contact your administrator.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
