// MongoDB initialization script
db = db.getSiblingDB('pln-knowledge-management');

// Create collections
db.createCollection('users');
db.createCollection('documents');
db.createCollection('document_access');
db.createCollection('activities');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.documents.createIndex({ "uploaderId": 1 });
db.documents.createIndex({ "category": 1 });
db.documents.createIndex({ "createdAt": -1 });
db.document_access.createIndex({ "documentId": 1, "userId": 1 }, { unique: true });
db.activities.createIndex({ "createdAt": -1 });
db.activities.createIndex({ "documentId": 1 });
db.activities.createIndex({ "userId": 1 });

// Insert default admin user (you should change this password)
db.users.insertOne({
  _id: ObjectId(),
  email: "admin@pln.com",
  name: "System Administrator",
  role: "ADMIN",
  status: "ACTIVE",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9w5KS", // password: "password"
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully');