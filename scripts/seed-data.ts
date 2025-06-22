import dotenv from 'dotenv';
import { connectDatabase, User, Document, Activity } from '../src/lib/database';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

async function seedData() {
  try {
    console.log('🌱 Seeding additional sample data...');
    
    // Connect to MongoDB
    await connectDatabase();
    
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('📊 Users already exist, skipping user creation');
    } else {
      console.log('👥 Creating sample users...');
      
      const users = [
        {
          email: 'admin@pln.com',
          name: 'Admin User',
          role: 'admin',
          status: 'active'
        },
        {
          email: 'editor@pln.com',
          name: 'Editor User',
          role: 'editor',
          status: 'active'
        },
        {
          email: 'viewer@pln.com',
          name: 'Viewer User',
          role: 'viewer',
          status: 'active'
        },
        {
          email: 'john.doe@pln.com',
          name: 'John Doe',
          role: 'editor',
          status: 'active'
        },
        {
          email: 'jane.smith@pln.com',
          name: 'Jane Smith',
          role: 'viewer',
          status: 'active'
        }
      ];

      for (const userData of users) {
        const passwordHash = await bcrypt.hash('password', 12);
        
        const user = new User({
          ...userData,
          passwordHash
        });
        
        await user.save();
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      }
    }

    // Get all users for document creation
    const allUsers = await User.find();
    const adminUser = allUsers.find(u => u.role === 'admin');
    const editorUser = allUsers.find(u => u.role === 'editor');
    
    if (!adminUser || !editorUser) {
      throw new Error('Admin or Editor user not found');
    }

    // Check if documents already exist
    const existingDocs = await Document.countDocuments();
    if (existingDocs > 0) {
      console.log('📄 Documents already exist, skipping document creation');
    } else {
      console.log('📄 Creating sample documents...');
      
      const documents = [
        {
          name: 'SAP CMCT Implementation Guide.pdf',
          type: 'pdf',
          size: 2048000,
          category: 'SAP CMCT',
          uploaderId: adminUser._id,
          uploaderName: adminUser.name,
          accessUsers: [adminUser._id, editorUser._id],
          tags: ['implementation', 'guide', 'cmct']
        },
        {
          name: 'Financial Reporting Standards.docx',
          type: 'docx',
          size: 1024000,
          category: 'SAP FI',
          uploaderId: editorUser._id,
          uploaderName: editorUser.name,
          accessUsers: [editorUser._id],
          tags: ['financial', 'reporting', 'standards']
        },
        {
          name: 'Quality Management Procedures.pptx',
          type: 'pptx',
          size: 3072000,
          category: 'SAP QM',
          uploaderId: adminUser._id,
          uploaderName: adminUser.name,
          accessUsers: [adminUser._id],
          tags: ['quality', 'management', 'procedures']
        },
        {
          name: 'SAP CMCT User Manual.pdf',
          type: 'pdf',
          size: 1536000,
          category: 'SAP CMCT',
          uploaderId: editorUser._id,
          uploaderName: editorUser.name,
          accessUsers: [editorUser._id, adminUser._id],
          tags: ['user', 'manual', 'cmct']
        },
        {
          name: 'Financial Year-End Procedures.docx',
          type: 'docx',
          size: 768000,
          category: 'SAP FI',
          uploaderId: adminUser._id,
          uploaderName: adminUser.name,
          accessUsers: [adminUser._id],
          tags: ['year-end', 'procedures', 'financial']
        }
      ];

      for (const docData of documents) {
        const document = new Document(docData);
        await document.save();
        console.log(`✅ Created document: ${docData.name} (${docData.category})`);
      }
    }

    // Create sample activities
    const documents = await Document.find().limit(3);
    const users = await User.find().limit(3);
    
    console.log('📊 Creating sample activities...');
    
    const activities = [
      {
        type: 'upload',
        documentId: documents[0]._id,
        documentName: documents[0].name,
        userId: users[0]._id,
        userName: users[0].name,
        timestamp: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        type: 'view',
        documentId: documents[0]._id,
        documentName: documents[0].name,
        userId: users[1]._id,
        userName: users[1].name,
        timestamp: new Date(Date.now() - 43200000) // 12 hours ago
      },
      {
        type: 'download',
        documentId: documents[1]._id,
        documentName: documents[1].name,
        userId: users[2]._id,
        userName: users[2].name,
        timestamp: new Date(Date.now() - 21600000) // 6 hours ago
      }
    ];

    for (const activityData of activities) {
      const activity = new Activity(activityData);
      await activity.save();
      console.log(`✅ Created activity: ${activityData.type} - ${activityData.documentName}`);
    }
    
    console.log('\n🎉 Seeding completed successfully!');
    console.log(`📊 Database now contains:`);
    console.log(`   👥 Users: ${await User.countDocuments()}`);
    console.log(`   📄 Documents: ${await Document.countDocuments()}`);
    console.log(`   📊 Activities: ${await Activity.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  } finally {
    process.exit(0);
  }
}

// Run seeding
seedData();