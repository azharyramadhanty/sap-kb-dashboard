const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  category: { type: String, enum: ['SAP CMCT', 'SAP FI', 'SAP QM'], required: true },
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploaderName: { type: String, required: true },
  blobUrl: { type: String, required: true },
  accessUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [String],
  archivedAt: { type: Date, default: null },
}, { timestamps: true });

const activitySchema = new mongoose.Schema({
  type: { type: String, enum: ['upload', 'view', 'download', 'archive', 'restore', 'delete', 'share'], required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  documentName: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
}, { timestamps: true });

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Document = mongoose.model('Document', documentSchema);
const Activity = mongoose.model('Activity', activitySchema);
const Session = mongoose.model('Session', sessionSchema);

// Azure Storage configuration
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerName = process.env.AZURE_STORAGE_CONTAINER || 'documents';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const session = await Session.findOne({ token, expiresAt: { $gt: new Date() } });
    
    if (!session) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Initialize default users
const initializeUsers = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const defaultUsers = [
        { email: 'admin@pln.com', name: 'Admin User', role: 'admin', password: 'password' },
        { email: 'editor@pln.com', name: 'Editor User', role: 'editor', password: 'password' },
        { email: 'viewer@pln.com', name: 'Viewer User', role: 'viewer', password: 'password' },
      ];

      for (const userData of defaultUsers) {
        const passwordHash = await bcrypt.hash(userData.password, 12);
        const user = new User({
          email: userData.email,
          name: userData.name,
          role: userData.role,
          passwordHash,
        });
        await user.save();
        console.log(`Created user: ${userData.email}`);
      }
    }
  } catch (error) {
    console.error('Error initializing users:', error);
  }
};

// Routes

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, status: 'active' });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const session = new Session({
      userId: user._id,
      token,
      expiresAt,
    });
    await session.save();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    await Session.deleteOne({ token });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({ status: 'active' }).select('-passwordHash').sort({ name: 1 });
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Document routes
app.get('/api/documents', authenticateToken, async (req, res) => {
  try {
    let query = { archivedAt: null };
    
    if (req.user.role !== 'admin') {
      query.$or = [
        { uploaderId: req.user._id },
        { accessUsers: req.user._id }
      ];
    }

    const documents = await Document.find(query)
      .populate('uploaderId', 'name email')
      .populate('accessUsers', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/documents/archived', authenticateToken, async (req, res) => {
  try {
    let query = { archivedAt: { $ne: null } };
    
    if (req.user.role !== 'admin') {
      query.$or = [
        { uploaderId: req.user._id },
        { accessUsers: req.user._id }
      ];
    }

    const documents = await Document.find(query)
      .populate('uploaderId', 'name email')
      .populate('accessUsers', 'name email role')
      .sort({ archivedAt: -1 });

    res.json({ documents });
  } catch (error) {
    console.error('Error fetching archived documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/documents/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { category, accessUsers } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Azure Storage
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: 'blob' });

    const timestamp = Date.now();
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${req.user._id}/${timestamp}_${sanitizedFileName}`;
    
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype
      }
    });

    // Save document to database
    const document = new Document({
      name: file.originalname,
      type: file.originalname.split('.').pop() || '',
      size: file.size,
      category: category || 'SAP CMCT',
      uploaderId: req.user._id,
      uploaderName: req.user.name,
      blobUrl: blockBlobClient.url,
      accessUsers: accessUsers ? JSON.parse(accessUsers) : [],
      tags: [],
    });

    await document.save();

    res.json({ document });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/documents/:id/archive', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, uploaderId: req.user._id },
      { archivedAt: new Date() },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ error: 'Document not found or access denied' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Error archiving document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/documents/:id/restore', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, uploaderId: req.user._id },
      { archivedAt: null },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ error: 'Document not found or access denied' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Error restoring document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, uploaderId: req.user._id });
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found or access denied' });
    }

    // Delete from Azure Storage
    if (document.blobUrl) {
      try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const url = new URL(document.blobUrl);
        const blobName = url.pathname.split('/').slice(2).join('/');
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();
      } catch (storageError) {
        console.warn('Failed to delete file from Azure Storage:', storageError);
      }
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/documents/:id/download', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      $or: [
        { uploaderId: req.user._id },
        { accessUsers: req.user._id }
      ]
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found or access denied' });
    }

    res.json({ downloadUrl: document.blobUrl });
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/documents/:id/share', authenticateToken, async (req, res) => {
  try {
    const { userIds } = req.body;
    
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, uploaderId: req.user._id },
      { $addToSet: { accessUsers: { $each: userIds } } },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ error: 'Document not found or access denied' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Error sharing document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Activity routes
app.get('/api/activities', authenticateToken, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role !== 'admin') {
      // Users can only see activities for documents they have access to
      const userDocuments = await Document.find({
        $or: [
          { uploaderId: req.user._id },
          { accessUsers: req.user._id }
        ]
      }).select('_id');
      
      const documentIds = userDocuments.map(doc => doc._id);
      query.documentId = { $in: documentIds };
    }

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/activities', authenticateToken, async (req, res) => {
  try {
    const { type, documentId, documentName } = req.body;

    const activity = new Activity({
      type,
      documentId,
      documentName,
      userId: req.user._id,
      userName: req.user.name,
    });

    await activity.save();
    res.json({ activity });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeUsers();
});