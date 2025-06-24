import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../lib/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: 'read' | 'write' | 'admin') => boolean;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    // Initialize auth state
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    // Load all users
    loadAllUsers();
    setLoading(false);
  }, []);

  const loadAllUsers = async () => {
    try {
      const users = await authService.getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const session = await authService.login(email, password);
      setCurrentUser(session.user);
      await loadAllUsers(); // Refresh users list after login
      toast.success(`Welcome back, ${session.user.name}!`);
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    authService.logout();
    setCurrentUser(null);
    setAllUsers([]);
    toast.success('Logged out successfully');
  };

  const hasPermission = (permission: 'read' | 'write' | 'admin'): boolean => {
    return authService.hasPermission(permission);
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    hasPermission,
    allUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};