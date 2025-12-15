import {
  CheckCircle,
  Clock,
  Hourglass,
  Phone,
  Search,
  Shuffle,
  Timer,
  XCircle
} from 'lucide-react-native';

import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { getStudents, Student } from '../../services/api-rest';
import { useFocusEffect } from '@react-navigation/native';


export default function StudentsScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'pending'>('all');
  const { user } = useAuth();

  const busId = user?.assignedBus?.id || '6';
  console.log(busId);

  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
    setIsLoading(true);
    loadStudents();
  }, [])
  );


  const loadStudents = async () => {
    try {
      let branchId = '0';
      let stopId = '0';
      const response = await getStudents({ branchId, busId, stopId });

      if (response.success && response.data) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'present' && student.attendanceStatus === 'present') ||
      (filter === 'absent' && student.attendanceStatus === 'absent') ||
      (filter === 'pending' && student.attendanceStatus === 'pending');

    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle size={20} color="#22C55E" />;
      case 'absent':
        return <XCircle size={20} color="#EF4444" />;
      case 'pending':
        return <Clock size={20} color="#F59E0B" />;
      case 'reassigned':
        return <Shuffle size={20} color="#3B82F6" />;
      case 'half_day':
        return <Hourglass size={20} color="#A855F7" />;
      default:
        return <Timer size={20} color="#71717A" />;
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
      <View className="px-4 py-4">
        <Text className="text-2xl font-semibold text-foreground">Student List</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          {students.length} students on this route
        </Text>
      </View>

      {/* Search */}
      <View className="px-4 mb-4">
        <View className="flex-row items-center bg-secondary rounded-xl px-4">
          <Search size={20} color="#71717A" />
          <TextInput
            placeholder="Search students..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 py-3 px-3 text-foreground"
            placeholderTextColor="#71717A"
          />
        </View>
      </View>

      {/* Filters */}
      <View className="flex-row px-4 mb-4 gap-2">
        {(['all', 'present', 'absent', 'pending'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            className={`px-4 py-2 rounded-full ${
              filter === f ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            <Text
              className={`text-sm font-medium capitalize ${
                filter === f ? 'text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Student List */}
      <ScrollView className="flex-1 px-4">
        {filteredStudents.map((student) => (
          <View key={student.id} className="bg-card rounded-xl p-4 mb-3">
            <View className="flex-row items-center">
              <Image
                source={{ uri: student.photoUrl || 'https://via.placeholder.com/100' }}
                className="w-12 h-12 rounded-full bg-secondary"
              />

              <View className="flex-1 ml-3">
                <Text className="text-base font-semibold text-foreground">
                  {student.name}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Class {student.class}-{student.section} • {student.stop?.name || 'No stop'}
                </Text>
              </View>

              {/* Phone + Status Icons */}
              <View className="flex-row items-center gap-3">
                {/* Call Button (Fixed Number) */}
               <TouchableOpacity
                    onPress={() => {
                      const phone = student.parent1Phone?.trim();
                      if (phone) {
                        Linking.openURL(`tel:${phone}`);
                      } else {
                        alert("No phone number available");
                       }
                      }}
                      >
                      <Phone size={22} color="#22C55E" />
               </TouchableOpacity>
                {/* Status Icon */}
                {getStatusIcon(student.attendanceStatus ?? 'absent')}
              </View>

            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
