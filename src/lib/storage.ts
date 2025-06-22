import { Document, User, Activity, Session } from '../types';

// Simulated CosmosDB-style key-value storage
class DocumentStore {
  private storage: Map<string, any> = new Map();
  private indexes: Map<string, Set<string>> = new Map();

  // Initialize with sample data
  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample users
    const users: User[] = [
      {
        id: 'user-admin-1',
        email: 'admin@pln.com',
        name: 'Admin User',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'user-editor-1',
        email: 'editor@pln.com',
        name: 'Editor User',
        role: 'editor',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'user-viewer-1',
        email: 'viewer@pln.com',
        name: 'Viewer User',
        role: 'viewer',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    users.forEach(user => {
      this.storage.set(`user:${user.id}`, user);
      this.addToIndex('users', user.id);
      this.addToIndex(`user-email:${user.email}`, user.id);
    });

    // Sample documents
    const documents: Document[] = [
      {
        id: 'doc-1',
        name: 'SAP CMCT Implementation Guide.pdf',
        type: 'pdf',
        size: 2048000,
        category: 'SAP CMCT',
        uploaderId: 'user-admin-1',
        uploaderName: 'Admin User',
        accessUsers: ['user-admin-1', 'user-editor-1'],
        tags: ['implementation', 'guide', 'cmct'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'doc-2',
        name: 'Financial Reporting Standards.docx',
        type: 'docx',
        size: 1024000,
        category: 'SAP FI',
        uploaderId: 'user-editor-1',
        uploaderName: 'Editor User',
        accessUsers: ['user-editor-1', 'user-viewer-1'],
        tags: ['financial', 'reporting', 'standards'],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    documents.forEach(doc => {
      this.storage.set(`document:${doc.id}`, doc);
      this.addToIndex('documents', doc.id);
      this.addToIndex(`documents-category:${doc.category}`, doc.id);
      this.addToIndex(`documents-uploader:${doc.uploaderId}`, doc.id);
    });
  }

  private addToIndex(indexName: string, id: string) {
    if (!this.indexes.has(indexName)) {
      this.indexes.set(indexName, new Set());
    }
    this.indexes.get(indexName)!.add(id);
  }

  private removeFromIndex(indexName: string, id: string) {
    this.indexes.get(indexName)?.delete(id);
  }

  // Generic CRUD operations
  set(key: string, value: any): void {
    this.storage.set(key, value);
  }

  get(key: string): any {
    return this.storage.get(key);
  }

  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  // Query operations
  query(indexName: string): string[] {
    return Array.from(this.indexes.get(indexName) || []);
  }

  // User operations
  getUserByEmail(email: string): User | null {
    const userIds = this.query(`user-email:${email}`);
    if (userIds.length === 0) return null;
    return this.get(`user:${userIds[0]}`);
  }

  getAllUsers(): User[] {
    const userIds = this.query('users');
    return userIds.map(id => this.get(`user:${id}`)).filter(Boolean);
  }

  createUser(user: User): void {
    this.set(`user:${user.id}`, user);
    this.addToIndex('users', user.id);
    this.addToIndex(`user-email:${user.email}`, user.id);
  }

  updateUser(user: User): void {
    this.set(`user:${user.id}`, user);
  }

  // Document operations
  getAllDocuments(): Document[] {
    const docIds = this.query('documents');
    return docIds.map(id => this.get(`document:${id}`)).filter(Boolean);
  }

  getDocumentsByCategory(category: string): Document[] {
    const docIds = this.query(`documents-category:${category}`);
    return docIds.map(id => this.get(`document:${id}`)).filter(Boolean);
  }

  getDocumentsByUploader(uploaderId: string): Document[] {
    const docIds = this.query(`documents-uploader:${uploaderId}`);
    return docIds.map(id => this.get(`document:${id}`)).filter(Boolean);
  }

  createDocument(document: Document): void {
    this.set(`document:${document.id}`, document);
    this.addToIndex('documents', document.id);
    this.addToIndex(`documents-category:${document.category}`, document.id);
    this.addToIndex(`documents-uploader:${document.uploaderId}`, document.id);
  }

  updateDocument(document: Document): void {
    this.set(`document:${document.id}`, document);
  }

  deleteDocument(id: string): void {
    const doc = this.get(`document:${id}`);
    if (doc) {
      this.removeFromIndex('documents', id);
      this.removeFromIndex(`documents-category:${doc.category}`, id);
      this.removeFromIndex(`documents-uploader:${doc.uploaderId}`, id);
      this.delete(`document:${id}`);
    }
  }

  // Activity operations
  createActivity(activity: Activity): void {
    this.set(`activity:${activity.id}`, activity);
    this.addToIndex('activities', activity.id);
  }

  getRecentActivities(limit: number = 20): Activity[] {
    const activityIds = this.query('activities');
    const activities = activityIds
      .map(id => this.get(`activity:${id}`))
      .filter(Boolean)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return activities.slice(0, limit);
  }

  // Session operations
  createSession(session: Session): void {
    this.set(`session:${session.token}`, session);
  }

  getSession(token: string): Session | null {
    return this.get(`session:${token}`);
  }

  deleteSession(token: string): void {
    this.delete(`session:${token}`);
  }
}

export const documentStore = new DocumentStore();