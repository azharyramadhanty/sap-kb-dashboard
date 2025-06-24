import { User, Session } from '../types';
import { apiClient } from './api';

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
      const response = await apiClient.login(email, password);
      
      const session: Session = {
        user: response.user,
        token: response.token,
        expiresAt: response.expiresAt,
      };

      this.currentSession = session;
      localStorage.setItem('session', JSON.stringify(session));

      return session;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> => {
    try {
      if (this.currentSession) {
        await apiClient.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
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
      const response = await apiClient.getUsers();
      return response.users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
}

export const authService = new AuthService();