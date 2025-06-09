import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define types
type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive';
};

type AuthContextType = {
  currentUser: User | null;
  userRole: string;
  allUsers: User[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  addUser: (userData: Omit<User, 'id'>) => void;
};

// Create mock users data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@pln.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: '2',
    name: 'Editor User',
    email: 'editor@pln.com',
    role: 'editor',
    status: 'active',
  },
  {
    id: '3',
    name: 'Viewer User',
    email: 'viewer@pln.com',
    role: 'viewer',
    status: 'active',
  },
  {
    id: '4',
    name: 'Budi Santoso',
    email: 'budi@pln.com',
    role: 'editor',
    status: 'active',
  },
  {
    id: '5',
    name: 'Dewi Putri',
    email: 'dewi@pln.com',
    role: 'viewer',
    status: 'inactive',
  },
];

// Create context
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [allUsers, setAllUsers] = useState<User[]>(mockUsers);
  
  const login = async (email: string, password: string): Promise<void> => {
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.status === 'inactive') {
      throw new Error('User is inactive');
    }
    
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    sessionStorage.setItem('isAuthenticated', 'true');
    
    return Promise.resolve();
  };
  
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('isAuthenticated');
  };
  
  const updateUser = (updatedUser: User) => {
    const newUsers = allUsers.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    );
    
    setAllUsers(newUsers);
    
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };
  
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      id: uuidv4(),
      ...userData,
    };
    
    setAllUsers([...allUsers, newUser]);
  };
  
  const value = {
    currentUser,
    userRole: currentUser?.role || '',
    allUsers,
    login,
    logout,
    updateUser,
    addUser,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};