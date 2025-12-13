import { router } from 'expo-router';
import { ArrowLeft, Info } from 'lucide-react-native';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from  '../services/api-rest';

export default function DetailsScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FAFAFA" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-foreground">
          Profile Details
        </Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Profile Card */}
        <View className="bg-card rounded-2xl p-6 items-center mb-6">
          <Image
            source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
            className="w-24 h-24 rounded-full bg-secondary mb-4"
          />
          <Text className="text-xl font-semibold text-foreground">
            {user?.name || '—'}
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">
            {user?.roles?.[0] ? ROLE_LABELS[user.roles[0]] : '—'}
          </Text>
        </View>

        {/* Details */}
        <View className="bg-card rounded-2xl p-4 mb-6">
          <Detail label="User ID" value={user?.id} />
          <Detail label="Phone Number" value={user?.phoneNumber} />
          <Detail label="Role" value={user?.roles?.join(', ')} />
          <Detail label="Bus Number" value={user?.assignedBus?.number} />
          <Detail label="Route" value={user?.assignedRoute?.name} />
          <Detail label="Branch" value={user?.assignedBranches?.[0]?.name} />
        </View>

        {/* Read-only Note */}
        <View className="bg-secondary rounded-2xl p-4 flex-row items-start">
          <Info size={20} color="#A1A1AA" />
          <Text className="text-sm text-muted-foreground ml-3 leading-5">
            This profile is read-only.  
            To edit your details, please contact the administrator.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <View className="mb-3">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="text-base font-medium text-foreground">
        {value || '—'}
      </Text>
    </View>
  );
}
