import { Bus, Clock, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bus as BusType, getActiveBuses } from '../../services/api-rest';

export default function StatusScreen() {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBuses();
    // Refresh every 30 seconds
    const interval = setInterval(loadBuses, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadBuses = async () => {
    try {
      const response = await getActiveBuses();
      if (response.success && response.data) {
        setBuses(response.data);
      }
    } finally {
      setIsLoading(false);
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
      <View className="px-4 py-4 border-b border-border">
        <Text className="text-xl font-semibold text-foreground">Bus Status</Text>
        <Text className="text-sm text-muted-foreground">Live tracking of active buses</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {buses.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <View className="w-20 h-20 bg-secondary rounded-full items-center justify-center mb-4">
              <Bus size={40} color="#71717A" />
            </View>
            <Text className="text-lg font-medium text-foreground">No Active Trips</Text>
            <Text className="text-sm text-muted-foreground">All buses are currently idle</Text>
          </View>
        ) : (
          buses.map((bus) => (
            <View key={bus.id} className="bg-card rounded-xl p-4 mb-3">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-green-500/20 rounded-full items-center justify-center mr-3">
                    <Bus size={24} color="#22C55E" />
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-foreground">{bus.number}</Text>
                    <Text className="text-sm text-muted-foreground">Route: {bus.route?.code || 'N/A'}</Text>
                  </View>
                </View>
                <View className="bg-green-500/20 px-3 py-1 rounded-full">
                  <Text className="text-xs font-medium text-green-500">On Trip</Text>
                </View>
              </View>

              {/* Progress */}
              <View className="bg-secondary rounded-lg p-3 mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm text-muted-foreground">Progress</Text>
                  <Text className="text-sm font-medium text-foreground">3/{bus.route?.stops?.length || 5} Stops</Text>
                </View>
                <View className="h-2 bg-background rounded-full overflow-hidden">
                  <View className="h-full bg-primary w-3/5 rounded-full" />
                </View>
              </View>

              {/* Stats */}
              <View className="flex-row">
                <View className="flex-1 flex-row items-center">
                  <Users size={14} color="#71717A" />
                  <Text className="text-sm text-muted-foreground ml-2">{bus.currentStudents} onboard</Text>
                </View>
                <View className="flex-1 flex-row items-center">
                  <Clock size={14} color="#71717A" />
                  <Text className="text-sm text-muted-foreground ml-2">ETA: 15 min</Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Summary Card */}
        <View className="bg-primary/10 border border-primary/30 rounded-xl p-4 mt-4 mb-6">
          <Text className="text-base font-semibold text-foreground mb-3">Today's Summary</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-foreground">{buses.filter(b => b.status === 'on_trip').length}</Text>
              <Text className="text-xs text-muted-foreground">Active</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-foreground">6</Text>
              <Text className="text-xs text-muted-foreground">Completed</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">265</Text>
              <Text className="text-xs text-muted-foreground">Boarded</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-red-500">15</Text>
              <Text className="text-xs text-muted-foreground">Absent</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}