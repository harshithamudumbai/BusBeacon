import { CheckCircle, ChevronRight, Clock, Search, User } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createHalfDayRequest, searchStudents, Student } from '../../services/api-rest';

export default function HalfDayScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    pickupTime: '',
    pickupBy: '',
    reason: '',
    type: 'parent_pickup' as 'parent_pickup' | 'early_leave' | 'medical',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchStudents({ query });
      if (response.success && response.data) {
        setSearchResults(response.data);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowModal(true);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !formData.pickupTime || !formData.pickupBy || !formData.reason) return;

    setIsSubmitting(true);
    try {
      const response = await createHalfDayRequest({
        studentId: selectedStudent.id,
        ...formData,
        date: new Date().toISOString().split('T')[0],
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSelectedStudent(null);
          setFormData({ pickupTime: '', pickupBy: '', reason: '', type: 'parent_pickup' });
          setSuccess(false);
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickupTypes = [
    { key: 'parent_pickup', label: 'Parent Pickup' },
    { key: 'early_leave', label: 'Early Leave' },
    { key: 'medical', label: 'Medical' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4 border-b border-border">
        <Text className="text-xl font-semibold text-foreground">Mark Half-Day</Text>
        <Text className="text-sm text-muted-foreground">Record student early pickup</Text>
      </View>

      <View className="px-4 py-4">
        {/* Search */}
        <View className="bg-secondary rounded-xl flex-row items-center px-4">
          <Search size={20} color="#71717A" />
          <TextInput
            className="flex-1 py-4 px-3 text-foreground"
            placeholder="Search student by name or roll number..."
            placeholderTextColor="#71717A"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {isSearching && <ActivityIndicator size="small" color="#22C55E" />}
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View className="bg-card rounded-xl mt-2 overflow-hidden">
            {searchResults.map((student, index) => (
              <TouchableOpacity
                key={student.id}
                onPress={() => handleSelectStudent(student)}
                className={`flex-row items-center p-4 ${index < searchResults.length - 1 ? 'border-b border-border' : ''}`}
              >
                <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center mr-3">
                  <User size={20} color="#22C55E" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">{student.name}</Text>
                  <Text className="text-sm text-muted-foreground">
                    Class {student.class}-{student.section} • Roll #{student.rollNumber}
                  </Text>
                </View>
                <ChevronRight size={18} color="#71717A" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Recent Half-Days */}
      <ScrollView className="flex-1 px-4">
        <Text className="text-lg font-semibold text-foreground mb-4">Recent Requests</Text>
        
        <View className="bg-card rounded-xl p-4 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-amber-500/20 rounded-full items-center justify-center mr-3">
                <Clock size={20} color="#F59E0B" />
              </View>
              <View>
                <Text className="text-base font-medium text-foreground">Priya Patel</Text>
                <Text className="text-sm text-muted-foreground">Parent Pickup • 12:30 PM</Text>
              </View>
            </View>
            <View className="bg-amber-500/20 px-2 py-1 rounded-full">
              <Text className="text-xs font-medium text-amber-500">Pending</Text>
            </View>
          </View>
        </View>

        <View className="bg-card rounded-xl p-4 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-green-500/20 rounded-full items-center justify-center mr-3">
                <CheckCircle size={20} color="#22C55E" />
              </View>
              <View>
                <Text className="text-base font-medium text-foreground">Rahul Verma</Text>
                <Text className="text-sm text-muted-foreground">Medical • 11:00 AM</Text>
              </View>
            </View>
            <View className="bg-green-500/20 px-2 py-1 rounded-full">
              <Text className="text-xs font-medium text-green-500">Approved</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Half-Day Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-card rounded-t-3xl p-6 max-h-[80%]">
            {success ? (
              <View className="items-center py-8">
                <View className="w-20 h-20 bg-green-500/20 rounded-full items-center justify-center mb-4">
                  <CheckCircle size={40} color="#22C55E" />
                </View>
                <Text className="text-xl font-semibold text-foreground">Request Submitted</Text>
                <Text className="text-sm text-muted-foreground mt-2">Awaiting TM approval</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-xl font-semibold text-foreground mb-2">Half-Day Request</Text>
                {selectedStudent && (
                  <View className="bg-secondary rounded-xl p-3 mb-4">
                    <Text className="text-base font-medium text-foreground">{selectedStudent.name}</Text>
                    <Text className="text-sm text-muted-foreground">
                      Class {selectedStudent.class}-{selectedStudent.section} • Bus: {selectedStudent.busId}
                    </Text>
                  </View>
                )}

                {/* Pickup Type */}
                <Text className="text-sm font-medium text-foreground mb-2">Pickup Type</Text>
                <View className="flex-row mb-4">
                  {pickupTypes.map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      onPress={() => setFormData({ ...formData, type: type.key as any })}
                      className={`flex-1 mx-1 py-3 rounded-xl items-center ${formData.type === type.key ? 'bg-primary' : 'bg-secondary'}`}
                    >
                      <Text className={`text-xs font-medium ${formData.type === type.key ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Pickup Time */}
                <Text className="text-sm font-medium text-foreground mb-2">Pickup Time</Text>
                <TextInput
                  className="bg-secondary text-foreground rounded-xl p-4 mb-4"
                  placeholder="e.g., 12:30 PM"
                  placeholderTextColor="#71717A"
                  value={formData.pickupTime}
                  onChangeText={(text) => setFormData({ ...formData, pickupTime: text })}
                />

                {/* Pickup By */}
                <Text className="text-sm font-medium text-foreground mb-2">Pickup By</Text>
                <TextInput
                  className="bg-secondary text-foreground rounded-xl p-4 mb-4"
                  placeholder="e.g., Mother, Father, Guardian"
                  placeholderTextColor="#71717A"
                  value={formData.pickupBy}
                  onChangeText={(text) => setFormData({ ...formData, pickupBy: text })}
                />

                {/* Reason */}
                <Text className="text-sm font-medium text-foreground mb-2">Reason</Text>
                <TextInput
                  className="bg-secondary text-foreground rounded-xl p-4 mb-6"
                  placeholder="Enter reason for early pickup..."
                  placeholderTextColor="#71717A"
                  value={formData.reason}
                  onChangeText={(text) => setFormData({ ...formData, reason: text })}
                  multiline
                  numberOfLines={3}
                />

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-secondary py-4 rounded-xl items-center"
                    onPress={() => {
                      setShowModal(false);
                      setSelectedStudent(null);
                    }}
                  >
                    <Text className="text-foreground font-semibold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-primary py-4 rounded-xl items-center"
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text className="text-primary-foreground font-semibold">Submit</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}