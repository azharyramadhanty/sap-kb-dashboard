import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Session } from './database';
import { User as UserType, Session as SessionType } from '../types';

class AuthService {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
  }

  async login(email: string, password: string): Promise<SessionType> {
    try {
      // Find user by email
      const user = await User.findOne({ email, status: 'active' });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        this.jwtSecret,
        { expiresIn: '24h' }
      );

      // Create session
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const session = new Session({
        userId: user._id,
        token,
        expiresAt
      });

      await session.save();

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        },
        token,
        expiresAt: expiresAt.toISOString()
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(token: string): Promise<void> {
    try {
      await Session.deleteOne({ token });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async validateToken(token: string): Promise<UserType | null> {
    try {
      // Verify JWT
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      // Check if session exists and is valid
      const session = await Session.findOne({ 
        token, 
        expiresAt: { $gt: new Date() } 
      }).populate('userId');

      if (!session) {
        return null;
      }

      const user = await User.findById(decoded.userId);
      if (!user || user.status !== 'active') {
        return null;
      }

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      };
    } catch (error) {
      return null;
    }
  }

  async getAllUsers(): Promise<UserType[]> {
    try {
      const users = await User.find({ status: 'active' }).sort({ name: 1 });
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

  async createUser(userData: Omit<UserType, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<UserType> {
    try {
      const passwordHash = await bcrypt.hash(userData.password, 12);
      
      const user = new User({
        email: userData.email,
        name: userData.name,
        role: userData.role,
        status: userData.status,
        passwordHash
      });

      await user.save();

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  hasPermission(userRole: string, permission: 'read' | 'write' | 'admin'): boolean {
    switch (permission) {
      case 'read':
        return ['viewer', 'editor', 'admin'].includes(userRole);
      case 'write':
        return ['editor', 'admin'].includes(userRole);
      case 'admin':
        return userRole === 'admin';
      default:
        return false;
    }
  }
}

export const authService = new AuthService();