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
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        // If we have a session, load the user profile
        if (session?.user && mounted) {
          await loadUserProfile(session.user.id);
        }
        
        // Load all users regardless of session status
        if (mounted) {
          await refreshUsers();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true);
        loadUserProfile(session.user.id).then(_ => refreshUsers().then(_ => setLoading(false)));
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Don't set loading for token refresh, just ensure user profile is current
        await loadUserProfile(session.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      // If no profile exists, create a default one
      if (!profile) {
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user) {
          const newProfile = {
            id: userId,
            email: authUser.user.email || '',
            name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'User',
            role: 'viewer' as const,
            status: 'active' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .insert([newProfile])
            .select()
            .single();

          if (createError) {
            console.error('Error creating user profile:', createError);
            return;
          }

          setCurrentUser(createdProfile);
          localStorage.setItem('currentUser', JSON.stringify(createdProfile));
          return;
        }
      }

      setCurrentUser(profile);
      if (profile) {
        localStorage.setItem('currentUser', JSON.stringify(profile));
      }
      return;
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
      return;
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error('Invalid email or password');
      }

      // The onAuthStateChange listener will handle loading the user profile
      // so we don't need to do it here explicitly
    } catch (error: any) {
      console.error('Login error:', error);
      setLoading(false);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
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
    loading: loading && !initialized, // Only show loading if not initialized
    login,
    logout,
    updateUser,
    addUser,
    refreshUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};