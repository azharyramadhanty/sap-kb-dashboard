import { Document, Activity } from '../types';
import { documentStore } from './storage';
import { authService } from './auth';
import { v4 as uuidv4 } from 'uuid';

class DocumentService {
  // Simulated blob storage URLs
  private generateBlobUrl(fileName: string): string {
    return `https://plnstorage.blob.core.windows.net/documents/${uuidv4()}-${fileName}`;
  }

  async uploadDocument(file: File, category: string, accessUsers: string[] = []): Promise<Document> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    // Simulate file upload to blob storage
    const blobUrl = this.generateBlobUrl(file.name);

    const document: Document = {
      id: uuidv4(),
      name: file.name,
      type: file.name.split('.').pop() || '',
      size: file.size,
      category: category as any,
      uploaderId: currentUser.id,
      uploaderName: currentUser.name,
      blobUrl,
      accessUsers: [currentUser.id, ...accessUsers],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    documentStore.createDocument(document);

    // Log activity
    this.logActivity('upload', document.id, document.name);

    return document;
  }

  getDocuments(): Document[] {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return [];

    const allDocuments = documentStore.getAllDocuments();
    
    // Filter documents based on access
    return allDocuments.filter(doc => 
      !doc.archivedAt && (
        doc.uploaderId === currentUser.id ||
        doc.accessUsers.includes(currentUser.id) ||
        authService.hasRole('admin')
      )
    );
  }

  getArchivedDocuments(): Document[] {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return [];

    const allDocuments = documentStore.getAllDocuments();
    
    return allDocuments.filter(doc => 
      doc.archivedAt && (
        doc.uploaderId === currentUser.id ||
        doc.accessUsers.includes(currentUser.id) ||
        authService.hasRole('admin')
      )
    );
  }

  async archiveDocument(documentId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    const document = documentStore.get(`document:${documentId}`);
    if (!document) {
      throw new Error('Document not found');
    }

    if (document.uploaderId !== currentUser.id && !authService.hasRole('admin')) {
      throw new Error('Insufficient permissions');
    }

    document.archivedAt = new Date().toISOString();
    document.updatedAt = new Date().toISOString();
    
    documentStore.updateDocument(document);
    this.logActivity('archive', documentId, document.name);
  }

  async restoreDocument(documentId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    const document = documentStore.get(`document:${documentId}`);
    if (!document) {
      throw new Error('Document not found');
    }

    if (document.uploaderId !== currentUser.id && !authService.hasRole('admin')) {
      throw new Error('Insufficient permissions');
    }

    delete document.archivedAt;
    document.updatedAt = new Date().toISOString();
    
    documentStore.updateDocument(document);
    this.logActivity('restore', documentId, document.name);
  }

  async deleteDocument(documentId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    const document = documentStore.get(`document:${documentId}`);
    if (!document) {
      throw new Error('Document not found');
    }

    if (document.uploaderId !== currentUser.id && !authService.hasRole('admin')) {
      throw new Error('Insufficient permissions');
    }

    documentStore.deleteDocument(documentId);
    this.logActivity('delete', documentId, document.name);
  }

  async shareDocument(documentId: string, userIds: string[]): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    const document = documentStore.get(`document:${documentId}`);
    if (!document) {
      throw new Error('Document not found');
    }

    if (document.uploaderId !== currentUser.id && !authService.hasRole('admin')) {
      throw new Error('Insufficient permissions');
    }

    // Add new users to access list
    const newAccessUsers = [...new Set([...document.accessUsers, ...userIds])];
    document.accessUsers = newAccessUsers;
    document.updatedAt = new Date().toISOString();
    
    documentStore.updateDocument(document);
    this.logActivity('share', documentId, document.name);
  }

  async downloadDocument(documentId: string): Promise<string> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    const document = documentStore.get(`document:${documentId}`);
    if (!document) {
      throw new Error('Document not found');
    }

    if (!document.accessUsers.includes(currentUser.id) && !authService.hasRole('admin')) {
      throw new Error('Insufficient permissions');
    }

    this.logActivity('download', documentId, document.name);
    
    // Return blob URL for download
    return document.blobUrl || '#';
  }

  async viewDocument(documentId: string): Promise<string> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    const document = documentStore.get(`document:${documentId}`);
    if (!document) {
      throw new Error('Document not found');
    }

    if (!document.accessUsers.includes(currentUser.id) && !authService.hasRole('admin')) {
      throw new Error('Insufficient permissions');
    }

    this.logActivity('view', documentId, document.name);
    
    // Return blob URL for viewing
    return document.blobUrl || '#';
  }

  getRecentActivities(): Activity[] {
    return documentStore.getRecentActivities();
  }

  private logActivity(type: Activity['type'], documentId: string, documentName: string): void {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    const activity: Activity = {
      id: uuidv4(),
      type,
      documentId,
      documentName,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
    };

    documentStore.createActivity(activity);
  }
}

export const documentService = new DocumentService();