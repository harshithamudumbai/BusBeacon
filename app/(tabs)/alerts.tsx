import { AlertTriangle, Bus, CheckCircle, Clock, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { acknowledgeAlert, Alert, getAlerts } from '../../services/api-rest';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'acknowledged'>('active');

  useEffect(() => {
    loadAlerts();
  }, [filter]);



  
  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await getAlerts({ isAcknowledged: filter === 'acknowledged' });
      if (response.success && response.data) {
        setAlerts(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      const response = await acknowledgeAlert({ alertId });
      if (response.success) {
        loadAlerts();
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const getSeverityStyle = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high': return { bg: 'bg-red-500/20', border: 'border-red-500/50', icon: '#EF4444' };
      case 'medium': return { bg: 'bg-amber-500/20', border: 'border-amber-500/50', icon: '#F59E0B' };
      case 'low': return { bg: 'bg-blue-500/20', border: 'border-blue-500/50', icon: '#3B82F6' };
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'late_bus': return Bus;
      case 'no_boarding': return User;
      case 'schedule_variance': return Clock;
      default: return AlertTriangle;
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
        <Text className="text-xl font-semibold text-foreground">Alerts</Text>
        <Text className="text-sm text-muted-foreground">System notifications and warnings</Text>
      </View>

      {/* Filters */}
      <View className="flex-row px-4 py-3">
        <TouchableOpacity
          onPress={() => setFilter('active')}
          className={`flex-1 mr-2 py-3 rounded-xl items-center ${filter === 'active' ? 'bg-red-500/20 border border-red-500/50' : 'bg-secondary'}`}
        >
          <Text className={`font-medium ${filter === 'active' ? 'text-red-500' : 'text-muted-foreground'}`}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('acknowledged')}
          className={`flex-1 py-3 rounded-xl items-center ${filter === 'acknowledged' ? 'bg-green-500/20 border border-green-500/50' : 'bg-secondary'}`}
        >
          <Text className={`font-medium ${filter === 'acknowledged' ? 'text-green-500' : 'text-muted-foreground'}`}>Acknowledged</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        {alerts.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <CheckCircle size={48} color="#22C55E" />
            <Text className="text-lg font-medium text-foreground mt-4">No {filter} alerts</Text>
            <Text className="text-sm text-muted-foreground">Everything looks good!</Text>
          </View>
        ) : (
          alerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);
            const Icon = getTypeIcon(alert.type);
            
            return (
              <View key={alert.id} className={`${style.bg} border ${style.border} rounded-xl p-4 mb-3`}>
                <View className="flex-row items-start">
                  <View className={`w-10 h-10 ${style.bg} rounded-full items-center justify-center mr-3`}>
                    <Icon size={20} color={style.icon} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">{alert.title}</Text>
                    <Text className="text-sm text-muted-foreground mt-1">{alert.message}</Text>
                    <View className="flex-row items-center mt-2">
                      <Clock size={12} color="#71717A" />
                      <Text className="text-xs text-muted-foreground ml-1">
                        {new Date(alert.createdAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {!alert.isAcknowledged && (
                  <TouchableOpacity
                    onPress={() => handleAcknowledge(alert.id)}
                    className="bg-card mt-3 py-3 rounded-xl items-center"
                  >
                    <Text className="text-foreground font-semibold">Acknowledge</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}