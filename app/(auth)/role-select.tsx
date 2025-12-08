import { useRouter } from 'expo-router';
import { Building2, Shield, Truck, UserCheck } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { AppRole, ROLE_DESCRIPTIONS, ROLE_LABELS } from '../../services/api-rest';

const ROLE_ICONS: Record<AppRole, React.ComponentType<any>> = {
  super_admin: Shield,
  transport_manager: Truck,
  office_admin: Building2,
  attender: UserCheck,
};

const ROLE_COLORS: Record<AppRole, string> = {
  super_admin: '#8B5CF6',
  transport_manager: '#3B82F6',
  office_admin: '#10B981',
  attender: '#F59E0B',
};

export default function RoleSelectScreen() {
  const router = useRouter();
  const { user, selectRole } = useAuth();

  const handleSelectRole = async (role: AppRole) => {
    await selectRole(role);
    router.replace('/(tabs)');
  };

  if (!user?.roles || user.roles.length === 0) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-8">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Welcome, {user.name}
          </Text>
          <Text className="text-muted-foreground text-base">
            You have multiple roles. Select which app to open:
          </Text>
        </View>

        <View className="flex-1 justify-center gap-4">
          {user.roles.map((role) => {
            const Icon = ROLE_ICONS[role];
            const color = ROLE_COLORS[role];
            
            return (
              <TouchableOpacity
                key={role}
                onPress={() => handleSelectRole(role)}
                className="bg-card border border-border rounded-2xl p-6 flex-row items-center"
                style={{ borderLeftWidth: 4, borderLeftColor: color }}
              >
                <View 
                  className="w-14 h-14 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: color + '20' }}
                >
                  <Icon size={28} color={color} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">
                    {ROLE_LABELS[role]}
                  </Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    {ROLE_DESCRIPTIONS[role]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mt-6 p-4 bg-muted rounded-xl">
          <Text className="text-sm text-muted-foreground text-center">
            💡 Tip: You can switch roles anytime from your profile settings
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}