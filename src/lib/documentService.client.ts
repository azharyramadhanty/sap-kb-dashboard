import { documentStore } from './storage';
import { authService } from './auth';

export class DocumentService {
  async getDocuments(userId: string, userRole: string) {
    try {
      const allDocuments = documentStore.getDocuments();
      
      // Filter documents based on user role and access
      const filteredDocuments = allDocuments.filter(doc => {
        if (userRole === 'admin') return !doc.archivedAt;
        return (!doc.archivedAt && (
          doc.uploaderId === userId || 
          doc.access.some(access => access.userId === userId)
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
          doc.access.some(access => access.userId === userId)
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
      // Simulate file upload by creating a blob URL
      const fileUrl = URL.createObjectURL(file);

      const document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.name.split('.').pop() || '',
        size: file.size,
        fileUrl,
        uploaderId: userId,
        category: documentData.category || 'SAP CMCT',
        access: documentData.access || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archivedAt: null
      };

      documentStore.addDocument(document);
      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
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

      // Revoke blob URL to free memory
      if (document.fileUrl && document.fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(document.fileUrl);
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
        document.access.some(access => access.userId === userId);

      if (!hasAccess) {
        throw new Error('Access denied');
      }

      return document.fileUrl;
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

      const newAccess = userIds.map(id => ({ userId: id }));
      const updatedDocument = {
        ...document,
        access: [...document.access, ...newAccess],
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