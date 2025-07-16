// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import axios from 'axios';

interface UserInfo {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  token: string;
}

interface AuthContextType {
  userInfo: UserInfo | null;
  login: (userData: UserInfo) => void;
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
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

  const fetchUserProfile = useCallback(async () => {
    const stored = localStorage.getItem('userInfo');
    const localUserInfo: UserInfo | null = stored ? JSON.parse(stored) : null;

    if (!localUserInfo?.token) {
      setUserInfo(null);
      localStorage.removeItem('userInfo');
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
    }
  }, []);

  // Fetch profile only once when AuthProvider mounts
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const login = (userData: UserInfo) => {
    setUserInfo(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider
      value={{ userInfo, login, logout, fetchUserProfile }}
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
