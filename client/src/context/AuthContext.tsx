// src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react';
import axios from 'axios';

interface UserInfo {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  token: string; // Ensure token is part of UserInfo
}

interface AuthContextType {
  userInfo: UserInfo | null;
  loading: boolean; // Declared here as required
  userToken: string | null;
  login: (userData: UserInfo) => void;
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
  setUserInfo: Dispatch<SetStateAction<UserInfo | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    try {
      const storedUser = localStorage.getItem('userInfo');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Failed to parse userInfo from localStorage', error);
      return null;
    }
  });

  // 1. Introduce the loading state
  const [loading, setLoading] = useState(true); // Initialize as true, as we'll check local storage/fetch on mount

  // Derive userToken from userInfo
  const userToken = userInfo?.token || null;

  const fetchUserProfile = useCallback(async () => {
    setLoading(true); // Set loading to true at the start of the fetch
    const stored = localStorage.getItem('userInfo');
    const localUserInfo: UserInfo | null = stored ? JSON.parse(stored) : null;

    if (!localUserInfo?.token) {
      setUserInfo(null);
      localStorage.removeItem('userInfo');
      setLoading(false); // Set loading to false if no token
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localUserInfo.token}`,
        },
      };
      const { data } = await axios.get(
        'https://studyhabitcollege.onrender.com/api/users/profile',
        config
      );
      const updatedUserInfo = { ...localUserInfo, ...data };
      setUserInfo(updatedUserInfo);
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserInfo(null);
      localStorage.removeItem('userInfo');
    } finally {
      setLoading(false); // Set loading to false when fetch is complete (success or fail)
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const login = (userData: UserInfo) => {
    setLoading(true); // Set loading to true during login process
    setUserInfo(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setLoading(false); // Set loading to false after login
  };

  const logout = () => {
    setLoading(true); // Set loading to true during logout process
    setUserInfo(null);
    localStorage.removeItem('userInfo');
    setLoading(false); // Set loading to false after logout
  };

  return (
    <AuthContext.Provider
      value={{ userInfo, loading, userToken, login, logout, fetchUserProfile, setUserInfo }} // 2. Pass 'loading' here
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};