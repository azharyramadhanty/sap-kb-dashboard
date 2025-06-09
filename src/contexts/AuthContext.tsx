import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import toast from 'react-hot-toast';

type UserProfile = Database['public']['Tables']['users']['Row'];

type AuthContextType = {
  currentUser: UserProfile | null;
  userRole: string;
  allUsers: UserProfile[];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: UserProfile) => Promise<void>;
  addUser: (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  refreshUsers: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
      
      await refreshUsers();
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      setCurrentUser(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const refreshUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setAllUsers(users || []);
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      // First, try to sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // If auth fails, check if user exists in our users table (for demo purposes)
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase())
          .eq('status', 'active')
          .single();

        if (userError || !user) {
          throw new Error('Invalid email or password');
        }

        // For demo purposes, create a session manually
        // In production, you'd want proper authentication
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return;
      }

      // If auth succeeds, load the user profile
      if (authData.user) {
        await loadUserProfile(authData.user.id);
        await refreshUsers();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updatedUser: UserProfile): Promise<void> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updatedUser.name,
          role: updatedUser.role,
          status: updatedUser.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedUser.id);

      if (error) {
        throw error;
      }

      // Update local state
      setAllUsers(prev => prev.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));

      if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }

      toast.success('User updated successfully');
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
      throw error;
    }
  };

  const addUser = async (userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    try {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setAllUsers(prev => [...prev, newUser]);
      toast.success('User added successfully');
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
      throw error;
    }
  };

  const value = {
    currentUser,
    userRole: currentUser?.role || '',
    allUsers,
    loading,
    login,
    logout,
    updateUser,
    addUser,
    refreshUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};