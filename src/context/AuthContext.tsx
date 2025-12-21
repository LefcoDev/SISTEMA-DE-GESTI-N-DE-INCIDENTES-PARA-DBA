import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/axios';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  full_name?: string;
  profile_picture?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Verify token and get user data
          const response = await api.get('/auth/me');
          // The API returns { success: true, data: { user: ... } }
          if (response.data.data && response.data.data.user) {
            setUser(response.data.data.user);
          } else {
            // Fallback if structure is different
            setUser(response.data);
          }
          setToken(storedToken);
        } catch (error: any) {
          // Only log error if it's not a 401 (Unauthorized) which is expected when token expires
          if (error.response && error.response.status !== 401) {
            console.error('Auth initialization failed:', error);
          }
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
