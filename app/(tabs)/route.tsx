import { useFocusEffect } from 'expo-router';
import { ArrowRight, CheckCircle, ChevronDown, ChevronUp, MapPin, XCircle } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import {
  AttendanceStatus,
  getBusTracking,
  getStudentsByRoute,
  getTodayTrips,
  markAttendance, // Import the new API
  Stop,
  Student
} from '../../services/api-rest';

type StopWithStudents = Stop & { students: Student[] };
type StopStatus = 'completed' | 'current' | 'pending';

export default function RouteScreen() {
  const { user } = useAuth();
  const [stops, setStops] = useState<StopWithStudents[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedStopId, setExpandedStopId] = useState<string | null>(null);
  const [hoveredStopId, setHoveredStopId] = useState<string | null>(null);
  
  // LIVE TRACKING STATES
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0.0 to 1.0
  const [isLive, setIsLive] = useState(false);

  const [studentStatuses, setStudentStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [tripId, setTripId] = useState<string | null>(null);

  const routeId = user?.assignedRoute?.id || '1';

  const loadRouteData = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);

    try {
      // 1. Fetch Route Students
      const routeResponse = await getStudentsByRoute(routeId);
      
      // 2. Fetch Active Trip
      const tripResponse = await getTodayTrips();
      
      // 3. NEW: Fetch Live Bus Location & Progress
      const trackingResponse = await getBusTracking(routeId);
      //console.log(JSON.stringify(trackingResponse, null, 2));

      if (tripResponse.success && tripResponse.data?.trips) {
        const activeTrip = tripResponse.data.trips.find(t => t.status === 'active') || tripResponse.data.trips[0];
        if (activeTrip) setTripId(activeTrip.id);
      }

      if (routeResponse.success && routeResponse.data) {
        const fetchedStops = routeResponse.data.stops;
        const newStatuses: Record<string, AttendanceStatus> = {};
        fetchedStops.forEach(stop => {
          stop.students.forEach(student => {
            newStatuses[student.id] = student.attendanceStatus || 'pending';
          });
        });
        setStops(fetchedStops);
        setStudentStatuses(newStatuses);
      }

      // Handle Tracking Data
      if (trackingResponse.success && trackingResponse.data) {
        setCurrentStopIndex(trackingResponse.data.currentStopIndex);
        setProgress(trackingResponse.data.progress);
        setIsLive(trackingResponse.data.isLive);
      }

    } catch (error) {
      console.error('Failed to load route data:', error);
      if (!isSilent) Alert.alert('Error', 'Failed to load data.');
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRouteData(false);
      // Poll every 5 seconds for live movement
      const intervalId = setInterval(() => {
        loadRouteData(true);
      }, 15000);
      return () => clearInterval(intervalId);
    }, [routeId])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRouteData(true);
    setRefreshing(false);
  }, [routeId]);

  // UI Helpers
  const getStopStatus = (index: number): StopStatus => {
    if (index < currentStopIndex) return 'completed';
    if (index === currentStopIndex) return 'current';
    return 'pending';
  };

  const isStopFullyMarked = (stop: StopWithStudents): boolean => {
    if (stop.students.length === 0) return true; // Empty stops are effectively marked
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
    if (tripId) {
      try {
        await markAttendance({ tripId: tripId, studentId, status });
      } catch (error) {
        console.error("Failed to sync attendance", error);
      }
    } else {
      Alert.alert("Error", "No active trip found.");
    }
  };

  const getStopMarkerStyle = (index: number) => {
    const status = getStopStatus(index);
    const isFullyMarked = isStopFullyMarked(stops[index]);

    let style = { 
      bg: 'bg-zinc-700', 
      iconColor: '#A1A1AA', 
      Icon: MapPin,
      size: 'w-10 h-10',
      iconSize: 18
    };

    if (status === 'completed') {
      style.bg = 'bg-primary';
      style.iconColor = '#FFFFFF';
      if (isFullyMarked) style.Icon = CheckCircle;
    } else if (status === 'current') {
      style.bg = 'bg-primary';
      style.iconColor = '#FFFFFF';
      style.size = 'w-12 h-12';
      style.iconSize = 22;      
    }
    
    return style;
  };
  
  // --- HELPER: RENDER VERTICAL PROGRESS BAR ---
  const renderVerticalLine = (index: number, status: StopStatus) => {
    // Logic:
    // 1. If stop is COMPLETED (past), show full solid line
    // 2. If stop is CURRENT (we are here/departing), show PARTIAL line based on progress
    // 3. If stop is PENDING (future), show grey line

    if (status === 'completed') {
      return <View className="w-0.5 flex-1 min-h-[40px] bg-primary" />;
    }

    if (status === 'current') {
      // This is the line going from CURRENT stop to NEXT stop
      // We use flex to push the coloured part down
      return (
        <View className="w-0.5 flex-1 min-h-[40px] bg-zinc-700 relative">
          {/* Animated/Calculated Fill */}
          <View 
            style={{ height: `${progress * 100}%` }} 
            className="w-full bg-primary absolute top-0 left-0" 
          />
        </View>
      );
    }

    // Default Pending
    return <View className="w-0.5 flex-1 min-h-[40px] bg-zinc-700" />;
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#22C55E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4">
        <View className="flex-row justify-between items-center">
           <View>
             <Text className="text-2xl font-semibold text-foreground">Route</Text>
             <Text className="text-sm text-muted-foreground mt-1">
               {stops.length} stops • {isLive ? 'Live Tracking On' : 'Waiting for GPS...'}
             </Text>
           </View>
           {isLive && (
             <View className="bg-green-500/20 px-3 py-1 rounded-full animate-pulse">
               <Text className="text-primary text-xs font-bold">LIVE</Text>
             </View>
           )}
        </View>
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
                    {isCurrent ? ( <MapPin size={12} color="#fff" />) : isCompleted && isFullyMarked ? ( <CheckCircle size={10} color="#fff" />) : null}
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

      <ScrollView 
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#22C55E']} tintColor="#22C55E" />
        }
      >
        {stops.map((stop, index) => {
          const status = getStopStatus(index);
          const isExpanded = expandedStopId === stop.id;
          const markerStyle = getStopMarkerStyle(index);
          const isLast = index === stops.length - 1;
          const MarkerIcon = markerStyle.Icon;

          return (
            <View key={stop.id} className="flex-row">
              {/* TIMELINE COLUMN */}
              <View className="items-center mr-4">
                <View className={`rounded-full items-center justify-center ${markerStyle.bg} ${markerStyle.size}`}>
                  <MarkerIcon size={markerStyle.iconSize} color={markerStyle.iconColor} />
                </View>
                {/* Vertical Line Logic */}
                {!isLast && renderVerticalLine(index, status)}
              </View>

              {/* CARD COLUMN */}
              <View className="flex-1 pb-6">
                <TouchableOpacity
                  onPress={() => stop.students.length > 0 && toggleExpand(stop.id)}
                  activeOpacity={0.8}
                  className={`bg-card rounded-xl overflow-hidden ${
                    status === 'current' ? 'border-2 border-primary' : 'border border-border'
                  }`}
                >
                  <View className="p-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">{stop.name}</Text>
                        <Text className="text-sm text-muted-foreground mt-0.5">
                          {stop.scheduledPickupTime} • {stop.students.length} students
                        </Text>
                      </View>
                      
                      {stop.students.length > 0 && (
                        <View className="flex-row items-center">
                          {isExpanded ? <ChevronUp size={20} color="#71717A" /> : <ChevronDown size={20} color="#71717A" />}
                        </View>
                      )}
                    </View>
                  </View>

                  {/* STUDENT LIST (Existing Logic) */}
                  {isExpanded && stop.students.length > 0 && (
                    <View className="border-t border-border">
                      {stop.students.map((student, i) => (
                        <View key={student.id} className={`p-4 ${i < stop.students.length - 1 ? 'border-b border-border' : ''}`}>
                             <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-foreground font-medium">{student.name}</Text>
                                    <Text className="text-muted-foreground text-xs">{student.class}</Text>
                                </View>
                                {/* Attendance Buttons */}
                                <View className="flex-row gap-2">
                                  <TouchableOpacity onPress={() => handleMarkAttendance(student.id, 'present')}>
                                      <CheckCircle size={28} color={studentStatuses[student.id] === 'present' ? "#22C55E" : "#52525B"} />
                                  </TouchableOpacity>
                                  <TouchableOpacity onPress={() => handleMarkAttendance(student.id, 'absent')}>
                                      <XCircle size={28} color={studentStatuses[student.id] === 'absent' ? "#EF4444" : "#52525B"} />
                                  </TouchableOpacity>
                                </View>
                             </View>
                        </View>
                      ))}
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