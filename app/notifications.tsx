import { router } from 'expo-router';
import { AlertCircle, ArrowLeft, Bell, CheckCircle, Info } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNotifications, Notification } from '../services/api-rest';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle size={20} color="#EF4444" />;
      case 'success':
        return <CheckCircle size={20} color="#22C55E" />;
      case 'info':
        return <Info size={20} color="#3B82F6" />;
      default:
        return <Bell size={20} color="#71717A" />;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#22C55E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FAFAFA" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-foreground">Notifications</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Bell size={48} color="#71717A" />
            <Text className="text-muted-foreground mt-4">No notifications yet</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <View
              key={notification.id}
              className={`bg-card rounded-xl p-4 mb-3 ${
                !notification.isRead ? 'border-l-4 border-primary' : ''
              }`}
            >
              <View className="flex-row items-start">
                <View className="w-10 h-10 bg-secondary rounded-full items-center justify-center mr-3">
                  {getNotificationIcon(notification.type)}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    {notification.title}
                  </Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-2">
                    {notification.createdAt}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
