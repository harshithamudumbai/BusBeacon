import { Bus, Clock, Download, FileText, Users } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const reports = [
    { id: 'attendance', title: 'Attendance Report', description: 'Student bus attendance summary', icon: Users, color: '#22C55E' },
    { id: 'late', title: 'Late Bus Report', description: 'Buses with schedule variance', icon: Clock, color: '#F59E0B' },
    { id: 'route', title: 'Route Performance', description: 'Route efficiency analysis', icon: Bus, color: '#3B82F6' },
    { id: 'approval', title: 'Approval History', description: 'Route changes & half-day requests', icon: FileText, color: '#A855F7' },
  ];

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4 border-b border-border">
        <Text className="text-xl font-semibold text-foreground">Reports</Text>
        <Text className="text-sm text-muted-foreground">Generate and download reports</Text>
      </View>

      {/* Period Selection */}
      <View className="flex-row px-4 py-3">
        {periods.map((p) => (
          <TouchableOpacity
            key={p.key}
            onPress={() => setSelectedPeriod(p.key as any)}
            className={`flex-1 mx-1 py-3 rounded-xl items-center ${selectedPeriod === p.key ? 'bg-primary' : 'bg-secondary'}`}
          >
            <Text className={`text-sm font-medium ${selectedPeriod === p.key ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 px-4">
        <Text className="text-lg font-semibold text-foreground mb-4 mt-2">Available Reports</Text>

        {reports.map((report) => (
          <TouchableOpacity key={report.id} className="bg-card rounded-xl p-4 mb-3">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: `${report.color}20` }}>
                <report.icon size={24} color={report.color} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">{report.title}</Text>
                <Text className="text-sm text-muted-foreground">{report.description}</Text>
              </View>
              <View className="w-10 h-10 bg-secondary rounded-full items-center justify-center">
                <Download size={18} color="#71717A" />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Quick Stats */}
        <Text className="text-lg font-semibold text-foreground mb-4 mt-6">Quick Stats ({periods.find(p => p.key === selectedPeriod)?.label})</Text>
        
        <View className="flex-row flex-wrap -mx-1.5">
          <View className="w-1/2 px-1.5 mb-3">
            <View className="bg-card rounded-xl p-4">
              <Text className="text-2xl font-bold text-foreground">98%</Text>
              <Text className="text-sm text-muted-foreground">Attendance Rate</Text>
            </View>
          </View>
          <View className="w-1/2 px-1.5 mb-3">
            <View className="bg-card rounded-xl p-4">
              <Text className="text-2xl font-bold text-foreground">12</Text>
              <Text className="text-sm text-muted-foreground">Trips Completed</Text>
            </View>
          </View>
          <View className="w-1/2 px-1.5 mb-3">
            <View className="bg-card rounded-xl p-4">
              <Text className="text-2xl font-bold text-amber-500">3</Text>
              <Text className="text-sm text-muted-foreground">Late Buses</Text>
            </View>
          </View>
          <View className="w-1/2 px-1.5 mb-3">
            <View className="bg-card rounded-xl p-4">
              <Text className="text-2xl font-bold text-foreground">5</Text>
              <Text className="text-sm text-muted-foreground">Approvals</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}