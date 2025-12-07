import { ArrowRight, CheckCircle, ChevronDown, ChevronUp, Clock, MapPin, RefreshCw, UserMinus, XCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { AttendanceStatus, getStudentsByRoute, Stop, Student } from '../../services/api';

type StopWithStudents = Stop & { students: Student[] };

// Status for each stop: completed (bus passed), current (bus is here), pending (bus hasn't arrived)
type StopStatus = 'completed' | 'current' | 'pending';

export default function RouteScreen() {
  const { user } = useAuth();
  const [stops, setStops] = useState<StopWithStudents[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStopId, setExpandedStopId] = useState<string | null>(null);
  const [hoveredStopId, setHoveredStopId] = useState<string | null>(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(2); // Simulating current stop at index 2
  const [studentStatuses, setStudentStatuses] = useState<Record<string, AttendanceStatus>>({});

  // Get route ID from user's assigned route
  const routeId = user?.assignedRoute?.id || 'route_12';

  useEffect(() => {
    loadRouteData();
  }, [routeId]);

  const loadRouteData = async () => {
    try {
      const response = await getStudentsByRoute(routeId);
      if (response.success && response.data) {
        setStops(response.data.stops);
        // Initialize student statuses from their current attendance status
        const initialStatuses: Record<string, AttendanceStatus> = {};
        response.data.stops.forEach(stop => {
          stop.students.forEach(student => {
            initialStatuses[student.id] = student.attendanceStatus || 'pending';
          });
        });
        setStudentStatuses(initialStatuses);
      }
    } catch (error) {
      console.error('Failed to load route data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStopStatus = (index: number): StopStatus => {
    if (index < currentStopIndex) return 'completed';
    if (index === currentStopIndex) return 'current';
    return 'pending';
  };

  const isStopFullyMarked = (stop: StopWithStudents): boolean => {
    return stop.students.every(student => {
      const status = studentStatuses[student.id];
      return status && status !== 'pending';
    });
  };

  const toggleExpand = (stopId: string) => {
    setExpandedStopId(expandedStopId === stopId ? null : stopId);
  };

  const handleMarkAttendance = async (studentId: string, status: AttendanceStatus) => {
    setStudentStatuses(prev => ({ ...prev, [studentId]: status }));
    // API call (commented for now, using local state)
    // await markAttendance({ tripId: 'current_trip', studentId, status });
  };

  const getStatusIcon = (status: AttendanceStatus, size: number = 24) => {
    switch (status) {
      case 'present':
        return <CheckCircle size={size} color="#22C55E" fill="#22C55E" />;
      case 'absent':
        return <XCircle size={size} color="#EF4444" fill="#EF4444" />;
      case 'half_day':
        return <UserMinus size={size} color="#F59E0B" />;
      case 'reassigned':
        return <RefreshCw size={size} color="#3B82F6" />;
      default:
        return <Clock size={size} color="#52525B" />;
    }
  };

  const getStopMarkerStyle = (index: number) => {
    const status = getStopStatus(index);
    const isFullyMarked = isStopFullyMarked(stops[index]);
    
    if (status === 'completed' && isFullyMarked) {
      return { bg: 'bg-primary', iconColor: '#FFFFFF' };
    }
    if (status === 'current') {
      return { bg: 'bg-primary', iconColor: '#FFFFFF' };
    }
    return { bg: 'bg-zinc-700', iconColor: '#A1A1AA' };
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
      {/* Header */}
      <View className="px-4 py-4">
        <Text className="text-2xl font-semibold text-foreground">Route</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          Morning Pickup • {stops.length} stops
        </Text>
      </View>

      {/* Horizontal Progress Bar - 20% height */}
      <View className="px-4 mb-4" style={{ height: '12%' }}>
        <View className="flex-1 justify-center">
          <View className="flex-row items-center">
            {stops.map((stop, index) => {
              const status = getStopStatus(index);
              const isLast = index === stops.length - 1;
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';
              const isFullyMarked = isStopFullyMarked(stop);
              
              return (
                <View key={stop.id} className="flex-row items-center flex-1">
                  {/* Stop Dot */}
                  <TouchableOpacity
                    //onPress={() => setHoveredStopId(hoveredStopId === stop.id ? null : stop.id)}
                    onPress={() => {
                      // Toggle tooltip and sync with vertical timeline expansion
                      if (hoveredStopId === stop.id) {
                        setHoveredStopId(null);
                        setExpandedStopId(null);
                      } else {
                        setHoveredStopId(stop.id);
                        if (stop.students.length > 0) {
                          setExpandedStopId(stop.id);
                        }
                      }
                    }}

                    className="relative"
                  >
                    <View
                      className={`rounded-full items-center justify-center ${
                        isCurrent
                          ? 'w-6 h-6 bg-primary'
                          : isCompleted && isFullyMarked
                          ? 'w-4 h-4 bg-primary'
                          : 'w-3 h-3 bg-zinc-600'
                      }`}
                    >
                      {isCurrent && <MapPin size={12} color="#fff" />}
                    </View>
                    
                    {/* Tooltip on click */}
                    {hoveredStopId === stop.id && (
                      <View className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-3 py-1.5 z-10 min-w-[120px]">
                        <Text className="text-xs text-foreground text-center" numberOfLines={1}>
                          {stop.name}
                        </Text>
                        <Text className="text-[10px] text-muted-foreground text-center">
                          {stop.scheduledPickupTime}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Connecting Line with Arrow */}
                  {!isLast && (
                    <View className="flex-1 flex-row items-center mx-1">
                      <View
                        className={`flex-1 ${
                          isCompleted ? 'h-1 bg-primary' : 'h-0.5 bg-zinc-600'
                        }`}
                      />
                      {index === currentStopIndex - 1 && (
                        <ArrowRight size={12} color="#22C55E" className="mx-0.5" />
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          
          {/* Labels for first and last stop */}
          <View className="flex-row justify-between mt-2">
            <Text className="text-[10px] text-muted-foreground">Trip Start</Text>
            <Text className="text-[10px] text-muted-foreground">School</Text>
          </View>
        </View>
      </View>

      {/* Vertical Timeline with Expandable Stops */}
      <ScrollView className="flex-1 px-4">
        {stops.map((stop, index) => {
          const status = getStopStatus(index);
          const isExpanded = expandedStopId === stop.id;
          const markerStyle = getStopMarkerStyle(index);
          const isLast = index === stops.length - 1;
          const isFullyMarked = isStopFullyMarked(stop);

          return (
            <View key={stop.id} className="flex-row">
              {/* Timeline */}
              <View className="items-center mr-4">
                {/* Stop Marker */}
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${markerStyle.bg}`}
                >
                  <MapPin size={18} color={markerStyle.iconColor} />
                </View>
                
                {/* Connecting Line */}
                {!isLast && (
                  <View
                    className={`w-0.5 flex-1 min-h-[20px] ${
                      status === 'completed' && isFullyMarked ? 'bg-primary' : 'bg-zinc-700'
                    }`}
                  />
                )}
              </View>

              {/* Stop Card */}
              <View className="flex-1 pb-4">
                <TouchableOpacity
                  onPress={() => stop.students.length > 0 && toggleExpand(stop.id)}
                  className={`bg-card rounded-xl overflow-hidden ${
                    status === 'current' ? 'border-2 border-primary' : 'border border-border'
                  }`}
                >
                  {/* Stop Header */}
                  <View className="p-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {stop.name}
                        </Text>
                        <Text className="text-sm text-muted-foreground mt-0.5">
                          {stop.scheduledPickupTime} • {stop.students.length} students
                        </Text>
                      </View>
                      
                      {stop.students.length > 0 && (
                        <View className="flex-row items-center">
                          {status === 'current' && (
                            <View className="bg-primary/20 px-2 py-1 rounded-full mr-2">
                              <Text className="text-xs text-primary font-medium">Current</Text>
                            </View>
                          )}
                          {isExpanded ? (
                            <ChevronUp size={20} color="#71717A" />
                          ) : (
                            <ChevronDown size={20} color="#71717A" />
                          )}
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Expanded Student List */}
                  {isExpanded && stop.students.length > 0 && (
                    <View className="border-t border-border">
                      {stop.students.map((student, studentIndex) => {
                        const currentStatus = studentStatuses[student.id] || 'pending';
                        
                        return (
                          <View
                            key={student.id}
                            className={`p-4 ${
                              studentIndex < stop.students.length - 1 ? 'border-b border-border' : ''
                            }`}
                          >
                            <View className="flex-row items-center">
                              {/* Student Avatar */}
                              <Image
                                source={{ uri: student.photoUrl || 'https://via.placeholder.com/100' }}
                                className="w-10 h-10 rounded-full bg-secondary"
                              />
                              
                              {/* Student Info */}
                              <View className="flex-1 ml-3">
                                <Text className="text-sm font-medium text-foreground">
                                  {student.name}
                                </Text>
                                <Text className="text-xs text-muted-foreground">
                                  Class {student.class}-{student.section}
                                </Text>
                              </View>

                              {/* Attendance Buttons */}
                              <View className="flex-row items-center gap-2">
                                <TouchableOpacity
                                  onPress={() => handleMarkAttendance(student.id, 'present')}
                                  className={`w-9 h-9 rounded-full items-center justify-center ${
                                    currentStatus === 'present' ? 'bg-green-500/20' : 'bg-zinc-800'
                                  }`}
                                >
                                  <CheckCircle
                                    size={20}
                                    color={currentStatus === 'present' ? '#22C55E' : '#52525B'}
                                    fill={currentStatus === 'present' ? '#22C55E' : 'transparent'}
                                  />
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => handleMarkAttendance(student.id, 'absent')}
                                  className={`w-9 h-9 rounded-full items-center justify-center ${
                                    currentStatus === 'absent' ? 'bg-red-500/20' : 'bg-zinc-800'
                                  }`}
                                >
                                  <XCircle
                                    size={20}
                                    color={currentStatus === 'absent' ? '#EF4444' : '#52525B'}
                                    fill={currentStatus === 'absent' ? '#EF4444' : 'transparent'}
                                  />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
