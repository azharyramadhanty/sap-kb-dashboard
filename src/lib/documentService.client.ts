import { connectDatabase, User, Document, Activity } from './database';
import { authService } from './auth';
import { BlobServiceClient } from '@azure/storage-blob';

// Azure Storage configuration
const getAzureStorageClient = () => {
  const connectionString = import.meta.env.VITE_AZURE_STORAGE_CONNECTION_STRING;
  const containerName = import.meta.env.VITE_AZURE_STORAGE_CONTAINER || 'documents';
  
  if (!connectionString) {
    throw new Error('Azure Storage connection string not configured');
  }

  return {
    client: BlobServiceClient.fromConnectionString(connectionString),
    containerName
  };
};

export class DocumentService {
  async getDocuments(userId: string, userRole: string) {
    try {
      await connectDatabase();
      
      let query = {};
      
      if (userRole !== 'admin') {
        query = {
          $or: [
            { uploaderId: userId },
            { accessUsers: { $in: [userId] } }
          ]
        };
      }

      const documents = await Document.find({
        ...query,
        archivedAt: null
      }).sort({ createdAt: -1 });

      return documents.map(doc => ({
        id: doc._id.toString(),
        name: doc.name,
        type: doc.type,
        size: doc.size,
        category: doc.category,
        uploaderId: doc.uploaderId,
        uploaderName: doc.uploaderName,
        blobUrl: doc.blobUrl,
        accessUsers: doc.accessUsers || [],
        tags: doc.tags || [],
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        archivedAt: doc.archivedAt ? doc.archivedAt.toISOString() : null
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async getArchivedDocuments(userId: string, userRole: string) {
    try {
      await connectDatabase();
      
      let query = {};
      
      if (userRole !== 'admin') {
        query = {
          $or: [
            { uploaderId: userId },
            { accessUsers: { $in: [userId] } }
          ]
        };
      }

      const documents = await Document.find({
        ...query,
        archivedAt: { $ne: null }
      }).sort({ archivedAt: -1 });

      return documents.map(doc => ({
        id: doc._id.toString(),
        name: doc.name,
        type: doc.type,
        size: doc.size,
        category: doc.category,
        uploaderId: doc.uploaderId,
        uploaderName: doc.uploaderName,
        blobUrl: doc.blobUrl,
        accessUsers: doc.accessUsers || [],
        tags: doc.tags || [],
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        archivedAt: doc.archivedAt ? doc.archivedAt.toISOString() : null
      }));
    } catch (error) {
      console.error('Error fetching archived documents:', error);
      throw error;
    }
  }

  async uploadDocument(documentData: any, file: File, userId: string) {
    try {
      await connectDatabase();
      
      // Get user info
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Upload file to Azure Storage
      const { client, containerName } = getAzureStorageClient();
      const containerClient = client.getContainerClient(containerName);
      
      // Ensure container exists
      await containerClient.createIfNotExists({
        access: 'blob'
      });

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${userId}/${timestamp}_${sanitizedFileName}`;
      
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      
      // Convert File to ArrayBuffer for upload
      const arrayBuffer = await file.arrayBuffer();
      await blockBlobClient.uploadData(arrayBuffer, {
        blobHTTPHeaders: {
          blobContentType: file.type
        }
      });

      // Get the blob URL
      const blobUrl = blockBlobClient.url;

      // Create document in MongoDB
      const document = new Document({
        name: file.name,
        type: file.name.split('.').pop() || '',
        size: file.size,
        blobUrl,
        uploaderId: userId,
        uploaderName: user.name,
        category: documentData.category || 'SAP CMCT',
        accessUsers: documentData.accessUsers || [],
        tags: []
      });

      await document.save();

      return {
        id: document._id.toString(),
        name: document.name,
        type: document.type,
        size: document.size,
        category: document.category,
        uploaderId: document.uploaderId,
        uploaderName: document.uploaderName,
        blobUrl: document.blobUrl,
        accessUsers: document.accessUsers || [],
        tags: document.tags || [],
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
        archivedAt: null
      };
    } catch (error) {
      console.error('Error uploading document to Azure Storage:', error);
      throw new Error('Failed to upload document to cloud storage');
    }
  }

  async archiveDocument(documentId: string, userId: string) {
    try {
      await connectDatabase();
      
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

      return {
        id: document._id.toString(),
        name: document.name,
        type: document.type,
        size: document.size,
        category: document.category,
        uploaderId: document.uploaderId,
        uploaderName: document.uploaderName,
        blobUrl: document.blobUrl,
        accessUsers: document.accessUsers || [],
        tags: document.tags || [],
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
        archivedAt: document.archivedAt ? document.archivedAt.toISOString() : null
      };
    } catch (error) {
      console.error('Error archiving document:', error);
      throw error;
    }
  }

  async restoreDocument(documentId: string, userId: string) {
    try {
      await connectDatabase();
      
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

      return {
        id: document._id.toString(),
        name: document.name,
        type: document.type,
        size: document.size,
        category: document.category,
        uploaderId: document.uploaderId,
        uploaderName: document.uploaderName,
        blobUrl: document.blobUrl,
        accessUsers: document.accessUsers || [],
        tags: document.tags || [],
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
        archivedAt: null
      };
    } catch (error) {
      console.error('Error restoring document:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: string, userId: string) {
    try {
      await connectDatabase();
      
      const document = await Document.findOne({ _id: documentId, uploaderId: userId });
      
      if (!document) {
        throw new Error('Document not found or access denied');
      }

      // Delete file from Azure Storage
      if (document.blobUrl) {
        try {
          const { client, containerName } = getAzureStorageClient();
          const containerClient = client.getContainerClient(containerName);
          
          // Extract blob name from URL
          const url = new URL(document.blobUrl);
          const blobName = url.pathname.split('/').slice(2).join('/'); // Remove container name from path
          
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
          await blockBlobClient.deleteIfExists();
        } catch (storageError) {
          console.warn('Failed to delete file from Azure Storage:', storageError);
          // Continue with document deletion even if storage deletion fails
        }
      }

      await Document.findByIdAndDelete(documentId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async downloadDocument(documentId: string, userId: string) {
    try {
      await connectDatabase();
      
      const document = await Document.findOne({
        _id: documentId,
        $or: [
          { uploaderId: userId },
          { accessUsers: { $in: [userId] } }
        ]
      });

      if (!document) {
        throw new Error('Document not found or access denied');
      }

      // For Azure Storage, we can return the blob URL directly
      // In production, you might want to generate a SAS token for temporary access
      return document.blobUrl;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  async shareDocument(documentId: string, userIds: string[], userId: string) {
    try {
      await connectDatabase();
      
      const document = await Document.findOneAndUpdate(
        { _id: documentId, uploaderId: userId },
        { 
          $addToSet: { accessUsers: { $each: userIds } },
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!document) {
        throw new Error('Document not found or access denied');
      }

      return {
        id: document._id.toString(),
        name: document.name,
        type: document.type,
        size: document.size,
        category: document.category,
        uploaderId: document.uploaderId,
        uploaderName: document.uploaderName,
        blobUrl: document.blobUrl,
        accessUsers: document.accessUsers || [],
        tags: document.tags || [],
        createdAt: document.createdAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
        archivedAt: document.archivedAt ? document.archivedAt.toISOString() : null
      };
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService();