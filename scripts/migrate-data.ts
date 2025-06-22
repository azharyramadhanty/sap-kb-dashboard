import { connectDatabase, User, Document, Activity } from '../src/lib/database';
import { documentStore } from '../src/lib/storage';
import bcrypt from 'bcryptjs';

async function migrateData() {
  try {
    console.log('🚀 Starting data migration...');
    
    // Connect to MongoDB
    await connectDatabase();
    
    // Clear existing data (optional - remove in production)
    await User.deleteMany({});
    await Document.deleteMany({});
    await Activity.deleteMany({});
    
    console.log('📝 Migrating users...');
    
    // Migrate users
    const users = documentStore.getAllUsers();
    const userIdMap = new Map<string, string>();
    
    for (const user of users) {
      const passwordHash = await bcrypt.hash('password', 12);
      
      const newUser = new User({
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        passwordHash,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      });
      
      await newUser.save();
      userIdMap.set(user.id, newUser._id.toString());
      console.log(`✅ Migrated user: ${user.email}`);
    }
    
    console.log('📄 Migrating documents...');
    
    // Migrate documents
    const documents = documentStore.getAllDocuments();
    const documentIdMap = new Map<string, string>();
    
    for (const doc of documents) {
      const newUploaderId = userIdMap.get(doc.uploaderId);
      if (!newUploaderId) continue;
      
      const accessUserIds = doc.accessUsers
        .map(userId => userIdMap.get(userId))
        .filter(Boolean);
      
      const newDocument = new Document({
        name: doc.name,
        type: doc.type,
        size: doc.size,
        category: doc.category,
        uploaderId: newUploaderId,
        uploaderName: doc.uploaderName,
        blobUrl: doc.blobUrl,
        accessUsers: accessUserIds,
        tags: doc.tags,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
        ...(doc.archivedAt && { archivedAt: new Date(doc.archivedAt) })
      });
      
      await newDocument.save();
      documentIdMap.set(doc.id, newDocument._id.toString());
      console.log(`✅ Migrated document: ${doc.name}`);
    }
    
    console.log('📊 Migrating activities...');
    
    // Migrate activities
    const activities = documentStore.getRecentActivities(100);
    
    for (const activity of activities) {
      const newUserId = userIdMap.get(activity.userId);
      const newDocumentId = documentIdMap.get(activity.documentId);
      
      if (!newUserId || !newDocumentId) continue;
      
      const newActivity = new Activity({
        type: activity.type,
        documentId: newDocumentId,
        documentName: activity.documentName,
        userId: newUserId,
        userName: activity.userName,
        timestamp: new Date(activity.timestamp)
      });
      
      await newActivity.save();
      console.log(`✅ Migrated activity: ${activity.type} - ${activity.documentName}`);
    }
    
    console.log('🎉 Migration completed successfully!');
    console.log(`📊 Migrated: ${users.length} users, ${documents.length} documents, ${activities.length} activities`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run migration
migrateData();