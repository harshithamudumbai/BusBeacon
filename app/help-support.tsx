import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Mail, Phone } from 'lucide-react-native';
import { useRouter } from 'expo-router';


export default function HelpSupportScreen() {
    const router = useRouter();
    const options = [
    {
      label: 'Report Issue',
      icon: BookOpen,
      action: () => router.push('/(tabs)/report'),
    },
    {
      label: 'Email Support',
      icon: Mail,
      action: () =>
        Linking.openURL(
          'mailto:support@busbeacon.app?subject=BusBeacon%20Support'
        ),
    },
    {
      label: 'Call Support',
      icon: Phone,
      action: () => Linking.openURL('tel:+919502494813'),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background items-center pt-16">
      {/* Title */}
      <Text className="text-2xl font-bold text-foreground mb-2">
        Help & Support
      </Text>

      {/* Description */}
      <Text className="text-gray-500 text-center mb-16 px-8">
        Get help or contact our support team
      </Text>

      {/* Icons vertical */}
      <View className="w-full px-12 items-center">
        {options.map((item, index) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={index}
              onPress={item.action}
              className="items-center mb-16" // bigger gap here
            >
              <View className="bg-card rounded-full p-6 mb-2">
                <Icon size={48} color="#4B5563" />
              </View>
              <Text className="text-foreground text-lg font-semibold">
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
