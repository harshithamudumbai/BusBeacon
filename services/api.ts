// ============================================
// GPS SMART BUS SYSTEM - API SERVICE
// All APIs are commented for later implementation
// Dummy data is provided for development
// ============================================

// Base URL for API - Replace with actual API URL
// const API_BASE_URL = 'https://your-api.com/api/v1';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// TYPES & INTERFACES
// ============================================

export type AppRole = 'super_admin' | 'transport_manager' | 'office_admin' | 'attender';
export type TripType = 'pickup' | 'dropoff' | 'preprimary_drop';
export type TripStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'pending' | 'half_day' | 'reassigned';
export type ApprovalType = 'route_change' | 'half_day' | 'temp_stop';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type AlertType = 'late_bus' | 'no_boarding' | 'schedule_variance';
export type AlertSeverity = 'low' | 'medium' | 'high';

export interface UserProfile {
  id: string;
  name: string;
  phoneNumber: string;
  avatar: string;
  roles: AppRole[];
  assignedBranches?: Branch[];
  assignedBus?: Bus;
  assignedRoute?: Route;
}

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  branches: Branch[];
}

export interface Branch {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  address: string;
}

export interface Bus {
  id: string;
  number: string;
  branchId: string;
  routeId: string;
  route?: Route;
  capacity: number;
  currentStudents: number;
  driverName: string;
  driverPhone: string;
  attenderId?: string;
  attender?: UserProfile;
  status: 'on_trip' | 'idle' | 'maintenance';
  lateCount: number;
  isActive: boolean;
}

export interface Route {
  id: string;
  branchId: string;
  name: string;
  code: string;
  stops: Stop[];
  isActive: boolean;
}

export interface Stop {
  id: string;
  routeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  order: number;
  scheduledPickupTime: string;
  scheduledDropoffTime: string;
  studentsCount: number;
}

export interface Student {
  id: string;
  branchId: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  photoUrl: string;
  busId: string;
  bus?: Bus;
  routeId: string;
  route?: Route;
  stopId: string;
  stop?: Stop;
  parent1Name: string;
  parent1Phone: string;
  parent2Name?: string;
  parent2Phone?: string;
  isActive: boolean;
  attendanceStatus?: AttendanceStatus;
  statusNote?: string;
}

export interface Trip {
  id: string;
  busId: string;
  bus?: Bus;
  date: string;
  type: TripType;
  status: TripStatus;
  startedAt?: string;
  completedAt?: string;
  startTime: string;
  endTime: string;
  attenderId: string;
  attender?: UserProfile;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  currentStopIndex: number;
  stops: number;
}

export interface Attendance {
  id: string;
  tripId: string;
  studentId: string;
  student?: Student;
  stopId: string;
  status: AttendanceStatus;
  markedAt?: string;
  markedBy?: string;
  note?: string;
}

export interface Approval {
  id: string;
  type: ApprovalType;
  studentId: string;
  student?: Student;
  requestedByUserId: string;
  requestedBy?: UserProfile;
  requestedAt: string;
  status: ApprovalStatus;
  processedBy?: string;
  processedAt?: string;
  note?: string;
  details: RouteChangeDetails | HalfDayDetails;
}

export interface RouteChangeDetails {
  originalBusId: string;
  originalBus?: Bus;
  newBusId: string;
  newBus?: Bus;
  originalStopId: string;
  originalStop?: Stop;
  newStopId: string;
  newStop?: Stop;
  date: string;
  isPermanent: boolean;
  reason: string;
}

export interface HalfDayDetails {
  date: string;
  pickupTime: string;
  pickupBy: string;
  reason: string;
  letterUrl?: string;
  type: 'parent_pickup' | 'early_leave' | 'medical';
}

export interface Alert {
  id: string;
  branchId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  relatedBusId?: string;
  relatedBus?: Bus;
  relatedStudentId?: string;
  relatedStudent?: Student;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'approval' | 'alert';
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DashboardStats {
  totalBuses: number;
  activeBuses: number;
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  pendingApprovals: number;
  activeAlerts: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// ============================================
// ROLE-BASED PHONE NUMBER MAPPING
// ============================================

export const ROLE_PHONE_MAPPING: Record<string, AppRole[]> = {
  '9999999999': ['super_admin'],
  '9087654321': ['transport_manager'],
  '8097654321': ['office_admin'],
  '9014536201': ['attender'],
  '9876543210': ['transport_manager', 'office_admin'],
  '9123456789': ['super_admin', 'transport_manager'],
};

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  transport_manager: 'Transport Manager',
  office_admin: 'Office Admin',
  attender: 'Bus Attender',
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  super_admin: 'Full access to all schools & features',
  transport_manager: 'Manage buses, approvals & reports',
  office_admin: 'Mark half-day leaves & view status',
  attender: 'Mark attendance & manage trips',
};

// ============================================
// DUMMY DATA
// ============================================

const DUMMY_SCHOOLS: School[] = [
  {
    id: 'school_1',
    name: 'Devakul International School',
    code: 'DIS',
    address: 'Jubilee Hills, Hyderabad',
    branches: [
      { id: 'branch_1', schoolId: 'school_1', name: 'Branch A - Main Campus', code: 'DIS-A', address: 'Road No 36, Jubilee Hills' },
      { id: 'branch_2', schoolId: 'school_1', name: 'Branch B - Junior Wing', code: 'DIS-B', address: 'Road No 45, Jubilee Hills' },
    ],
  },
  {
    id: 'school_2',
    name: 'XYZ Academy',
    code: 'XYZ',
    address: 'Banjara Hills, Hyderabad',
    branches: [
      { id: 'branch_3', schoolId: 'school_2', name: 'Main Branch', code: 'XYZ-M', address: 'Road No 12, Banjara Hills' },
    ],
  },
];

const DUMMY_ROUTES: Route[] = [
  {
    id: 'route_12',
    branchId: 'branch_1',
    name: 'Route 12',
    code: 'R-12',
    isActive: true,
    stops: [
      { id: 'stop_1', routeId: 'route_12', name: 'Green Park Colony', address: 'Near Green Park Metro', latitude: 17.4156, longitude: 78.4347, order: 1, scheduledPickupTime: '6:30 AM', scheduledDropoffTime: '4:00 PM', studentsCount: 5 },
      { id: 'stop_2', routeId: 'route_12', name: 'Hauz Khas Village', address: 'Main Gate', latitude: 17.4167, longitude: 78.4389, order: 2, scheduledPickupTime: '6:45 AM', scheduledDropoffTime: '3:45 PM', studentsCount: 4 },
      { id: 'stop_3', routeId: 'route_12', name: 'Malviya Nagar', address: 'Near PVR Cinema', latitude: 17.4234, longitude: 78.4456, order: 3, scheduledPickupTime: '7:00 AM', scheduledDropoffTime: '3:30 PM', studentsCount: 6 },
      { id: 'stop_4', routeId: 'route_12', name: 'Saket', address: 'Select City Walk', latitude: 17.4312, longitude: 78.4523, order: 4, scheduledPickupTime: '7:15 AM', scheduledDropoffTime: '3:15 PM', studentsCount: 4 },
      { id: 'stop_5', routeId: 'route_12', name: 'School Main Gate', address: 'DPS School', latitude: 17.4456, longitude: 78.4634, order: 5, scheduledPickupTime: '7:30 AM', scheduledDropoffTime: '3:00 PM', studentsCount: 0 },
    ],
  },
  {
    id: 'route_15',
    branchId: 'branch_1',
    name: 'Route 15',
    code: 'R-15',
    isActive: true,
    stops: [
      { id: 'stop_6', routeId: 'route_15', name: 'MG Road', address: 'Near Metro Station', latitude: 17.4256, longitude: 78.4447, order: 1, scheduledPickupTime: '6:45 AM', scheduledDropoffTime: '3:45 PM', studentsCount: 6 },
      { id: 'stop_7', routeId: 'route_15', name: 'Brigade Road', address: 'Commercial Street', latitude: 17.4367, longitude: 78.4589, order: 2, scheduledPickupTime: '7:00 AM', scheduledDropoffTime: '3:30 PM', studentsCount: 5 },
      { id: 'stop_8', routeId: 'route_15', name: 'School Main Gate', address: 'DPS School', latitude: 17.4456, longitude: 78.4634, order: 3, scheduledPickupTime: '7:30 AM', scheduledDropoffTime: '3:00 PM', studentsCount: 0 },
    ],
  },
];

const DUMMY_BUSES: Bus[] = [
  { id: 'bus_1', number: 'TS09 EK 3274', branchId: 'branch_1', routeId: 'route_12', capacity: 40, currentStudents: 23, driverName: 'Venkat Sharma', driverPhone: '9876543001', attenderId: 'user_attender', status: 'idle', lateCount: 3, isActive: true },
  { id: 'bus_2', number: 'TS09 EK 5678', branchId: 'branch_1', routeId: 'route_15', capacity: 35, currentStudents: 19, driverName: 'Ravi Kumar', driverPhone: '9876543002', status: 'idle', lateCount: 0, isActive: true },
  { id: 'bus_3', number: 'TS09 EK 9012', branchId: 'branch_2', routeId: 'route_12', capacity: 30, currentStudents: 15, driverName: 'Suresh Reddy', driverPhone: '9876543003', status: 'maintenance', lateCount: 1, isActive: false },
];

const DUMMY_STUDENTS: Student[] = [
  { id: 'student_1', branchId: 'branch_1', name: 'Arjun Sharma', class: '5', section: 'A', rollNumber: '101', photoUrl: 'https://images.unsplash.com/photo-1570134591000-8c9c55a0b4e6?w=100&h=100&fit=crop', busId: 'bus_1', routeId: 'route_12', stopId: 'stop_1', parent1Name: 'Rajesh Sharma', parent1Phone: '9876543210', parent2Name: 'Meera Sharma', parent2Phone: '9876543220', isActive: true, attendanceStatus: 'present' },
  { id: 'student_2', branchId: 'branch_1', name: 'Priya Patel', class: '4', section: 'B', rollNumber: '102', photoUrl: 'https://images.unsplash.com/photo-1595454223600-91fbdeb71a9e?w=100&h=100&fit=crop', busId: 'bus_1', routeId: 'route_12', stopId: 'stop_1', parent1Name: 'Amit Patel', parent1Phone: '9876543211', isActive: true, attendanceStatus: 'present' },
  { id: 'student_3', branchId: 'branch_1', name: 'Rahul Verma', class: '6', section: 'A', rollNumber: '103', photoUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop', busId: 'bus_1', routeId: 'route_12', stopId: 'stop_2', parent1Name: 'Vikram Verma', parent1Phone: '9876543212', isActive: true, attendanceStatus: 'reassigned' },
  { id: 'student_4', branchId: 'branch_1', name: 'Sneha Reddy', class: '5', section: 'B', rollNumber: '104', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', busId: 'bus_1', routeId: 'route_12', stopId: 'stop_2', parent1Name: 'Suresh Reddy', parent1Phone: '9876543213', isActive: true, attendanceStatus: 'present' },
  { id: 'student_5', branchId: 'branch_1', name: 'Karan Gupta', class: '7', section: 'A', rollNumber: '105', photoUrl: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=100&h=100&fit=crop', busId: 'bus_1', routeId: 'route_12', stopId: 'stop_3', parent1Name: 'Ramesh Gupta', parent1Phone: '9876543214', isActive: true, attendanceStatus: 'absent' },
  { id: 'student_6', branchId: 'branch_1', name: 'Ananya Iyer', class: '6', section: 'B', rollNumber: '106', photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop', busId: 'bus_1', routeId: 'route_12', stopId: 'stop_3', parent1Name: 'Venkat Iyer', parent1Phone: '9876543215', isActive: true, attendanceStatus: 'present' },
  { id: 'student_7', branchId: 'branch_1', name: 'Rohan Kumar', class: '8', section: 'A', rollNumber: '107', photoUrl: 'https://images.unsplash.com/photo-1595454223600-91fbdeb71a9e?w=100&h=100&fit=crop', busId: 'bus_1', routeId: 'route_12', stopId: 'stop_4', parent1Name: 'Anil Kumar', parent1Phone: '9876543216', isActive: true, attendanceStatus: 'pending' },
  { id: 'student_8', branchId: 'branch_1', name: 'Kavya Nair', class: '8', section: 'B', rollNumber: '108', photoUrl: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=100&h=100&fit=crop', busId: 'bus_1', routeId: 'route_12', stopId: 'stop_4', parent1Name: 'Ravi Nair', parent1Phone: '9876543217', isActive: true, attendanceStatus: 'half_day' },
];

const DUMMY_APPROVALS: Approval[] = [
  {
    id: 'approval_1', type: 'route_change', studentId: 'student_1', requestedByUserId: 'user_office', requestedAt: new Date().toISOString(), status: 'pending',
    details: { originalBusId: 'bus_1', newBusId: 'bus_2', originalStopId: 'stop_1', newStopId: 'stop_6', date: new Date().toISOString().split('T')[0], isPermanent: false, reason: 'Parent meeting at different location' } as RouteChangeDetails,
  },
  {
    id: 'approval_2', type: 'half_day', studentId: 'student_2', requestedByUserId: 'user_office', requestedAt: new Date().toISOString(), status: 'pending',
    details: { date: new Date().toISOString().split('T')[0], pickupTime: '12:30 PM', pickupBy: 'Mother', reason: 'Doctor appointment', type: 'parent_pickup' } as HalfDayDetails,
  },
  {
    id: 'approval_3', type: 'temp_stop', studentId: 'student_3', requestedByUserId: 'user_office', requestedAt: new Date(Date.now() - 86400000).toISOString(), status: 'approved', processedBy: 'user_tm', processedAt: new Date(Date.now() - 43200000).toISOString(), note: 'Approved for one day',
    details: { originalBusId: 'bus_1', newBusId: 'bus_1', originalStopId: 'stop_2', newStopId: 'stop_3', date: new Date().toISOString().split('T')[0], isPermanent: false, reason: 'Staying at grandparents house' } as RouteChangeDetails,
  },
];

const DUMMY_ALERTS: Alert[] = [
  { id: 'alert_1', branchId: 'branch_1', type: 'late_bus', severity: 'high', title: 'Bus R-12 Late 3x This Week', message: 'Bus TS09 EK 3274 has been late 3 times consecutively', relatedBusId: 'bus_1', isAcknowledged: false, createdAt: new Date().toISOString() },
  { id: 'alert_2', branchId: 'branch_1', type: 'no_boarding', severity: 'medium', title: 'Student No-Boarding Alert', message: 'Arjun Sharma did not board the morning bus', relatedStudentId: 'student_1', isAcknowledged: true, acknowledgedBy: 'user_tm', createdAt: new Date(Date.now() - 3600000).toISOString() },
];

const DUMMY_NOTIFICATIONS: Notification[] = [
  { id: 'notif_1', userId: 'all', title: 'New Approval Request', message: 'Route change request for Arjun Sharma', type: 'approval', isRead: false, createdAt: new Date().toISOString() },
  { id: 'notif_2', userId: 'all', title: 'Half-Day Request', message: 'Half-day leave request for Priya Patel', type: 'approval', isRead: false, createdAt: new Date().toISOString() },
  { id: 'notif_3', userId: 'all', title: 'Late Bus Alert', message: 'Bus R-12 has been late 3 times this week', type: 'alert', isRead: false, createdAt: new Date().toISOString() },
  { id: 'notif_4', userId: 'all', title: 'Trip Reminder', message: 'Morning pickup trip starts in 30 minutes', type: 'info', isRead: true, createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'notif_5', userId: 'all', title: 'Approval Status', message: 'Half-day request for Rahul Verma approved', type: 'success', isRead: false, createdAt: new Date().toISOString() },
];

// ============================================
// AUTH APIs
// ============================================

export const sendOtp = async (params: { phoneNumber: string }): Promise<ApiResponse<{ message: string }>> => {
  await delay(1000);
  return { success: true, message: 'OTP sent successfully', data: { message: 'OTP sent to ' + params.phoneNumber } };
};

export const verifyOtp = async (params: { phoneNumber: string; otp: string }): Promise<ApiResponse<{ token: string; user: UserProfile }>> => {
  await delay(1000);
  
  if (params.otp !== '000000') {
    return { success: false, message: 'Invalid OTP' };
  }
  
  const roles = ROLE_PHONE_MAPPING[params.phoneNumber] || ['attender'];
  
  const userProfiles: Record<string, UserProfile> = {
    '9999999999': { id: 'user_superadmin', name: 'Admin User', phoneNumber: params.phoneNumber, avatar: '', roles: ['super_admin'], assignedBranches: DUMMY_SCHOOLS.flatMap(s => s.branches) },
    '9087654321': { id: 'user_tm', name: 'Uma Devi', phoneNumber: params.phoneNumber, avatar: '', roles: ['transport_manager'], assignedBranches: [DUMMY_SCHOOLS[0].branches[0], DUMMY_SCHOOLS[0].branches[1]] },
    '8097654321': { id: 'user_office', name: 'Sunita Rao', phoneNumber: params.phoneNumber, avatar: '', roles: ['office_admin'], assignedBranches: [DUMMY_SCHOOLS[0].branches[0]] },
    '9014536201': { id: 'user_attender', name: 'Raju Kumar', phoneNumber: params.phoneNumber, avatar: '', roles: ['attender'], assignedBus: { ...DUMMY_BUSES[0], route: DUMMY_ROUTES[0] }, assignedRoute: DUMMY_ROUTES[0] },
    '9876543210': { id: 'user_multi_1', name: 'Priya Sharma', phoneNumber: params.phoneNumber, avatar: '', roles: ['transport_manager', 'office_admin'], assignedBranches: [DUMMY_SCHOOLS[0].branches[0]] },
    '9123456789': { id: 'user_multi_2', name: 'Vikram Singh', phoneNumber: params.phoneNumber, avatar: '', roles: ['super_admin', 'transport_manager'], assignedBranches: DUMMY_SCHOOLS.flatMap(s => s.branches) },
  };
  
  const user = userProfiles[params.phoneNumber] || {
    id: 'user_default', name: 'Bus Attender', phoneNumber: params.phoneNumber, avatar: '', roles: roles,
    assignedBus: { ...DUMMY_BUSES[0], route: DUMMY_ROUTES[0] }, assignedRoute: DUMMY_ROUTES[0],
  };
  
  return { success: true, message: 'OTP verified successfully', data: { token: 'dummy_jwt_token_' + Date.now(), user } };
};

// ============================================
// DASHBOARD APIs
// ============================================

export const getDashboardStats = async (params?: { branchId?: string }): Promise<ApiResponse<DashboardStats>> => {
  await delay(500);
  return { success: true, message: 'Stats fetched', data: { totalBuses: 12, activeBuses: 10, totalStudents: 280, presentToday: 265, absentToday: 15, pendingApprovals: 3, activeAlerts: 2 } };
};

// ============================================
// TRIP APIs
// ============================================

export interface TodayTrips {
  date: string;
  hasActiveTrip: boolean;
  trips: Trip[];
}

export const getTodayTrips = async (params?: { busId?: string }): Promise<ApiResponse<TodayTrips>> => {
  await delay(500);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  return {
    success: true, message: 'Trips fetched',
    data: {
      date: today, hasActiveTrip: false,
      trips: [
        { id: 'trip_1', busId: params?.busId || 'bus_1', date: new Date().toISOString().split('T')[0], type: 'pickup', status: 'pending', startTime: '6:30 AM', endTime: '8:00 AM', attenderId: 'user_attender', totalStudents: 23, presentCount: 0, absentCount: 0, currentStopIndex: 0, stops: 5 },
        { id: 'trip_2', busId: params?.busId || 'bus_1', date: new Date().toISOString().split('T')[0], type: 'dropoff', status: 'pending', startTime: '2:30 PM', endTime: '4:00 PM', attenderId: 'user_attender', totalStudents: 23, presentCount: 0, absentCount: 0, currentStopIndex: 0, stops: 5 },
      ],
    },
  };
};

export const startTrip = async (params: { tripId: string }): Promise<ApiResponse<Trip>> => {
  await delay(500);
  return { success: true, message: 'Trip started', data: { id: params.tripId, busId: 'bus_1', date: new Date().toISOString().split('T')[0], type: 'pickup', status: 'active', startedAt: new Date().toISOString(), startTime: '6:30 AM', endTime: '8:00 AM', attenderId: 'user_attender', totalStudents: 23, presentCount: 0, absentCount: 0, currentStopIndex: 0, stops: 5 } };
};

// ============================================
// STUDENT APIs
// ============================================

export const getStudents = async (params?: { branchId?: string; busId?: string; stopId?: string }): Promise<ApiResponse<Student[]>> => {
  await delay(500);
  let students = DUMMY_STUDENTS.map(s => ({ ...s, bus: DUMMY_BUSES.find(b => b.id === s.busId), stop: DUMMY_ROUTES.flatMap(r => r.stops).find(st => st.id === s.stopId) }));
  if (params?.busId) students = students.filter(s => s.busId === params.busId);
  if (params?.stopId) students = students.filter(s => s.stopId === params.stopId);
  return { success: true, message: 'Students fetched', data: students };
};

export const searchStudents = async (params: { query: string; branchId?: string }): Promise<ApiResponse<Student[]>> => {
  await delay(300);
  const query = params.query.toLowerCase();
  let students = DUMMY_STUDENTS.filter(s => s.name.toLowerCase().includes(query) || s.rollNumber.toLowerCase().includes(query));
  return { success: true, message: 'Search results', data: students };
};

// Legacy function for backward compatibility with students.tsx
export const getStudentsList = async (params?: { routeId?: string; stopId?: string }): Promise<ApiResponse<Student[]>> => {
  await delay(500);
  let students = DUMMY_STUDENTS.map(s => ({
    ...s,
    bus: DUMMY_BUSES.find(b => b.id === s.busId),
    route: DUMMY_ROUTES.find(r => r.id === s.routeId),
    stop: DUMMY_ROUTES.flatMap(r => r.stops).find(st => st.id === s.stopId),
  }));
  if (params?.routeId) students = students.filter(s => s.routeId === params.routeId);
  if (params?.stopId) students = students.filter(s => s.stopId === params.stopId);
  return { success: true, message: 'Students fetched', data: students };
};

// Get students grouped by stop for route screen
export const getStudentsByRoute = async (routeId: string): Promise<ApiResponse<{ stops: (Stop & { students: Student[] })[] }>> => {
  await delay(500);
  const route = DUMMY_ROUTES.find(r => r.id === routeId);
  if (!route) return { success: false, message: 'Route not found' };
  
  const stopsWithStudents = route.stops.map(stop => ({
    ...stop,
    students: DUMMY_STUDENTS.filter(s => s.stopId === stop.id).map(s => ({
      ...s,
      bus: DUMMY_BUSES.find(b => b.id === s.busId),
      route: route,
      stop: stop,
    })),
  }));
  
  return { success: true, message: 'Students by route fetched', data: { stops: stopsWithStudents } };
};

// ============================================
// ATTENDANCE APIs
// ============================================

export const markAttendance = async (params: { tripId: string; studentId: string; status: AttendanceStatus; note?: string }): Promise<ApiResponse<Attendance>> => {
  await delay(300);
  return { success: true, message: 'Attendance marked', data: { id: 'att_new', tripId: params.tripId, studentId: params.studentId, stopId: 'stop_1', status: params.status, markedAt: new Date().toISOString(), markedBy: 'user_attender', note: params.note } };
};

// ============================================
// ROUTE APIs
// ============================================

export const getRoutes = async (params?: { branchId?: string }): Promise<ApiResponse<Route[]>> => {
  await delay(500);
  return { success: true, message: 'Routes fetched', data: DUMMY_ROUTES };
};

export const getRouteStops = async (routeId: string): Promise<ApiResponse<Stop[]>> => {
  await delay(300);
  const route = DUMMY_ROUTES.find(r => r.id === routeId);
  return { success: true, message: 'Stops fetched', data: route?.stops || [] };
};
export const getRouteStopsMock = async (routeId: string): Promise<ApiResponse<Stop[]>> => {
  await delay(300);
  const route = DUMMY_ROUTES.find(r => r.id === routeId);
  return { success: true, message: 'Stops fetched', data: route?.stops || [] };
};

export const getRouteStopsWithStudentsMock = async (routeId: string): Promise<ApiResponse<(Stop & { students: Student[] })[]>> => {
  await delay(300);
  const route = DUMMY_ROUTES.find(r => r.id === routeId);
  if (!route) return { success: false, message: 'Route not found', data: [] };

  const stopsWithStudents = route.stops.map(stop => ({
    ...stop,
    students: DUMMY_STUDENTS.filter(s => s.stopId === stop.id)
  }));

  return { success: true, message: 'Stops + students fetched', data: stopsWithStudents };
};

export const markAttendanceMock = async (params: { tripId: string; studentId: string; status: AttendanceStatus; note?: string }): Promise<ApiResponse<Attendance>> => {
  await delay(200);
  return { success: true, message: 'Attendance marked', data: { id: 'att_' + Date.now(), tripId: params.tripId, studentId: params.studentId, stopId: 'stop_1', status: params.status, markedAt: new Date().toISOString(), markedBy: 'user_attender', note: params.note } };
};


// ============================================
// BUS APIs
// ============================================

export const getBuses = async (params?: { branchId?: string; status?: string }): Promise<ApiResponse<Bus[]>> => {
  await delay(500);
  let buses = DUMMY_BUSES.map(bus => ({ ...bus, route: DUMMY_ROUTES.find(r => r.id === bus.routeId) }));
  if (params?.status && params.status !== 'all') buses = buses.filter(b => b.status === params.status);
  return { success: true, message: 'Buses fetched', data: buses };
};

// ============================================
// APPROVAL APIs
// ============================================

export const getApprovals = async (params?: { status?: ApprovalStatus; type?: ApprovalType }): Promise<ApiResponse<Approval[]>> => {
  await delay(500);
  let approvals = DUMMY_APPROVALS.map(a => ({ ...a, student: DUMMY_STUDENTS.find(s => s.id === a.studentId) }));
  if (params?.status) approvals = approvals.filter(a => a.status === params.status);
  if (params?.type) approvals = approvals.filter(a => a.type === params.type);
  return { success: true, message: 'Approvals fetched', data: approvals };
};

export const approveRequest = async (params: { approvalId: string; note?: string }): Promise<ApiResponse<Approval>> => {
  await delay(500);
  return { success: true, message: 'Request approved', data: { ...DUMMY_APPROVALS[0], status: 'approved', processedBy: 'user_tm', processedAt: new Date().toISOString(), note: params.note } };
};

export const rejectRequest = async (params: { approvalId: string; reason: string }): Promise<ApiResponse<Approval>> => {
  await delay(500);
  return { success: true, message: 'Request rejected', data: { ...DUMMY_APPROVALS[0], status: 'rejected', processedBy: 'user_tm', processedAt: new Date().toISOString(), note: params.reason } };
};

export const processApproval = async (params: { approvalId: string; status: ApprovalStatus; note?: string }): Promise<ApiResponse<Approval>> => {
  await delay(500);
  return { success: true, message: `Request ${params.status}`, data: { ...DUMMY_APPROVALS[0], status: params.status, processedBy: 'user_tm', processedAt: new Date().toISOString(), note: params.note } };
};

// ============================================
// HALF-DAY APIs
// ============================================

export const createHalfDayRequest = async (params: { studentId: string; date: string; pickupTime: string; type: 'parent_pickup' | 'early_leave' | 'medical'; pickupBy: string; reason: string }): Promise<ApiResponse<Approval>> => {
  await delay(500);
  return { success: true, message: 'Half-day request created', data: { id: 'approval_new', type: 'half_day', studentId: params.studentId, requestedByUserId: 'user_office', requestedAt: new Date().toISOString(), status: 'pending', details: { date: params.date, pickupTime: params.pickupTime, pickupBy: params.pickupBy, reason: params.reason, type: params.type } as HalfDayDetails } };
};

export const getTodayHalfDayLeaves = async (): Promise<ApiResponse<Approval[]>> => {
  await delay(500);
  const halfDays = DUMMY_APPROVALS.filter(a => a.type === 'half_day').map(a => ({ ...a, student: DUMMY_STUDENTS.find(s => s.id === a.studentId) }));
  return { success: true, message: 'Half-day leaves fetched', data: halfDays };
};

// ============================================
// ALERT APIs
// ============================================

export const getAlerts = async (params?: { isAcknowledged?: boolean }): Promise<ApiResponse<Alert[]>> => {
  await delay(500);
  let alerts = DUMMY_ALERTS;
  if (params?.isAcknowledged !== undefined) alerts = alerts.filter(a => a.isAcknowledged === params.isAcknowledged);
  return { success: true, message: 'Alerts fetched', data: alerts };
};

export const acknowledgeAlert = async (params: { alertId: string }): Promise<ApiResponse<Alert>> => {
  await delay(300);
  return { success: true, message: 'Alert acknowledged', data: { ...DUMMY_ALERTS[0], isAcknowledged: true, acknowledgedBy: 'user_tm' } };
};

export const getActiveBuses = async (): Promise<ApiResponse<Bus[]>> => {
  await delay(500);
  const activeBuses = DUMMY_BUSES.filter(b => b.status === 'on_trip').map(bus => ({ ...bus, route: DUMMY_ROUTES.find(r => r.id === bus.routeId) }));
  return { success: true, message: 'Active buses fetched', data: activeBuses };
};

// ============================================
// NOTIFICATION APIs
// ============================================

export const getNotifications = async (params?: { unreadOnly?: boolean }): Promise<ApiResponse<Notification[]>> => {
  await delay(500);
  let notifications = DUMMY_NOTIFICATIONS;
  if (params?.unreadOnly) notifications = notifications.filter(n => !n.isRead);
  return { success: true, message: 'Notifications fetched', data: notifications };
};

export const markNotificationRead = async (notificationId: string): Promise<ApiResponse<{ message: string }>> => {
  await delay(200);
  return { success: true, message: 'Marked as read', data: { message: 'Notification marked as read' } };
};

export const markAllNotificationsRead = async (): Promise<ApiResponse<{ message: string }>> => {
  await delay(300);
  return { success: true, message: 'All marked as read', data: { message: 'All notifications marked as read' } };
};

// ============================================
// SCHOOL APIs
// ============================================

export const getSchools = async (): Promise<ApiResponse<School[]>> => {
  await delay(500);
  return { success: true, message: 'Schools fetched', data: DUMMY_SCHOOLS };
};

// ============================================
// ISSUE REPORTING APIs
// ============================================

export interface IssueCategory {
  id: string;
  name: string;
  icon: string;
}

export const getIssueCategories = async (): Promise<ApiResponse<IssueCategory[]>> => {
  await delay(300);
  return { success: true, message: 'Categories fetched', data: [
    { id: '1', name: 'Vehicle Breakdown', icon: 'car' },
    { id: '2', name: 'Student Issue', icon: 'user' },
    { id: '3', name: 'Route Problem', icon: 'map' },
    { id: '4', name: 'Accident', icon: 'alert-triangle' },
    { id: '5', name: 'Schedule Delay', icon: 'clock' },
    { id: '6', name: 'Other', icon: 'help-circle' },
  ]};
};

export const reportIssue = async (params: { categoryId: string; description: string }): Promise<ApiResponse<{ ticketId: string }>> => {
  await delay(1000);
  return { success: true, message: 'Issue reported', data: { ticketId: 'TKT-' + Date.now() } };
};
