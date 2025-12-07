export const Colors = {
  primary: '#95E26E',
  primaryDark: '#7ac756',
  background: '#F8F9FA',
  text: '#1A1A1A',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
  white: '#FFFFFF',
  error: '#DC3545',
};

// --- MOCK API SERVICE ---
export const MockApi = {
  // --- AUTHENTICATION METHODS ---
  sendOtp: async (phoneNumber: string) => {
    console.log(`[API] Sending OTP to ${phoneNumber}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: "OTP Sent" });
      }, 1000); 
    });
  },

  verifyOtp: async (phoneNumber: string, otp: string) => {
    console.log(`[API] Verifying OTP: ${otp} for ${phoneNumber}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Allow 000000 as the magic OTP
        if (otp === '000000') {
          resolve({ 
            success: true, 
            token: 'dummy-jwt-token-123',
            user: { name: 'Agni Kumar', role: 'Bus Attendant', id: 1 } 
          });
        } else {
          reject({ success: false, message: "Invalid OTP" });
        }
      }, 1000);
    });
  },

  // --- DASHBOARD METHODS ---
  getDashboardData: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          attendant: { name: 'Agni Kumar', role: 'Bus Attendant' },
          bus: { routeNumber: '11', busNumber: 'TS09 EK 3274' },
          today: 'Monday, 15 October',
          activeTrip: null,
          stats: {
            pickup: { time: '6:30 AM - 8:00 AM', stops: 5, students: 23 },
            dropoff: { time: '2:30 PM - 4:00 PM', stops: 5, students: 23 }
          }
        });
      }, 500);
    });
  },

  getStudents: async () => {
    return [
      { id: 1, name: "Aarav Sharma", class: "5-A", status: "Boarded" },
      { id: 2, name: "Vivaan Gupta", class: "4-B", status: "Pending" },
      { id: 3, name: "Aditya Verma", class: "5-A", status: "Absent" },
      { id: 4, name: "Vihaan Singh", class: "6-C", status: "Pending" },
    ];
  }
};