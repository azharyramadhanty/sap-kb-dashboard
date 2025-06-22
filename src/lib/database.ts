import mongoose from 'mongoose';

// MongoDB Connection
export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'users',
  timestamps: true
});

// Document Schema
const documentSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['SAP CMCT', 'SAP FI', 'SAP QM'], 
    required: true,
    index: true 
  },
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  uploaderName: { type: String, required: true },
  blobUrl: { type: String },
  accessUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  tags: [{ type: String, index: true }],
  archivedAt: { type: Date, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'documents',
  timestamps: true
});

// Activity Schema
const activitySchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['upload', 'view', 'download', 'archive', 'restore', 'delete', 'share'],
    required: true,
    index: true
  },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
  documentName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  collection: 'activities',
  timestamps: false
});

// Session Schema
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  token: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true, index: true }
}, {
  collection: 'sessions',
  timestamps: true
});

// Create indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });

documentSchema.index({ uploaderId: 1, archivedAt: 1 });
documentSchema.index({ category: 1, archivedAt: 1 });
documentSchema.index({ accessUsers: 1, archivedAt: 1 });
documentSchema.index({ createdAt: -1 });

activitySchema.index({ timestamp: -1 });
activitySchema.index({ userId: 1, timestamp: -1 });

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Export Models
export const User = mongoose.model('User', userSchema);
export const Document = mongoose.model('Document', documentSchema);
export const Activity = mongoose.model('Activity', activitySchema);
export const Session = mongoose.model('Session', sessionSchema);