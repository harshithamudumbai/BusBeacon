import { AlertTriangle, Bus, MapPin, Phone, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bus as BusType, getBuses } from '../../services/api';

export default function BusesScreen() {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'idle' | 'maintenance'>('all');

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    try {
      const response = await getBuses();
      if (response.success && response.data) {
        setBuses(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBuses = buses.filter(bus => {
    if (filter === 'all') return true;
    if (filter === 'active') return bus.status === 'on_trip';
    if (filter === 'idle') return bus.status === 'idle';
    if (filter === 'maintenance') return bus.status === 'maintenance';
    return true;
  });

  const getStatusStyle = (status: BusType['status']) => {
    switch (status) {
      case 'on_trip': return { bg: 'bg-green-500/20', text: 'text-green-500', label: 'On Trip' };
      case 'idle': return { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'Idle' };
      case 'maintenance': return { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Maintenance' };
    }
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'idle', label: 'Idle' },
    { key: 'maintenance', label: 'Maintenance' },
  ];

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
        <Text className="text-xl font-semibold text-foreground">Buses</Text>
        <Text className="text-sm text-muted-foreground">Manage fleet and routes</Text>
      </View>

      {/* Filters */}
      <View className="flex-row px-4 mb-4 gap-2">

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key as any)}
              className={`mr-2 px-4 py-2 rounded-full ${filter === f.key ? 'bg-primary' : 'bg-secondary'}`}
            >
              <Text className={`text-sm font-medium ${filter === f.key ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4">
        {filteredBuses.map((bus) => {
          const statusStyle = getStatusStyle(bus.status);
          
          return (
            <View key={bus.id} className="bg-card rounded-xl p-4 mb-3">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className={`w-12 h-12 ${statusStyle.bg} rounded-full items-center justify-center mr-3`}>
                    <Bus size={24} color={bus.status === 'on_trip' ? '#22C55E' : bus.status === 'idle' ? '#3B82F6' : '#EF4444'} />
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-foreground">{bus.number}</Text>
                    <Text className="text-sm text-muted-foreground">Route: R-{bus.routeId?.split('_')[1] || 'N/A'}</Text>
                  </View>
                </View>
                <View className={`${statusStyle.bg} px-3 py-1 rounded-full`}>
                  <Text className={`text-xs font-medium ${statusStyle.text}`}>{statusStyle.label}</Text>
                </View>
              </View>

              <View className="flex-row flex-wrap">
                <View className="flex-row items-center w-1/2 mb-2">
                  <Users size={14} color="#71717A" />
                  <Text className="text-sm text-muted-foreground ml-2">{bus.currentStudents}/{bus.capacity} Students</Text>
                </View>
                <View className="flex-row items-center w-1/2 mb-2">
                  <MapPin size={14} color="#71717A" />
                  <Text className="text-sm text-muted-foreground ml-2">{bus.route?.stops?.length || 0} Stops</Text>
                </View>
                <View className="flex-row items-center w-1/2">
                  <Phone size={14} color="#71717A" />
                  <Text className="text-sm text-muted-foreground ml-2">{bus.driverName}</Text>
                </View>
                {bus.lateCount >= 3 && (
                  <View className="flex-row items-center w-1/2">
                    <AlertTriangle size={14} color="#EF4444" />
                    <Text className="text-sm text-red-500 ml-2">Late {bus.lateCount}x</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}