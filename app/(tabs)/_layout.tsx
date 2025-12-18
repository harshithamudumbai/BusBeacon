import { Tabs } from 'expo-router';
import {
  AlertCircle,
  Building,
  Bus,
  CheckSquare,
  FileText,
  Home,
  Route,
  Settings,
  Users,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export default function TabsLayout() {
  const { selectedRole } = useAuth();
  const currentRole = selectedRole || 'attender';

  const insets = useSafeAreaInsets();

  // Determine roles
  const isAttender = currentRole === 'attender';
  const isTM = currentRole === 'transport_manager';
  const isOfficeAdmin = currentRole === 'office_admin';
  const isSuperAdmin = currentRole === 'super_admin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // ✅ FIX: Respect Android navigation bar
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#27272A',
          paddingTop: 8,
          paddingBottom: insets.bottom + 6,
          height: 60 + insets.bottom,
        },

        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#71717A',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      {/* Home / Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: isAttender || isOfficeAdmin ? 'Home' : 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size - 2} />
          ),
        }}
      />

      {/* Attender */}
      <Tabs.Screen
        name="route"
        options={{
          title: 'Route',
          href: isAttender ? '/route' : null,
          tabBarIcon: ({ color, size }) => (
            <Route color={color} size={size - 2} />
          ),
        }}
      />

      {/* Shared */}
      <Tabs.Screen
        name="students"
        options={{
          title: 'Students',
          href: isAttender || isOfficeAdmin ? '/students' : null,
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size - 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          href: isAttender ? '/report' : null,
          tabBarIcon: ({ color, size }) => (
            <AlertCircle color={color} size={size - 2} />
          ),
        }}
      />

      {/* Transport Manager */}
      <Tabs.Screen
        name="approvals"
        options={{
          title: 'Approvals',
          href: isTM || isSuperAdmin ? '/approvals' : null,
          tabBarIcon: ({ color, size }) => (
            <CheckSquare color={color} size={size - 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="buses"
        options={{
          title: 'Buses',
          href: isTM ? '/buses' : null,
          tabBarIcon: ({ color, size }) => (
            <Bus color={color} size={size - 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          href: isTM || isSuperAdmin ? '/alerts' : null,
          tabBarIcon: ({ color, size }) => (
            <AlertCircle color={color} size={size - 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          href: isTM || isAttender ? '/reports' : null,
          tabBarIcon: ({ color, size }) => (
            <FileText color={color} size={size - 2} />
          ),
        }}
      />

      {/* Office Admin */}
      <Tabs.Screen
        name="half-day"
        options={{
          title: 'Half Day',
          href: isOfficeAdmin ? '/half-day' : null,
          tabBarIcon: ({ color, size }) => (
            <FileText color={color} size={size - 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="status"
        options={{
          title: 'Status',
          href: isOfficeAdmin ? '/status' : null,
          tabBarIcon: ({ color, size }) => (
            <CheckSquare color={color} size={size - 2} />
          ),
        }}
      />

      {/* Super Admin */}
      <Tabs.Screen
        name="schools"
        options={{
          title: 'Schools',
          href: isSuperAdmin ? '/schools' : null,
          tabBarIcon: ({ color, size }) => (
            <Building color={color} size={size - 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          href: isSuperAdmin ? '/settings' : null,
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size - 2} />
          ),
        }}
      />
    </Tabs>
  );
}
