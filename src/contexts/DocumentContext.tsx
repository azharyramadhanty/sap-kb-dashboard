import React, { createContext, useState, useContext, useEffect } from 'react';
import { Document, User, Activity } from '@prisma/client';
import { DocumentWithRelations, ActivityWithRelations, DocumentCategory } from '../types/database';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

type DocumentContextType = {
  documents: DocumentWithRelations[];
  archivedDocuments: DocumentWithRelations[];
  recentActivities: ActivityWithRelations[];
  categories: DocumentCategory[];
  loading: boolean;
  uploadDocument: (document: any, file: File) => Promise<void>;
  moveToArchive: (documentId: string) => Promise<void>;
  restoreDocument: (documentId: string) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  viewDocument: (documentId: string) => Promise<string>;
  downloadDocument: (documentId: string) => Promise<void>;
  shareDocument: (documentId: string, userIds: string[]) => Promise<void>;
  refreshDocuments: () => Promise<void>;
};

const DocumentContext = createContext<DocumentContextType>({} as DocumentContextType);

export const useDocument = () => useContext(DocumentContext);

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = 'https://nonprodchangecopilot.indonesiacentral.cloudapp.azure.com/cms-be';

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userRole } = useAuth();
  const [documents, setDocuments] = useState<DocumentWithRelations[]>([]);
  const [archivedDocuments, setArchivedDocuments] = useState<DocumentWithRelations[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityWithRelations[]>([]);
  const [loading, setLoading] = useState(false);

  const categories: DocumentCategory[] = ['SAP_CMCT', 'SAP_FI', 'SAP_QM'];

  useEffect(() => {
    if (currentUser) {
      refreshDocuments();
      loadActivities();
    }
  }, [currentUser, userRole]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
    };
  };

  const refreshDocuments = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/documents`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const docs = await response.json();
        // Separate archived and active documents
        const activeDocuments = docs.filter((doc: any) => !doc.archivedAt);
        const archived = docs.filter((doc: any) => doc.archivedAt);
        
        setDocuments(activeDocuments);
        setArchivedDocuments(archived);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to load documents');
      }
    } catch (error: any) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`${API_BASE_URL}/activities`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const activities = await response.json();
        setRecentActivities(activities);
      }
    } catch (error: any) {
      console.error('Error loading activities:', error);
    }
  };

  const uploadDocument = async (documentData: any, file: File): Promise<void> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', documentData.category || 'SAP_CMCT');
      
      if (documentData.access && documentData.access.length > 0) {
        formData.append('access', JSON.stringify(documentData.access.map((user: User) => user.id)));
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload document');
      }

      await refreshDocuments();
      await loadActivities();

      toast.success(`Document "${file.name}" uploaded successfully`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const moveToArchive = async (documentId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/archive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to archive document');
      }

      await refreshDocuments();
      await loadActivities();
      toast.success('Document moved to archive');
    } catch (error: any) {
      console.error('Error archiving document:', error);
      toast.error(error.message || 'Failed to archive document');
    }
  };

  const restoreDocument = async (documentId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/restore`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to restore document');
      }

      await refreshDocuments();
      await loadActivities();
      toast.success('Document restored from archive');
    } catch (error: any) {
      console.error('Error restoring document:', error);
      toast.error(error.message || 'Failed to restore document');
    }
  };

  const deleteDocument = async (documentId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete document');
      }

      await refreshDocuments();
      await loadActivities();
      toast.success('Document permanently deleted');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const viewDocument = async (documentId: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/view`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get document URL');
      }

      const { url } = await response.json();
      await loadActivities();
      return url;
    } catch (error: any) {
      console.error('Error viewing document:', error);
      toast.error(error.message || 'Failed to view document');
      throw error;
    }
  };

  const downloadDocument = async (documentId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 'document';
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      await loadActivities();
      toast.success('Document downloaded');
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error(error.message || 'Failed to download document');
    }
  };

  const shareDocument = async (documentId: string, userIds: string[]): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to share document');
      }

      await refreshDocuments();
      toast.success('Document shared successfully');
    } catch (error: any) {
      console.error('Error sharing document:', error);
      toast.error(error.message || 'Failed to share document');
    }
  };

  const value = {
    documents,
    archivedDocuments,
    recentActivities,
    categories,
    loading,
    uploadDocument,
    moveToArchive,
    restoreDocument,
    deleteDocument,
    viewDocument,
    downloadDocument,
    shareDocument,
    refreshDocuments,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};