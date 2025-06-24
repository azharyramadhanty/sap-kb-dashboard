import { User, Session } from '../types';
import { connectDatabase, User as UserModel, Session as SessionModel } from './database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

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
      await connectDatabase();
      
      // Find user by email
      const userDoc = await UserModel.findOne({ email, status: 'active' });
      
      if (!userDoc) {
        throw new Error('Invalid credentials');
      }

      // For demo purposes, we'll use a simple password check
      // In production, you should use proper password hashing
      if (password !== 'password') {
        throw new Error('Invalid credentials');
      }

      const user: User = {
        id: userDoc._id.toString(),
        email: userDoc.email,
        name: userDoc.name,
        role: userDoc.role,
        status: userDoc.status,
        createdAt: userDoc.createdAt.toISOString(),
        updatedAt: userDoc.updatedAt.toISOString()
      };

      // Create session
      const session: Session = {
        user,
        token: uuidv4(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      this.currentSession = session;
      
      // Save session to MongoDB
      const sessionDoc = new SessionModel({
        userId: userDoc._id,
        token: session.token,
        expiresAt: new Date(session.expiresAt)
      });
      await sessionDoc.save();
      
      localStorage.setItem('session', JSON.stringify(session));

      return session;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (this.currentSession) {
      try {
        await connectDatabase();
        await SessionModel.deleteOne({ token: this.currentSession.token });
      } catch (error) {
        console.error('Error deleting session from database:', error);
      }
      
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
      await connectDatabase();
      const users = await UserModel.find({ status: 'active' }).sort({ name: 1 });
      
      return users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
}

export const authService = new AuthService();