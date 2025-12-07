import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthType = {
  user: any | null;
  isLoading: boolean;
  signIn: (token: string, userData: any) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthType>({
  user: null,
  isLoading: true,
  signIn: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('userData');
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.error("Failed to load user", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const signIn = async (token: string, userData: any) => {
    setIsLoading(true);
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setIsLoading(false);
    router.replace('./(tabs)/index'); // Navigate to Home
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};