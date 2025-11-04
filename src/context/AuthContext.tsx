import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      // Verify token is still valid
      authAPI.me()
        .then((data) => {
          // Handle both response formats: { user: {...} } or direct user object
          const userData = data.user || data;
          setUser(userData);
          // Update localStorage with latest user data
          localStorage.setItem('authUser', JSON.stringify(userData));
        })
        .catch(() => {
          // Token invalid, clear auth
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authAPI.login(username, password);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('authUser', JSON.stringify(response.user));
    return response; // Return response so component can check role
  };

  const logout = () => {
    authAPI.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isLoading,
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

