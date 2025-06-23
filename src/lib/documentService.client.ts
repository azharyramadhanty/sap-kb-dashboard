import { documentStore } from './storage';
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
      const allDocuments = documentStore.getDocuments();
      
      // Filter documents based on user role and access
      const filteredDocuments = allDocuments.filter(doc => {
        if (userRole === 'admin') return !doc.archivedAt;
        return (!doc.archivedAt && (
          doc.uploaderId === userId || 
          doc.accessUsers.some(accessUserId => accessUserId === userId)
        ));
      });

      return filteredDocuments;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async getArchivedDocuments(userId: string, userRole: string) {
    try {
      const allDocuments = documentStore.getDocuments();
      
      // Filter archived documents based on user role and access
      const filteredDocuments = allDocuments.filter(doc => {
        if (userRole === 'admin') return !!doc.archivedAt;
        return (!!doc.archivedAt && (
          doc.uploaderId === userId || 
          doc.accessUsers.some(accessUserId => accessUserId === userId)
        ));
      });

      return filteredDocuments;
    } catch (error) {
      console.error('Error fetching archived documents:', error);
      throw error;
    }
  }

  async uploadDocument(documentData: any, file: File, userId: string) {
    try {
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

      const document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.name.split('.').pop() || '',
        size: file.size,
        blobUrl,
        uploaderId: userId,
        category: documentData.category || 'SAP CMCT',
        accessUsers: documentData.accessUsers || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archivedAt: null
      };

      documentStore.addDocument(document);
      return document;
    } catch (error) {
      console.error('Error uploading document to Azure Storage:', error);
      throw new Error('Failed to upload document to cloud storage');
    }
  }

  async archiveDocument(documentId: string, userId: string) {
    try {
      const document = documentStore.getDocument(documentId);
      
      if (!document || document.uploaderId !== userId) {
        throw new Error('Document not found or access denied');
      }

      const updatedDocument = {
        ...document,
        archivedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      documentStore.updateDocument(documentId, updatedDocument);
      return updatedDocument;
    } catch (error) {
      console.error('Error archiving document:', error);
      throw error;
    }
  }

  async restoreDocument(documentId: string, userId: string) {
    try {
      const document = documentStore.getDocument(documentId);
      
      if (!document || document.uploaderId !== userId) {
        throw new Error('Document not found or access denied');
      }

      const updatedDocument = {
        ...document,
        archivedAt: null,
        updatedAt: new Date().toISOString()
      };

      documentStore.updateDocument(documentId, updatedDocument);
      return updatedDocument;
    } catch (error) {
      console.error('Error restoring document:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: string, userId: string) {
    try {
      const document = documentStore.getDocument(documentId);
      
      if (!document || document.uploaderId !== userId) {
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

      documentStore.deleteDocument(documentId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async downloadDocument(documentId: string, userId: string) {
    try {
      const document = documentStore.getDocument(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }

      const hasAccess = document.uploaderId === userId || 
        document.accessUsers.some(accessUserId => accessUserId === userId);

      if (!hasAccess) {
        throw new Error('Access denied');
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
      const document = documentStore.getDocument(documentId);
      
      if (!document || document.uploaderId !== userId) {
        throw new Error('Document not found or access denied');
      }

      const updatedDocument = {
        ...document,
        accessUsers: [...document.accessUsers, ...userIds],
        updatedAt: new Date().toISOString()
      };

      documentStore.updateDocument(documentId, updatedDocument);
      return updatedDocument;
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService();