// ============================================
// GPS SMART BUS SYSTEM - REST API SERVICE
// This file connects to actual PHP backend
// ============================================
import { getAuthToken } from '../services/storage';
// Base URL for API - Replace with your server URL
const API_BASE_URL = 'https://gps.winnou.in/busbeacon/api';

// ============================================
// TYPES & INTERFACES (same as before)
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

export interface TodayTrips {
  date: string;
  hasActiveTrip: boolean;
  trips: Trip[];
}

export interface IssueCategory {
  id: string;
  name: string;
  icon: string;
}

// ============================================
// ROLE LABELS (static)
// ============================================

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


export interface BusLocationData {
  tripId: string | null;
  isLive: boolean;
  currentStopIndex: number;
  progress: number; // 0.0 to 1.0
  currentLocation?: {
    latitude: number;
    longitude: number;
    speed: number;
  };
  nearestStop?: {
    index: number;
    name: string;
  };
}

// Add this function
export const getBusTracking = async (routeId: string): Promise<ApiResponse<BusLocationData>> => {
  return apiRequest(`/routes/${routeId}/bus-location`, 'GET');
};

// ============================================
// API HELPER FUNCTIONS
// ============================================
//const AUTH_TOKEN_KEY = 'busbeacon_auth_token'; 

//let authToken: string | null = null;

const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: Record<string, any>
): Promise<ApiResponse<T>> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 1. GET TOKEN FROM STORAGE
    // We fetch it fresh for every request.
    const authToken = await getAuthToken();
    //console.log(JSON.stringify(authToken, null, 2));

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    // For GET requests with params, append to URL
    let url = `${API_BASE_URL}${endpoint}`;

    if (body && method === 'GET') {
      const params = new URLSearchParams();
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    console.log('apiRequest -> url : '+url);
    const response = await fetch(url, config);
    const data = await response.json();
    //console.log(data);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
};

// ============================================
// AUTH APIs
// ============================================

export const sendOtp = async (params: { phoneNumber: string }): Promise<ApiResponse<{ message: string }>> => {
  return apiRequest('/auth/send-otp', 'POST', params);
};

export const verifyOtp = async (params: { phoneNumber: string; otp: string }): Promise<ApiResponse<{ token: string; user: UserProfile }>> => {
  const response = await apiRequest<{ token: string; user: UserProfile }>('/auth/verify-otp', 'POST', params);
  if (response.success && response.data?.token) {
   // setAuthToken(response.data.token);
  }
  return response;
};

export const logout = async (): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiRequest<{ message: string }>('/auth/logout', 'POST');
 // setAuthToken(null);
  return response;
};

// ============================================
// DASHBOARD APIs
// ============================================

export const getDashboardStats = async (params?: { branchId?: string }): Promise<ApiResponse<DashboardStats>> => {
  return apiRequest('/dashboard/stats', 'GET', params);
};

// ============================================
// TRIP APIs
// ============================================

export const getTodayTrips = async (params?: { busId?: string }): Promise<ApiResponse<TodayTrips>> => {
  return apiRequest('/trips/today', 'GET', params);
};

export const startTrip = async (params: { tripId: string }): Promise<ApiResponse<Trip>> => {
  return apiRequest(`/trips/${params.tripId}/start`, 'POST');
};

export const endTrip = async (params: { tripId: string }): Promise<ApiResponse<Trip>> => {
  return apiRequest(`/trips/${params.tripId}/end`, 'POST');
};

export const getTripDetails = async (params: { tripId: string }): Promise<ApiResponse<Trip>> => {
  return apiRequest(`/trips/${params.tripId}`, 'GET');
};

// ============================================
// STUDENT APIs
// ============================================

export const getStudents = async (params?: { branchId?: string; busId?: string; stopId?: string }): Promise<ApiResponse<Student[]>> => {
  return apiRequest('/students', 'GET', params);
};

export const searchStudents = async (params: { query: string; branchId?: string }): Promise<ApiResponse<Student[]>> => {
  return apiRequest('/students/search', 'GET', params);
};

export const getStudentsList = async (params?: { routeId?: string; stopId?: string }): Promise<ApiResponse<Student[]>> => {
  return apiRequest('/students/list', 'GET', params);
};

export const getStudentsByRoute = async (routeId: string): Promise<ApiResponse<{ stops: (Stop & { students: Student[] })[] }>> => {
  console.log('getStudentsByRoute : '+routeId);
  return apiRequest(`/routes/${routeId}/students`, 'GET');
};

// ============================================
// ATTENDANCE APIs
// ============================================

export const markAttendance = async (params: { tripId: string; studentId: string; status: AttendanceStatus; note?: string }): Promise<ApiResponse<Attendance>> => {
  console.log(params);
  return apiRequest('/attendance/mark', 'POST', params);
};

export const markAttendanceMock = markAttendance; // Alias

export const getAttendanceByTrip = async (params: { tripId: string }): Promise<ApiResponse<Attendance[]>> => {
  return apiRequest(`/attendance/trip/${params.tripId}`, 'GET');
};

// ============================================
// ROUTE APIs
// ============================================

export const getRoutes = async (params?: { branchId?: string }): Promise<ApiResponse<Route[]>> => {
  return apiRequest('/routes', 'GET', params);
};

export const getRouteStops = async (routeId: string): Promise<ApiResponse<Stop[]>> => {
  return apiRequest(`/routes/${routeId}/stops`, 'GET');
};

export const getRouteStopsMock = getRouteStops; // Alias

export const getRouteStopsWithStudentsMock = async (routeId: string): Promise<ApiResponse<(Stop & { students: Student[] })[]>> => {
  const response = await apiRequest<{ stops: (Stop & { students: Student[] })[] }>(`/routes/${routeId}/students`, 'GET');
  return {
    success: response.success,
    message: response.message,
    data: response.data?.stops,
  };
};

// ============================================
// BUS APIs
// ============================================

export const getBuses = async (params?: { branchId?: string; status?: string }): Promise<ApiResponse<Bus[]>> => {
  return apiRequest('/buses', 'GET', params);
};

export const getActiveBuses = async (): Promise<ApiResponse<Bus[]>> => {
  return apiRequest('/buses/active', 'GET');
};

export const updateBusLocation = async (params: { tripId: string; latitude: number; longitude: number; speed?: number }): Promise<ApiResponse<{ message: string }>> => {
  return apiRequest('/buses/location', 'POST', params);
};

// ============================================
// APPROVAL APIs
// ============================================

export const getApprovals = async (params?: { status?: ApprovalStatus; type?: ApprovalType }): Promise<ApiResponse<Approval[]>> => {
  return apiRequest('/approvals', 'GET', params);
};

export const approveRequest = async (params: { approvalId: string; note?: string }): Promise<ApiResponse<Approval>> => {
  return apiRequest(`/approvals/${params.approvalId}/approve`, 'POST', { note: params.note });
};

export const rejectRequest = async (params: { approvalId: string; reason: string }): Promise<ApiResponse<Approval>> => {
  return apiRequest(`/approvals/${params.approvalId}/reject`, 'POST', { reason: params.reason });
};

export const processApproval = async (params: { approvalId: string; status: ApprovalStatus; note?: string }): Promise<ApiResponse<Approval>> => {
  return apiRequest(`/approvals/${params.approvalId}/process`, 'POST', { status: params.status, note: params.note });
};

// ============================================
// HALF-DAY APIs
// ============================================

export const createHalfDayRequest = async (params: { 
  studentId: string; 
  date: string; 
  pickupTime: string; 
  type: 'parent_pickup' | 'early_leave' | 'medical'; 
  pickupBy: string; 
  reason: string 
}): Promise<ApiResponse<Approval>> => {
  return apiRequest('/halfday/create', 'POST', params);
};

export const getTodayHalfDayLeaves = async (): Promise<ApiResponse<Approval[]>> => {
  return apiRequest('/halfday/today', 'GET');
};

// ============================================
// ALERT APIs
// ============================================

export const getAlerts = async (params?: { isAcknowledged?: boolean }): Promise<ApiResponse<Alert[]>> => {
  return apiRequest('/alerts', 'GET', params);
};

export const acknowledgeAlert = async (params: { alertId: string }): Promise<ApiResponse<Alert>> => {
  return apiRequest(`/alerts/${params.alertId}/acknowledge`, 'POST');
};

// ============================================
// NOTIFICATION APIs
// ============================================

export const getNotifications = async (params?: { unreadOnly?: boolean }): Promise<ApiResponse<Notification[]>> => {
  return apiRequest('/notifications', 'GET', params);
};

export const markNotificationRead = async (notificationId: string): Promise<ApiResponse<{ message: string }>> => {
  return apiRequest(`/notifications/${notificationId}/read`, 'POST');
};

export const markAllNotificationsRead = async (): Promise<ApiResponse<{ message: string }>> => {
  return apiRequest('/notifications/read-all', 'POST');
};

// ============================================
// SCHOOL APIs
// ============================================

export const getSchools = async (): Promise<ApiResponse<School[]>> => {
  return apiRequest('/schools', 'GET');
};

// ============================================
// ISSUE REPORTING APIs
// ============================================

export const getIssueCategories = async (): Promise<ApiResponse<IssueCategory[]>> => {
  return apiRequest('/issues/categories', 'GET');
};

export const reportIssue = async (params: { categoryId: string; description: string }): Promise<ApiResponse<{ ticketId: string }>> => {
  return apiRequest('/issues/report', 'POST', params);
};