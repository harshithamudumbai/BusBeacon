import { router } from 'expo-router';
import { Bell, ChevronRight, Clock, Database, Globe, LogOut, Shield, Users } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoAlerts, setAutoAlerts] = useState(true);
  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/sign-in');
  };
  
  type ToggleSettingItem = 
  {
    id: string;
    label: string;
    description: string;
    icon: any;
    type: 'toggle';
    value: boolean;
    onChange: (value: boolean) => void;
  };

  type LinkSettingItem = {
    id: string;
    label: string;
    description: string;
    icon: any;
    type: 'link';
  };

  type SettingItem = ToggleSettingItem | LinkSettingItem;


  type SettingSection = {
    title: string;
    items: SettingItem[];
  };
  
  const settingSections: SettingSection[] = [
    {
        title: 'Notifications',
        items: [
            { id: 'push', label: 'Push Notifications', description: 'Enable app notifications', icon: Bell, type: 'toggle', value: notifications, onChange: setNotifications },
            { id: 'auto', label: 'Auto Alerts', description: 'Send automatic alerts to parents', icon: Clock, type: 'toggle', value: autoAlerts, onChange: setAutoAlerts },
        ],
    },
    {
        title: 'System',
        items: [
            { id: 'users', label: 'User Management', description: 'Manage admin users and roles', icon: Users, type: 'link' },
            { id: 'data', label: 'Data Management', description: 'Import/export system data', icon: Database, type: 'link' },
            { id: 'security', label: 'Security', description: 'Passwords and access control', icon: Shield, type: 'link' },
            { id: 'locale', label: 'Language & Region', description: 'English (India)', icon: Globe, type: 'link' },
        ],
    },
   ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4 border-b border-border">
        <Text className="text-xl font-semibold text-foreground">Settings</Text>
        <Text className="text-sm text-muted-foreground">System configuration</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {settingSections.map((section) => (
          <View key={section.title} className="mb-6">
            <Text className="text-sm font-medium text-muted-foreground mb-3 uppercase">{section.title}</Text>
            <View className="bg-card rounded-xl overflow-hidden">
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  className={`flex-row items-center p-4 ${index < section.items.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <View className="w-10 h-10 bg-secondary rounded-full items-center justify-center mr-3">
                    <item.icon size={20} color="#71717A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-foreground">{item.label}</Text>
                    <Text className="text-sm text-muted-foreground">{item.description}</Text>
                  </View>
                  {item.type === 'toggle' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onChange}
                      trackColor={{ false: '#27272A', true: '#22C55E' }}
                      thumbColor="#FAFAFA"
                    />
                  ) : (
                    <ChevronRight size={18} color="#71717A" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View className="bg-card rounded-xl p-4 mb-4">
          <Text className="text-sm text-muted-foreground mb-1">App Version</Text>
          <Text className="text-base font-medium text-foreground">BusBeacon v1.0.0</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex-row items-center justify-center mb-8"
        >
          <LogOut size={20} color="#EF4444" />
          <Text className="text-red-500 font-semibold ml-2">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}