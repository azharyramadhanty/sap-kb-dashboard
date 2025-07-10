import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@prisma/client';
import { ApiResponse, PaginationParams } from '../types/database';
import toast from 'react-hot-toast';

type AuthContextType = {
  currentUser: User | null;
  userRole: string;
  allUsers: User[];
  usersMeta: { total: number; page: number; limit: number; totalPages: number } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => Promise<void>;
  addUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  refreshUsers: (params?: PaginationParams) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = 'https://nonprodchangecopilot.indonesiacentral.cloudapp.azure.com/cms-be';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersMeta, setUsersMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const user = await response.json();
            setCurrentUser(user);
          } else {
            localStorage.removeItem('authToken');
          }
        }

        await refreshUsers();
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const buildQueryParams = (params?: PaginationParams): string => {
    if (!params) return '';
    
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.sort) searchParams.append('sort', params.sort);
    
    return searchParams.toString() ? `?${searchParams.toString()}` : '';
  };

  const refreshUsers = async (params?: PaginationParams) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const queryParams = buildQueryParams(params);
      const response = await fetch(`${API_BASE_URL}/users${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setAllUsers(result.data || []);
        setUsersMeta(result.meta || null);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid email or password');
      }

      const { user, access_token: token } = await response.json();
      
      localStorage.setItem('authToken', token);
      setCurrentUser(user);
      await refreshUsers();
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('authToken');
      setCurrentUser(null);
      setAllUsers([]);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedUser: User): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const user = await response.json();
      
      setAllUsers(prev => prev.map(u => u.id === user.id ? user : u));

      if (currentUser && currentUser.id === user.id) {
        setCurrentUser(user);
      }

      toast.success('User updated successfully');
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
      throw error;
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add user');
      }

      const newUser = await response.json();
      setAllUsers(prev => [...prev, newUser]);
      toast.success('User added successfully');
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(error.message || 'Failed to add user');
      throw error;
    }
  };

  const value = {
    currentUser,
    userRole: currentUser?.role?.toLowerCase() || '',
    allUsers,
    usersMeta,
    loading,
    login,
    logout,
    updateUser,
    addUser,
    refreshUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};