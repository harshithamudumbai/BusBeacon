// ============================================
// ASYNC STORAGE SERVICE
// Uses AsyncStorage for React Native
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppRole, UserProfile } from './api-rest';
//Ensure storage.ts only imports Types (AppRole, UserProfile) from api-rest.ts. Types are stripped out during compilation, so they don't cause runtime cycles. you are 100% safe.

const STORAGE_KEYS = {
  AUTH_TOKEN: 'busbeacon_auth_token',
  USER_DATA: 'busbeacon_user_data',
  SELECTED_ROLE: 'busbeacon_selected_role',
  FIRST_TIME: 'busbeacon_first_time',
  TERMS_ACCEPTED: 'busbeacon_terms_accepted',
  SHOW_WELCOME: 'busbeacon_show_welcome',
} as const;

// ============================================
// AUTH STORAGE
// ============================================

export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

// ============================================
// USER DATA STORAGE
// ============================================

export interface StoredUserData extends UserProfile {}

export const saveUserData = async (userData: StoredUserData): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const getUserData = async (): Promise<StoredUserData | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const removeUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

// ============================================
// SELECTED ROLE STORAGE
// ============================================

export const saveSelectedRole = async (role: AppRole): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_ROLE, role);
  } catch (error) {
    console.error('Error saving selected role:', error);
  }
};

export const getSelectedRole = async (): Promise<AppRole | null> => {
  try {
    const role = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_ROLE);
    return role as AppRole | null;
  } catch (error) {
    console.error('Error getting selected role:', error);
    return null;
  }
};

export const removeSelectedRole = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_ROLE);
  } catch (error) {
    console.error('Error removing selected role:', error);
  }
};

// ============================================
// APP STATE STORAGE
// ============================================

export const isFirstTime = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_TIME);
    return value !== 'false';
  } catch (error) {
    return true;
  }
};

export const setFirstTimeComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FIRST_TIME, 'false');
  } catch (error) {
    console.error('Error setting first time:', error);
  }
};

export const isTermsAccepted = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.TERMS_ACCEPTED);
    return value === 'true';
  } catch (error) {
    return false;
  }
};

export const setTermsAccepted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TERMS_ACCEPTED, 'true');
    await AsyncStorage.setItem(STORAGE_KEYS.SHOW_WELCOME, 'true');
  } catch (error) {
    console.error('Error setting terms accepted:', error);
  }
};

// ============================================
// CLEAR ALL STORAGE (for logout)
// ============================================

export const clearAllStorage = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};
// ============================================
// WELCOME MODAL STATE
// ============================================

export const shouldShowWelcome = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.SHOW_WELCOME);
    return value === 'true';
  } catch (error) {
    return false;
  }
};

export const clearShowWelcome = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SHOW_WELCOME);
  } catch (error) {
    console.error('Error clearing show welcome:', error);
  }
};




// ============================================
// CHECK AUTH STATUS
// ============================================

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return !!token;
};