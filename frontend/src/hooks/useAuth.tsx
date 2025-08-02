import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';
import { User, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Get current user (simplified version)
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Create a mock user if we have a valid token
      // In a real app, you'd fetch this from the server
      const mockUser: User = {
        id: 1,
        email: 'user@example.com',
        username: 'user',
        full_name: 'Test User',
        is_active: true,
        is_superuser: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } else {
      setUser(null);
      localStorage.removeItem('user');
    }
    setIsLoading(false);
  }, []);

  // Login mutation
  const loginMutation = useMutation(authApi.login, {
    onSuccess: (response) => {
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      queryClient.invalidateQueries('currentUser');
      toast.success('Login successful!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Login failed');
    },
  });

  // Register mutation
  const registerMutation = useMutation(authApi.register, {
    onSuccess: () => {
      toast.success('Registration successful! Please login.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Registration failed');
    },
  });

  const login = async (data: LoginRequest) => {
    const response = await loginMutation.mutateAsync(data);
    // Update user state immediately after successful login
    const mockUser: User = {
      id: 1,
      email: data.email,
      username: 'user',
      full_name: 'Test User',
      is_active: true,
      is_superuser: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const register = async (data: RegisterRequest) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    queryClient.clear();
    toast.success('Logged out successfully');
    // Don't redirect here, let the component handle it
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading: isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};