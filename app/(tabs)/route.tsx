import { useFocusEffect } from 'expo-router';
import { ArrowRight, CheckCircle, ChevronDown, ChevronUp, Clock, MapPin, RefreshCw, UserMinus, XCircle } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { AttendanceStatus, getStudentsByRoute, getTodayTrips, markAttendance, Stop, Student } from '../../services/api-rest';

type StopWithStudents = Stop & { students: Student[] };
type StopStatus = 'completed' | 'current' | 'pending';

export default function RouteScreen() {
  const { user } = useAuth();
  const [stops, setStops] = useState<StopWithStudents[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Initial load only
  const [refreshing, setRefreshing] = useState(false); // For Pull-to-refresh
  const [expandedStopId, setExpandedStopId] = useState<string | null>(null);
  const [hoveredStopId, setHoveredStopId] = useState<string | null>(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(4);
  const [studentStatuses, setStudentStatuses] = useState<Record<string, AttendanceStatus>>({});
  
  // NEW: State to store the actual active trip ID
  const [tripId, setTripId] = useState<string | null>(null);

  const routeId = user?.assignedRoute?.id || '1';

  // --- DATA LOADING LOGIC ---

  const loadRouteData = async (isSilent = false) => {
    // Only show loading spinner if it's NOT a silent update (background poll)
    if (!isSilent) setIsLoading(true);

    try {
      // 1. Fetch Route & Students (API returns status now!)
      const routeResponse = await getStudentsByRoute(routeId);
      
      // 2. Fetch Active Trip ID (to enable marking)
      const tripResponse = await getTodayTrips();
      
      if (tripResponse.success && tripResponse.data?.trips) {
        const activeTrip = tripResponse.data.trips.find(t => t.status === 'active') || tripResponse.data.trips[0];
        if (activeTrip) {
          setTripId(activeTrip.id);
        }
      }

      if (routeResponse.success && routeResponse.data) {
        const fetchedStops = routeResponse.data.stops;
        const newStatuses: Record<string, AttendanceStatus> = {};

        fetchedStops.forEach(stop => {
          stop.students.forEach(student => {
            // API now returns the correct status directly
            newStatuses[student.id] = student.attendanceStatus || 'pending';
          });
        });

        setStops(fetchedStops);
        setStudentStatuses(newStatuses);
      }
    } catch (error) {
      console.error('Failed to load route data:', error);
      if (!isSilent) Alert.alert('Error', 'Failed to load data.');
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  // --- POLLING & LIFECYCLE ---

  useFocusEffect(
    useCallback(() => {
      // 1. Initial Load (Shows Spinner)
      loadRouteData(false);

      // 2. Start Polling every 5 seconds (Silent - No Spinner)
      const intervalId = setInterval(() => {
        loadRouteData(true);
      }, 15000);

      // Cleanup when screen loses focus
      return () => clearInterval(intervalId);
    }, [routeId])
  );

  // --- PULL TO REFRESH ---

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Force at least 0.5s delay for visual feedback
    const minDelay = new Promise(resolve => setTimeout(resolve, 500));
    const loadData = loadRouteData(true); // Pass true to avoid double spinners
    
    await Promise.all([minDelay, loadData]);
    setRefreshing(false);
  }, [routeId]);


  // --- UI HELPERS ---

  const getStopStatus = (index: number): StopStatus => {
    if (index < currentStopIndex) return 'completed';
    if (index === currentStopIndex) return 'current';
    return 'pending';
  };

  const isStopFullyMarked = (stop: StopWithStudents): boolean => {
    if (stop.students.length === 0) return false;
    return stop.students.every(student => {
      const status = studentStatuses[student.id];
      return status && status !== 'pending';
    });
  };

  const toggleExpand = (stopId: string) => {
    setExpandedStopId(expandedStopId === stopId ? null : stopId);
  };

  const handleMarkAttendance = async (studentId: string, status: AttendanceStatus) => {
    // 1. Optimistic UI Update
    setStudentStatuses(prev => ({ ...prev, [studentId]: status }));

    // 2. API Call with actual Trip ID
    if (tripId) {
      try {
        console.log(`Marking: Trip ${tripId}, Student ${studentId}, Status ${status}`);
        await markAttendance({ tripId: tripId, studentId, status });
        // Background poll will confirm this status in <5s
      } catch (error) {
        console.error("Failed to sync attendance", error);
        Alert.alert("Sync Failed", "Could not save attendance. Please try again.");
      }
    } else {
      Alert.alert("Error", "No active trip found. Cannot mark attendance.");
    }
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

/*  const getStopMarkerStyle = (index: number) => {
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
*/
  const getStopMarkerStyle = (index: number) => {
    const status = getStopStatus(index);
    const isFullyMarked = isStopFullyMarked(stops[index]);
    //console.log('index : '+index+' | isStopFullyMarked : '+isFullyMarked);

    // Default Pending Style
    let style = { 
      bg: 'bg-zinc-700', 
      iconColor: '#A1A1AA', 
      Icon: MapPin,
      size: 'w-10 h-10', // Default size
      iconSize: 18
    };

    if (status === 'completed') {
      style.bg = 'bg-primary';
      style.iconColor = '#FFFFFF';
      // If fully marked, show CheckCircle instead of MapPin
      if (isFullyMarked) {
        style.Icon = CheckCircle;
      }
    } else if (status === 'current') {
      style.bg = 'bg-primary';
      style.iconColor = '#FFFFFF';
      style.size = 'w-12 h-12'; // Slightly larger for current stop
      style.iconSize = 22;      // Larger icon
    }
    
    return style;
  };

  // Only show full screen loader on INITIAL load
  if (isLoading && !refreshing) {
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

      {/* Horizontal Progress Bar */}
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
                  <TouchableOpacity
                    onPress={() => {
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
          
          <View className="flex-row justify-between mt-2">
            <Text className="text-[10px] text-muted-foreground">Trip Start</Text>
            <Text className="text-[10px] text-muted-foreground">School</Text>
          </View>
        </View>
      </View>

      {/* Vertical Timeline - Wrapped with ScrollView & RefreshControl */}
      <ScrollView 
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#22C55E']} // Android Spinner Color
            tintColor="#22C55E"  // iOS Spinner Color
          />
        }
      >
        {stops.map((stop, index) => {
          const status = getStopStatus(index);
          const isExpanded = expandedStopId === stop.id;
          const markerStyle = getStopMarkerStyle(index);
          const isLast = index === stops.length - 1;
          const isFullyMarked = isStopFullyMarked(stop);
          const MarkerIcon = markerStyle.Icon;

          return (
            <View key={stop.id} className="flex-row">
              <View className="items-center mr-4">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${markerStyle.bg}`}
                >
                  <MarkerIcon size={markerStyle.iconSize} color={markerStyle.iconColor} />
                </View>
                {!isLast && (
                  <View className={`w-0.5 flex-1 min-h-[20px] ${status === 'completed' ? 'bg-primary' : 'bg-zinc-700'}`} />
                )}
              </View>

              <View className="flex-1 pb-4">
                <TouchableOpacity
                  onPress={() => stop.students.length > 0 && toggleExpand(stop.id)}
                  className={`bg-card rounded-xl overflow-hidden ${
                    status === 'current' ? 'border-2 border-primary' : 'border border-border'
                  }`}
                >
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
                              <Image
                                source={{ uri: student.photoUrl || 'https://via.placeholder.com/100' }}
                                className="w-10 h-10 rounded-full bg-secondary"
                              />
                              <View className="flex-1 ml-3">
                                <Text className="text-sm font-medium text-foreground">
                                  {student.name}
                                </Text>
                                <Text className="text-xs text-muted-foreground">
                                  Class {student.class}-{student.section}
                                </Text>
                              </View>

                              <View className="flex-row items-center gap-2">
                                <TouchableOpacity
                                  onPress={() => handleMarkAttendance(student.id, 'present')}
                                  className={`w-9 h-9 rounded-full items-center justify-center ${
                                    currentStatus === 'present' ? 'bg-green-500/20' : 'bg-zinc-800'
                                  }`}
                                >
                                  <CheckCircle
                                    size={currentStatus === 'present' ? 30 : 24}
                                    color={currentStatus === 'present' ? '#22C55E' : '#52525B'}
                                    strokeWidth={currentStatus === 'present' ? 2 : 2}
                                  />
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => handleMarkAttendance(student.id, 'absent')}
                                  className={`w-9 h-9 rounded-full items-center justify-center ${
                                    currentStatus === 'absent' ? 'bg-red-500/20' : 'bg-zinc-800'
                                  }`}
                                >
                                  <XCircle
                                    size={currentStatus === 'absent' ? 30 : 24}
                                    color={currentStatus === 'absent' ? '#EF4444' : '#52525B'}
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