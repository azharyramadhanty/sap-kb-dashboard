import { User, Session } from '../types';
import { documentStore } from './storage';
import { v4 as uuidv4 } from 'uuid';

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
    // Simulate authentication - in production, this would validate against a secure backend
    const user = documentStore.getUserByEmail(email);
    
    if (!user || password !== 'password') {
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new Error('Account is inactive');
    }

    // Create session
    const session: Session = {
      user,
      token: uuidv4(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    this.currentSession = session;
    documentStore.createSession(session);
    localStorage.setItem('session', JSON.stringify(session));

    return session;
  }

  logout(): void {
    if (this.currentSession) {
      documentStore.deleteSession(this.currentSession.token);
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
}

export const authService = new AuthService();