import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AppRole, UserProfile } from '../services/api-rest';
import {
  clearAllStorage,
  getAuthToken,
  getSelectedRole,
  getUserData,
  removeSelectedRole,
  saveAuthToken,
  saveSelectedRole,
  saveUserData,
  StoredUserData,
} from '../services/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: StoredUserData | null;
  selectedRole: AppRole | null;
  hasMultipleRoles: boolean;
  login: (token: string, user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  selectRole: (role: AppRole) => Promise<void>;
  switchRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<StoredUserData | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);

  const hasMultipleRoles = (user?.roles?.length || 0) > 1;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getAuthToken();
      const userData = await getUserData();
      const savedRole = await getSelectedRole();
      console.log(userData);
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(userData);
        // If user has single role, auto-select it
        if (userData.roles?.length === 1) {
          setSelectedRole(userData.roles[0]);
        } else if (savedRole && userData.roles?.includes(savedRole)) {
          setSelectedRole(savedRole);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, userProfile: UserProfile) => {
    await saveAuthToken(token);
    await saveUserData(userProfile);
    setIsAuthenticated(true);
    setUser(userProfile);
    
    // Auto-select role if only one
    if (userProfile.roles?.length === 1) {
      const role = userProfile.roles[0];
      await saveSelectedRole(role);
      setSelectedRole(role);
    }
  };

  const logout = async () => {
    await clearAllStorage();
    setIsAuthenticated(false);
    setUser(null);
    setSelectedRole(null);
  };

  const selectRole = async (role: AppRole) => {
    if (user?.roles?.includes(role)) {
      await saveSelectedRole(role);
      setSelectedRole(role);
    }
  };

  const switchRole = async () => {
    await removeSelectedRole();
    setSelectedRole(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user, 
      selectedRole,
      hasMultipleRoles,
      login, 
      logout,
      selectRole,
      switchRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};