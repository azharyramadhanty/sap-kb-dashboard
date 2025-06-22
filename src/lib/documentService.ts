import { Document, Activity, User } from './database';
import { Document as DocumentType, Activity as ActivityType } from '../types';
import { cloudStorage } from './cloudStorage';
import { v4 as uuidv4 } from 'uuid';

class DocumentService {
  async uploadDocument(
    file: File, 
    category: string, 
    uploaderId: string, 
    uploaderName: string,
    accessUsers: string[] = []
  ): Promise<DocumentType> {
    try {
      // Generate unique filename
      const fileName = `${uuidv4()}-${file.name}`;
      
      // Upload to cloud storage
      const blobUrl = await cloudStorage.uploadFile(file, fileName);

      // Create document record
      const document = new Document({
        name: file.name,
        type: file.name.split('.').pop() || '',
        size: file.size,
        category,
        uploaderId,
        uploaderName,
        blobUrl,
        accessUsers: [uploaderId, ...accessUsers],
        tags: []
      });

      await document.save();

      // Log activity
      await this.logActivity('upload', document._id.toString(), document.name, uploaderId, uploaderName);

      return this.documentToType(document);
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async getDocuments(userId: string, userRole: string): Promise<DocumentType[]> {
    try {
      let query: any = { archivedAt: { $exists: false } };

      // Filter based on user permissions
      if (userRole !== 'admin') {
        query.$or = [
          { uploaderId: userId },
          { accessUsers: userId }
        ];
      }

      const documents = await Document.find(query)
        .sort({ createdAt: -1 })
        .populate('uploaderId', 'name')
        .populate('accessUsers', 'name email');

      return documents.map(doc => this.documentToType(doc));
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  async getArchivedDocuments(userId: string, userRole: string): Promise<DocumentType[]> {
    try {
      let query: any = { archivedAt: { $exists: true } };

      if (userRole !== 'admin') {
        query.$or = [
          { uploaderId: userId },
          { accessUsers: userId }
        ];
      }

      const documents = await Document.find(query)
        .sort({ archivedAt: -1 })
        .populate('uploaderId', 'name')
        .populate('accessUsers', 'name email');

      return documents.map(doc => this.documentToType(doc));
    } catch (error) {
      console.error('Error fetching archived documents:', error);
      return [];
    }
  }

  async archiveDocument(documentId: string, userId: string, userName: string): Promise<void> {
    try {
      const document = await Document.findByIdAndUpdate(
        documentId,
        { 
          archivedAt: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!document) {
        throw new Error('Document not found');
      }

      await this.logActivity('archive', documentId, document.name, userId, userName);
    } catch (error) {
      console.error('Error archiving document:', error);
      throw error;
    }
  }

  async restoreDocument(documentId: string, userId: string, userName: string): Promise<void> {
    try {
      const document = await Document.findByIdAndUpdate(
        documentId,
        { 
          $unset: { archivedAt: 1 },
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!document) {
        throw new Error('Document not found');
      }

      await this.logActivity('restore', documentId, document.name, userId, userName);
    } catch (error) {
      console.error('Error restoring document:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: string, userId: string, userName: string): Promise<void> {
    try {
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Delete from cloud storage
      if (document.blobUrl) {
        const fileName = document.blobUrl.split('/').pop();
        if (fileName) {
          await cloudStorage.deleteFile(fileName);
        }
      }

      // Delete document record
      await Document.findByIdAndDelete(documentId);

      await this.logActivity('delete', documentId, document.name, userId, userName);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async getRecentActivities(limit: number = 20): Promise<ActivityType[]> {
    try {
      const activities = await Activity.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('documentId', 'name')
        .populate('userId', 'name');

      return activities.map(activity => ({
        id: activity._id.toString(),
        type: activity.type,
        documentId: activity.documentId?.toString() || '',
        documentName: activity.documentName,
        userId: activity.userId?.toString() || '',
        userName: activity.userName,
        timestamp: activity.timestamp.toISOString()
      }));
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  private async logActivity(
    type: ActivityType['type'],
    documentId: string,
    documentName: string,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const activity = new Activity({
        type,
        documentId,
        documentName,
        userId,
        userName,
        timestamp: new Date()
      });

      await activity.save();
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  private documentToType(doc: any): DocumentType {
    return {
      id: doc._id.toString(),
      name: doc.name,
      type: doc.type,
      size: doc.size,
      category: doc.category,
      uploaderId: doc.uploaderId.toString(),
      uploaderName: doc.uploaderName,
      blobUrl: doc.blobUrl,
      accessUsers: doc.accessUsers.map((user: any) => user._id?.toString() || user.toString()),
      tags: doc.tags,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      archivedAt: doc.archivedAt?.toISOString()
    };
  }
}

export const documentService = new DocumentService();