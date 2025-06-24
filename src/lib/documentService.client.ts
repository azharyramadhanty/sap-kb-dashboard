import { apiClient } from './api';

export class DocumentService {
  async getDocuments(userId: string, userRole: string) {
    try {
      const response = await apiClient.getDocuments();
      return response.documents || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async getArchivedDocuments(userId: string, userRole: string) {
    try {
      const response = await apiClient.getArchivedDocuments();
      return response.documents || [];
    } catch (error) {
      console.error('Error fetching archived documents:', error);
      throw error;
    }
  }

  async uploadDocument(documentData: any, file: File, userId: string) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', documentData.category);
      formData.append('accessUsers', JSON.stringify(documentData.accessUsers));

      const response = await apiClient.uploadDocument(formData);
      return response.document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  }

  async archiveDocument(documentId: string, userId: string) {
    try {
      const response = await apiClient.archiveDocument(documentId);
      return response.document;
    } catch (error) {
      console.error('Error archiving document:', error);
      throw error;
    }
  }

  async restoreDocument(documentId: string, userId: string) {
    try {
      const response = await apiClient.restoreDocument(documentId);
      return response.document;
    } catch (error) {
      console.error('Error restoring document:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: string, userId: string) {
    try {
      const response = await apiClient.deleteDocument(documentId);
      return response;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async downloadDocument(documentId: string, userId: string) {
    try {
      const response = await apiClient.downloadDocument(documentId);
      return response.downloadUrl;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  async shareDocument(documentId: string, userIds: string[], userId: string) {
    try {
      const response = await apiClient.shareDocument(documentId, userIds);
      return response.document;
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService();