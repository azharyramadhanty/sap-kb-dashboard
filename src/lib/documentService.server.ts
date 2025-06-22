import mongoose from 'mongoose';
import { CloudStorageService } from './cloudStorage';
import { Document, DocumentCategory } from './database';

export class DocumentService {
  private cloudStorage: CloudStorageService;

  constructor() {
    this.cloudStorage = new CloudStorageService();
  }

  async getDocuments(userId: string, userRole: string) {
    try {
      let query = {};
      
      if (userRole !== 'admin') {
        query = {
          $or: [
            { uploaderId: userId },
            { 'access.userId': userId }
          ]
        };
      }

      const documents = await Document.find({
        ...query,
        archivedAt: null
      })
      .populate('uploaderId', 'name email')
      .populate('access.userId', 'name email role')
      .sort({ createdAt: -1 });

      return documents;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async getArchivedDocuments(userId: string, userRole: string) {
    try {
      let query = {};
      
      if (userRole !== 'admin') {
        query = {
          $or: [
            { uploaderId: userId },
            { 'access.userId': userId }
          ]
        };
      }

      const documents = await Document.find({
        ...query,
        archivedAt: { $ne: null }
      })
      .populate('uploaderId', 'name email')
      .populate('access.userId', 'name email role')
      .sort({ archivedAt: -1 });

      return documents;
    } catch (error) {
      console.error('Error fetching archived documents:', error);
      throw error;
    }
  }

  async uploadDocument(documentData: any, file: File, userId: string) {
    try {
      // Upload file to cloud storage
      const fileUrl = await this.cloudStorage.uploadFile(file, userId);

      // Create document record
      const document = new Document({
        name: file.name,
        type: file.name.split('.').pop() || '',
        size: file.size,
        fileUrl,
        uploaderId: userId,
        category: documentData.category || 'SAP CMCT',
        access: documentData.access || [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await document.save();
      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async archiveDocument(documentId: string, userId: string) {
    try {
      const document = await Document.findOneAndUpdate(
        { _id: documentId, uploaderId: userId },
        { 
          archivedAt: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!document) {
        throw new Error('Document not found or access denied');
      }

      return document;
    } catch (error) {
      console.error('Error archiving document:', error);
      throw error;
    }
  }

  async restoreDocument(documentId: string, userId: string) {
    try {
      const document = await Document.findOneAndUpdate(
        { _id: documentId, uploaderId: userId },
        { 
          archivedAt: null,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!document) {
        throw new Error('Document not found or access denied');
      }

      return document;
    } catch (error) {
      console.error('Error restoring document:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: string, userId: string) {
    try {
      const document = await Document.findOne({ _id: documentId, uploaderId: userId });
      
      if (!document) {
        throw new Error('Document not found or access denied');
      }

      // Delete file from cloud storage
      if (document.fileUrl) {
        await this.cloudStorage.deleteFile(document.fileUrl);
      }

      // Delete document record
      await Document.findByIdAndDelete(documentId);

      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async downloadDocument(documentId: string, userId: string) {
    try {
      const document = await Document.findOne({
        _id: documentId,
        $or: [
          { uploaderId: userId },
          { 'access.userId': userId }
        ]
      });

      if (!document) {
        throw new Error('Document not found or access denied');
      }

      // Get download URL from cloud storage
      const downloadUrl = await this.cloudStorage.getDownloadUrl(document.fileUrl);
      return downloadUrl;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  async shareDocument(documentId: string, userIds: string[], userId: string) {
    try {
      const document = await Document.findOneAndUpdate(
        { _id: documentId, uploaderId: userId },
        { 
          $addToSet: { 
            access: { 
              $each: userIds.map(id => ({ userId: id }))
            }
          },
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!document) {
        throw new Error('Document not found or access denied');
      }

      return document;
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService();