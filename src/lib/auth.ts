import { User, Session } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock users for demo purposes
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@company.com',
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'editor@company.com',
    name: 'Editor User',
    role: 'editor',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'viewer@company.com',
    name: 'Viewer User',
    role: 'viewer',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class AuthService {
  private currentSession: Session | null = null;

  constructor() {
    // Check for existing session in localStorage
    const savedSession = localStorage.getItem('session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (new Date(session.expiresAt) > new Date()) {
          this.currentSession = session;
        } else {
          localStorage.removeItem('session');
        }
      } catch (error) {
        localStorage.removeItem('session');
      }
    }
  }

  async login(email: string, password: string): Promise<Session> {
    try {
      // Find user by email in mock data
      const userDoc = mockUsers.find(user => user.email === email && user.status === 'active');
      
      if (!userDoc) {
        throw new Error('Invalid credentials');
      }

      // For demo purposes, we'll use a simple password check
      // In production, you should use proper password hashing
      if (password !== 'password') {
        throw new Error('Invalid credentials');
      }

      const user: User = {
        id: userDoc.id,
        email: userDoc.email,
        name: userDoc.name,
        role: userDoc.role,
        status: userDoc.status,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt
      };

      // Create session
      const session: Session = {
        user,
        token: uuidv4(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      this.currentSession = session;
      localStorage.setItem('session', JSON.stringify(session));

      return session;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (this.currentSession) {
      this.currentSession = null;
      localStorage.removeItem('session');
    }
  }

  getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return !!this.currentSession && new Date(this.currentSession.expiresAt) > new Date();
  }

  hasRole(role: string): boolean {
    return this.currentSession?.user.role === role;
  }

  hasPermission(permission: 'read' | 'write' | 'admin'): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    switch (permission) {
      case 'read':
        return ['viewer', 'editor', 'admin'].includes(user.role);
      case 'write':
        return ['editor', 'admin'].includes(user.role);
      case 'admin':
        return user.role === 'admin';
      default:
        return false;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      // Return mock users for demo
      return mockUsers.filter(user => user.status === 'active').sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
}

export const authService = new AuthService();