import {
    CheckCircle,
    Clock,
    Hourglass,
    Search,
    Shuffle,
    Timer,
    XCircle
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStudents, Student } from '../../services/api-rest';

export default function StudentsScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  //const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'pending'>('all');

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await getStudents();
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
      //(filter === 'present' && student.attendanceStatus === 'present') ||
      //(filter === 'absent' && student.attendanceStatus === 'absent');
      (filter === 'present' && student.attendanceStatus === 'present') ||
      (filter === 'absent' && student.attendanceStatus === 'absent') ||
      (filter === 'pending' && student.attendanceStatus === 'pending');
    return matchesSearch && matchesFilter;
  });

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'present':
      return <CheckCircle size={20} color="#22C55E" />; // green

    case 'absent':
      return <XCircle size={20} color="#EF4444" />; // red

    case 'pending':
      return <Clock size={20} color="#F59E0B" />; // yellow

    case 'reassigned':
      return <Shuffle size={20} color="#3B82F6" />; // blue

    case 'half_day':
      return <Hourglass size={20} color="#A855F7" />; // purple

    default:
      return <Timer size={20} color="#71717A" />; // fallback grey
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
        {/*(['all', 'present', 'absent'] as const).map((f) => ( */
        (['all', 'present', 'absent', 'pending'] as const).map((f) => (
  
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
              <View>
                {getStatusIcon(student.attendanceStatus ?? 'absent')}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
