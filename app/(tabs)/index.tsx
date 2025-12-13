import { router } from 'expo-router';
import { AlertTriangle, Bell, Building, Bus, CheckCircle, ChevronRight, Clock, MapPin, RefreshCw, Settings, User, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardStats, getDashboardStats, getTodayTrips, ROLE_LABELS, TodayTrips } from '../../services/api-rest';
//import { isFirstTime, setFirstTimeComplete } from '../../services/storage';
import { clearShowWelcome, shouldShowWelcome } from '../../services/storage';


// Attender Home Screen
function AttenderHome() {
  const { user,selectedRole } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [tripsData, setTripsData] = useState<TodayTrips | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    //checkFirstTime();
    checkShowWelcome();
    loadTripsData();
  }, []);

    /*  
    const checkFirstTime = async () => {
    const firstTime = await isFirstTime();
    if (firstTime) {
      setShowWelcome(true);
      await setFirstTimeComplete();
    }
  };
  */
  const checkShowWelcome = async () => {
    const show = await shouldShowWelcome();
    if (show) {
      setShowWelcome(true);
      await clearShowWelcome();
    }
  };

  const loadTripsData = async () => {
    try {
      const response = await getTodayTrips();
      if (response.success && response.data) {
        setTripsData(response.data);
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickupTrip = tripsData?.trips.find(t => t.type === 'pickup');
  const dropoffTrip = tripsData?.trips.find(t => t.type === 'dropoff');

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#22C55E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Modal visible={showWelcome} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-card rounded-3xl p-8 w-full max-w-sm items-center">
            <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-6">
              <Text className="text-4xl">🚌</Text>
            </View>
            <Text className="text-xl font-semibold text-foreground mb-2">Welcome to BusBeacon!</Text>
            <Text className="text-sm text-muted-foreground text-center mb-6">Your companion for safe and efficient school bus management.</Text>
            <TouchableOpacity onPress={() => setShowWelcome(false)} className="bg-primary w-full py-3 rounded-xl items-center">
              <Text className="text-primary-foreground font-semibold">Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <ScrollView className="flex-1 px-4">
        <View className="flex-row items-center justify-between py-4">
          <TouchableOpacity onPress={() => router.push('/profile')} className="w-10 h-10 bg-secondary rounded-full items-center justify-center mr-3">
              <User size={20} color="#FAFAFA" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">Hello, {user?.name || 'User'}  </Text>
            {selectedRole && (<Text className="text-sm text-muted-foreground"> {ROLE_LABELS[selectedRole]}</Text>)}
          </View>
          <TouchableOpacity onPress={() => router.push('/notifications')} className="w-10 h-10 bg-secondary rounded-full items-center justify-center">
            <Bell size={20} color="#FAFAFA" />
          </TouchableOpacity>
        </View>
        {/*
        <TouchableOpacity onPress={() => router.push('/profile')} className="bg-card rounded-2xl p-4 mb-6">
          <View className="flex-row items-center">
            <Image source={{ uri: user?.avatar || 'https://via.placeholder.com/60' }} className="w-14 h-14 rounded-full bg-secondary" />
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-foreground">{user?.name || 'John Doe'}</Text>
              <Text className="text-sm text-muted-foreground">Route: {user?.assignedRoute?.code || 'R-12'} • Bus: {user?.assignedBus?.number || 'KA-01-1234'}</Text>
            </View>
            <ChevronRight size={20} color="#71717A" />
          </View>
        </TouchableOpacity>
        */}
        <View className="flex-row w-full justify-between mt-6">
          <View className="bg-card rounded-2xl p-4 flex-1 mr-3 border border-border/50">
            <Text className="text-xs text-muted-foreground mb-1 font-medium">ROUTE NUMBER</Text>
            <Text className="text-xl font-bold text-foreground mt-1">{user?.assignedRoute?.code || '11'}</Text>
          </View>
          <View className="bg-card rounded-2xl p-4 flex-1 border border-border/50">
            <Text className="text-xs text-muted-foreground mb-1 font-medium">BUS NUMBER</Text>
            <Text className="text-xl font-bold text-foreground mt-1">{user?.assignedBus?.number || 'TS09 EK 3274'}</Text>
          </View>
        </View>

        <View className="flex-row w-full justify-between mt-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Start Today's Service</Text>
        </View>

        <View className="bg-card rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm text-muted-foreground">{tripsData?.date || 'Today'}</Text>
            <View className="bg-primary/20 px-3 py-1 rounded-full">
              <Text className="text-xs text-primary font-medium">{tripsData?.hasActiveTrip ? 'Trip Active' : 'No Active Trip'}</Text>
            </View>
          </View>

          {/* Pickup Card */}
          <View className="bg-secondary rounded-xl p-4 mb-3">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-foreground">Morning Pick-up</Text>
              <View className="flex-row items-center">
                <Clock size={14} color="#71717A" />
                <Text className="text-sm text-muted-foreground ml-1">{pickupTrip?.startTime || '7:00 AM'}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MapPin size={14} color="#71717A" />
                <Text className="text-sm text-muted-foreground ml-1">{pickupTrip?.stops || 0} Stops</Text>
              </View>
              <View className="flex-row items-center">
                <Users size={14} color="#71717A" />
                <Text className="text-sm text-muted-foreground ml-1">{pickupTrip?.totalStudents || 0} Students</Text>
              </View>
            </View>
            <TouchableOpacity className="bg-primary mt-4 py-3 rounded-xl items-center">
              <Text className="text-primary-foreground font-semibold">Start Pick-up</Text>
            </TouchableOpacity>
          </View>

          {/* Dropoff Card */}
          <View className="bg-secondary rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-foreground">Afternoon Drop-off</Text>
              <View className="flex-row items-center">
                <Clock size={14} color="#71717A" />
                <Text className="text-sm text-muted-foreground ml-1">{dropoffTrip?.startTime || '3:30 PM'}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MapPin size={14} color="#71717A" />
                <Text className="text-sm text-muted-foreground ml-1">{dropoffTrip?.stops || 0} Stops</Text>
              </View>
              <View className="flex-row items-center">
                <Users size={14} color="#71717A" />
                <Text className="text-sm text-muted-foreground ml-1">{dropoffTrip?.totalStudents || 0} Students</Text>
              </View>
            </View>
            <TouchableOpacity className="bg-secondary border border-border mt-4 py-3 rounded-xl items-center">
              <Text className="text-foreground font-semibold">Start Drop-off</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Transport Manager Dashboard
function TMDashboard() {
  const { user, switchRole, hasMultipleRoles } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
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
      <ScrollView className="flex-1 px-4">
        <View className="flex-row items-center justify-between py-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.push('/profile')} className="w-10 h-10 bg-secondary rounded-full items-center justify-center mr-3">
              <User size={20} color="#FAFAFA" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">Hello, {user?.name || 'User'}</Text>
          </View>
          <View className="flex-row">
            {hasMultipleRoles && (
              <TouchableOpacity onPress={switchRole} className="w-10 h-10 bg-blue-600/20 rounded-full items-center justify-center mr-2">
                <RefreshCw size={18} color="#3B82F6" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => router.push('/notifications')} className="w-10 h-10 bg-secondary rounded-full items-center justify-center">
              <Bell size={20} color="#FAFAFA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap -mx-1.5 mb-6">
          <View className="w-1/2 px-1.5 mb-3">
            <View className="bg-card rounded-xl p-4">
              <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center mb-2">
                <Bus size={20} color="#22C55E" />
              </View>
              <Text className="text-2xl font-bold text-foreground">{stats?.activeBuses || 0}/{stats?.totalBuses || 0}</Text>
              <Text className="text-xs text-muted-foreground">Active Buses</Text>
            </View>
          </View>
          <View className="w-1/2 px-1.5 mb-3">
            <View className="bg-card rounded-xl p-4">
              <View className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center mb-2">
                <Users size={20} color="#3B82F6" />
              </View>
              <Text className="text-2xl font-bold text-foreground">{stats?.presentToday || 0}</Text>
              <Text className="text-xs text-muted-foreground">Present Today</Text>
            </View>
          </View>
          <View className="w-1/2 px-1.5 mb-3">
            <View className="bg-card rounded-xl p-4">
              <View className="w-10 h-10 bg-amber-500/20 rounded-full items-center justify-center mb-2">
                <Clock size={20} color="#F59E0B" />
              </View>
              <Text className="text-2xl font-bold text-foreground">{stats?.pendingApprovals || 0}</Text>
              <Text className="text-xs text-muted-foreground">Pending Approvals</Text>
            </View>
          </View>
          <View className="w-1/2 px-1.5 mb-3">
            <View className="bg-card rounded-xl p-4">
              <View className="w-10 h-10 bg-red-500/20 rounded-full items-center justify-center mb-2">
                <AlertTriangle size={20} color="#EF4444" />
              </View>
              <Text className="text-2xl font-bold text-foreground">{stats?.activeAlerts || 0}</Text>
              <Text className="text-xs text-muted-foreground">Active Alerts</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-lg font-semibold text-foreground mb-4">Quick Actions</Text>
        <View className="flex-row flex-wrap -mx-1.5">
          <TouchableOpacity className="w-1/2 px-1.5 mb-3" onPress={() => router.push('/(tabs)/approvals')}>
            <View className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 items-center">
              <CheckCircle size={24} color="#F59E0B" />
              <Text className="text-sm font-medium text-foreground mt-2">Review Approvals</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className="w-1/2 px-1.5 mb-3" onPress={() => router.push('/(tabs)/alerts')}>
            <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 items-center">
              <AlertTriangle size={24} color="#EF4444" />
              <Text className="text-sm font-medium text-foreground mt-2">View Alerts</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Office Admin Home
function OfficeAdminHome() {
  const { user, switchRole, hasMultipleRoles } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
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
      <ScrollView className="flex-1 px-4">
        <View className="flex-row items-center justify-between py-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.push('/profile')} className="w-10 h-10 bg-secondary rounded-full items-center justify-center mr-3">
              <User size={20} color="#FAFAFA" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">Hello, {user?.name || 'User'}</Text>
          </View>
          <View className="flex-row">
            {hasMultipleRoles && (
              <TouchableOpacity onPress={switchRole} className="w-10 h-10 bg-blue-600/20 rounded-full items-center justify-center mr-2">
                <RefreshCw size={18} color="#3B82F6" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => router.push('/notifications')} className="w-10 h-10 bg-secondary rounded-full items-center justify-center">
              <Bell size={20} color="#FAFAFA" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-card rounded-2xl p-4 mb-6">
          <Text className="text-base font-semibold text-foreground mb-4">Today's Summary</Text>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-muted-foreground">Total Students</Text>
            <Text className="text-sm font-medium text-foreground">{stats?.totalStudents || 0}</Text>
          </View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-muted-foreground">Present</Text>
            <Text className="text-sm font-medium text-primary">{stats?.presentToday || 0}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted-foreground">Absent</Text>
            <Text className="text-sm font-medium text-red-500">{stats?.absentToday || 0}</Text>
          </View>
        </View>

        <Text className="text-lg font-semibold text-foreground mb-4">Quick Actions</Text>
        <TouchableOpacity className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-3" onPress={() => router.push('/(tabs)/half-day')}>
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center mr-4">
              <Clock size={24} color="#22C55E" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">Mark Half-Day Leave</Text>
              <Text className="text-sm text-muted-foreground">Record student early pickup</Text>
            </View>
            <ChevronRight size={20} color="#71717A" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="bg-card rounded-xl p-4" onPress={() => router.push('/(tabs)/students')}>
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-blue-500/20 rounded-full items-center justify-center mr-4">
              <Users size={24} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">View Students</Text>
              <Text className="text-sm text-muted-foreground">Search and view student details</Text>
            </View>
            <ChevronRight size={20} color="#71717A" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Super Admin Dashboard
function SuperAdminDashboard() {
  const { user, switchRole, hasMultipleRoles } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
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
      <ScrollView className="flex-1 px-4">
        <View className="flex-row items-center justify-between py-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.push('/profile')} className="w-10 h-10 bg-secondary rounded-full items-center justify-center mr-3">
              <User size={20} color="#FAFAFA" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">Hello, {user?.name || 'Admin'}</Text>
          </View>
          <View className="flex-row">
            {hasMultipleRoles && (
              <TouchableOpacity onPress={switchRole} className="w-10 h-10 bg-blue-600/20 rounded-full items-center justify-center mr-2">
                <RefreshCw size={18} color="#3B82F6" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => router.push('/notifications')} className="w-10 h-10 bg-secondary rounded-full items-center justify-center">
              <Bell size={20} color="#FAFAFA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Overview Stats */}
        <View className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-4 mb-6">
          <Text className="text-base font-semibold text-foreground mb-4">System Overview</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-foreground">{stats?.totalBuses || 0}</Text>
              <Text className="text-xs text-muted-foreground">Total Buses</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-foreground">{stats?.totalStudents || 0}</Text>
              <Text className="text-xs text-muted-foreground">Students</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-amber-500">{stats?.pendingApprovals || 0}</Text>
              <Text className="text-xs text-muted-foreground">Pending</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-red-500">{stats?.activeAlerts || 0}</Text>
              <Text className="text-xs text-muted-foreground">Alerts</Text>
            </View>
          </View>
        </View>

        <Text className="text-lg font-semibold text-foreground mb-4">Management</Text>
        <View className="flex-row flex-wrap -mx-1.5">
          <TouchableOpacity className="w-1/2 px-1.5 mb-3" onPress={() => router.push('/(tabs)/schools')}>
            <View className="bg-card rounded-xl p-4 items-center">
              <View className="w-12 h-12 bg-purple-500/20 rounded-full items-center justify-center mb-2">
                <Building size={24} color="#A855F7" />
              </View>
              <Text className="text-sm font-medium text-foreground">Schools</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className="w-1/2 px-1.5 mb-3" onPress={() => router.push('/(tabs)/approvals')}>
            <View className="bg-card rounded-xl p-4 items-center">
              <View className="w-12 h-12 bg-amber-500/20 rounded-full items-center justify-center mb-2">
                <CheckCircle size={24} color="#F59E0B" />
              </View>
              <Text className="text-sm font-medium text-foreground">Approvals</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className="w-1/2 px-1.5 mb-3" onPress={() => router.push('/(tabs)/alerts')}>
            <View className="bg-card rounded-xl p-4 items-center">
              <View className="w-12 h-12 bg-red-500/20 rounded-full items-center justify-center mb-2">
                <AlertTriangle size={24} color="#EF4444" />
              </View>
              <Text className="text-sm font-medium text-foreground">Alerts</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className="w-1/2 px-1.5 mb-3" onPress={() => router.push('/(tabs)/settings')}>
            <View className="bg-card rounded-xl p-4 items-center">
              <View className="w-12 h-12 bg-gray-500/20 rounded-full items-center justify-center mb-2">
                <Settings size={24} color="#6B7280" />
              </View>
              <Text className="text-sm font-medium text-foreground">Settings</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Main export - render based on role
export default function HomeScreen() {
  const { selectedRole } = useAuth();

  switch (selectedRole) {
    case 'transport_manager':
      return <TMDashboard />;
    case 'office_admin':
      return <OfficeAdminHome />;
    case 'super_admin':
      return <SuperAdminDashboard />;
    default:
      return <AttenderHome />;
  }
}
