import { BlobServiceClient } from '@azure/storage-blob';

// Mock document data for demo purposes
const mockDocuments = [
  {
    id: '1',
    name: 'SAP_CMCT_Manual.pdf',
    type: 'pdf',
    size: 2048576,
    category: 'SAP CMCT',
    uploaderId: '1',
    uploaderName: 'Admin User',
    blobUrl: 'https://example.com/documents/SAP_CMCT_Manual.pdf',
    accessUsers: ['2', '3'],
    tags: ['manual', 'sap'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    archivedAt: null
  },
  {
    id: '2',
    name: 'Financial_Report_Q1.xlsx',
    type: 'xlsx',
    size: 1024000,
    category: 'SAP FI',
    uploaderId: '2',
    uploaderName: 'Editor User',
    blobUrl: 'https://example.com/documents/Financial_Report_Q1.xlsx',
    accessUsers: ['1'],
    tags: ['finance', 'report'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    archivedAt: null
  }
];

const mockArchivedDocuments = [
  {
    id: '3',
    name: 'Old_Quality_Manual.pdf',
    type: 'pdf',
    size: 3072000,
    category: 'SAP QM',
    uploaderId: '1',
    uploaderName: 'Admin User',
    blobUrl: 'https://example.com/documents/Old_Quality_Manual.pdf',
    accessUsers: [],
    tags: ['quality', 'manual', 'archived'],
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
    updatedAt: new Date(Date.now() - 2592000000).toISOString(),
    archivedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Azure Storage configuration
const getAzureStorageClient = () => {
  const connectionString = import.meta.env.VITE_AZURE_STORAGE_CONNECTION_STRING;
  const containerName = import.meta.env.VITE_AZURE_STORAGE_CONTAINER || 'documents';
  
  if (!connectionString) {
    console.warn('Azure Storage connection string not configured, using mock data');
    return null;
  }

  return {
    client: BlobServiceClient.fromConnectionString(connectionString),
    containerName
  };
};

export class DocumentService {
  async getDocuments(userId: string, userRole: string) {
    try {
      // Filter documents based on user role and access
      let filteredDocuments = mockDocuments;
      
      if (userRole !== 'admin') {
        filteredDocuments = mockDocuments.filter(doc => 
          doc.uploaderId === userId || doc.accessUsers.includes(userId)
        );
      }

      return filteredDocuments.filter(doc => !doc.archivedAt);
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async getArchivedDocuments(userId: string, userRole: string) {
    try {
      // Filter archived documents based on user role and access
      let filteredDocuments = mockArchivedDocuments;
      
      if (userRole !== 'admin') {
        filteredDocuments = mockArchivedDocuments.filter(doc => 
          doc.uploaderId === userId || doc.accessUsers.includes(userId)
        );
      }

      return filteredDocuments;
    } catch (error) {
      console.error('Error fetching archived documents:', error);
      throw error;
    }
  }

  async uploadDocument(documentData: any, file: File, userId: string) {
    try {
      const azureClient = getAzureStorageClient();
      let blobUrl = `https://example.com/documents/${file.name}`;

      if (azureClient) {
        // Upload file to Azure Storage
        const { client, containerName } = azureClient;
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
        blobUrl = blockBlobClient.url;
      }

      // Create new document object
      const newDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: file.name.split('.').pop() || '',
        size: file.size,
        blobUrl,
        uploaderId: userId,
        uploaderName: 'Current User', // In real app, get from user context
        category: documentData.category || 'SAP CMCT',
        accessUsers: documentData.accessUsers || [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archivedAt: null
      };

      // Add to mock data (in real app, this would be saved to database)
      mockDocuments.push(newDocument);

      return newDocument;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  }

  async archiveDocument(documentId: string, userId: string) {
    try {
      const docIndex = mockDocuments.findIndex(doc => doc.id === documentId && doc.uploaderId === userId);
      
      if (docIndex === -1) {
        throw new Error('Document not found or access denied');
      }

      const document = mockDocuments[docIndex];
      document.archivedAt = new Date().toISOString();
      document.updatedAt = new Date().toISOString();

      // Move to archived documents
      mockArchivedDocuments.push(document);
      mockDocuments.splice(docIndex, 1);

      return document;
    } catch (error) {
      console.error('Error archiving document:', error);
      throw error;
    }
  }

  async restoreDocument(documentId: string, userId: string) {
    try {
      const docIndex = mockArchivedDocuments.findIndex(doc => doc.id === documentId && doc.uploaderId === userId);
      
      if (docIndex === -1) {
        throw new Error('Document not found or access denied');
      }

      const document = mockArchivedDocuments[docIndex];
      document.archivedAt = null;
      document.updatedAt = new Date().toISOString();

      // Move back to active documents
      mockDocuments.push(document);
      mockArchivedDocuments.splice(docIndex, 1);

      return document;
    } catch (error) {
      console.error('Error restoring document:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: string, userId: string) {
    try {
      const docIndex = mockArchivedDocuments.findIndex(doc => doc.id === documentId && doc.uploaderId === userId);
      
      if (docIndex === -1) {
        throw new Error('Document not found or access denied');
      }

      const document = mockArchivedDocuments[docIndex];

      // Delete file from Azure Storage if configured
      const azureClient = getAzureStorageClient();
      if (azureClient && document.blobUrl && document.blobUrl.includes('blob.core.windows.net')) {
        try {
          const { client, containerName } = azureClient;
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

      // Remove from mock data
      mockArchivedDocuments.splice(docIndex, 1);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async downloadDocument(documentId: string, userId: string) {
    try {
      const document = [...mockDocuments, ...mockArchivedDocuments].find(doc => 
        doc.id === documentId && 
        (doc.uploaderId === userId || doc.accessUsers.includes(userId))
      );

      if (!document) {
        throw new Error('Document not found or access denied');
      }

      // Return the blob URL for download
      return document.blobUrl;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  async shareDocument(documentId: string, userIds: string[], userId: string) {
    try {
      const document = mockDocuments.find(doc => doc.id === documentId && doc.uploaderId === userId);

      if (!document) {
        throw new Error('Document not found or access denied');
      }

      // Add new users to access list (avoid duplicates)
      userIds.forEach(uid => {
        if (!document.accessUsers.includes(uid)) {
          document.accessUsers.push(uid);
        }
      });

      document.updatedAt = new Date().toISOString();

      return document;
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService();