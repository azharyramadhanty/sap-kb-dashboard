import React, { createContext, useState, useContext, useEffect } from 'react';
import { documentService } from '../lib/documentService.client';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

type DocumentCategory = 'SAP CMCT' | 'SAP FI' | 'SAP QM';

type Document = {
  id: string;
  name: string;
  type: string;
  size: number;
  blobUrl: string;
  uploaderId: string;
  uploaderName: string;
  category: DocumentCategory;
  accessUsers: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  uploader?: {
    id: string;
    name: string;
    email: string;
  };
  access?: Array<{
    userId: string;
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
};

type ActivityType = {
  id: string;
  type: 'upload' | 'view' | 'download' | 'archive' | 'restore' | 'delete';
  documentId: string;
  documentName: string;
  userId: string;
  userName: string;
  timestamp: string;
  document?: {
    id: string;
    name: string;
  };
  user?: {
    name: string;
  };
};

type DocumentContextType = {
  documents: Document[];
  archivedDocuments: Document[];
  recentActivities: ActivityType[];
  categories: DocumentCategory[];
  loading: boolean;
  uploadDocument: (file: File, category: DocumentCategory, accessUsers: string[]) => Promise<void>;
  archiveDocument: (documentId: string) => Promise<void>;
  restoreDocument: (documentId: string) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  viewDocument: (documentId: string) => Promise<string>;
  downloadDocument: (documentId: string) => Promise<void>;
  shareDocument: (documentId: string, userIds: string[]) => Promise<void>;
  refreshDocuments: () => Promise<void>;
};

const DocumentContext = createContext<DocumentContextType>({} as DocumentContextType);

export const useDocument = () => useContext(DocumentContext);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, allUsers } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [archivedDocuments, setArchivedDocuments] = useState<Document[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(false);

  const categories: DocumentCategory[] = ['SAP CMCT', 'SAP FI', 'SAP QM'];

  useEffect(() => {
    if (currentUser) {
      refreshDocuments();
      loadActivities();
    }
  }, [currentUser]);

  const enrichDocumentWithUserData = (doc: any): Document => {
    const uploader = allUsers.find(user => user.id === doc.uploaderId);
    const enrichedAccess = (doc.accessUsers || []).map((userId: string) => {
      const user = allUsers.find(u => u.id === userId);
      return {
        userId: userId,
        id: userId,
        name: user?.name || 'Unknown',
        email: user?.email || '',
        role: user?.role || 'viewer'
      };
    });

    return {
      ...doc,
      uploader: uploader ? {
        id: uploader.id,
        name: uploader.name,
        email: uploader.email
      } : { id: '', name: 'Unknown', email: '' },
      access: enrichedAccess
    };
  };

  const refreshDocuments = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const [docsResult, archivedResult] = await Promise.all([
        documentService.getDocuments(currentUser.id, currentUser.role),
        documentService.getArchivedDocuments(currentUser.id, currentUser.role)
      ]);

      setDocuments(docsResult.map(enrichDocumentWithUserData));
      setArchivedDocuments(archivedResult.map(enrichDocumentWithUserData));
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
      const response = await apiClient.getActivities();
      const activities = response.activities || [];
      
      // Enrich activities with document and user data
      const enrichedActivities = activities.map((activity: any) => {
        const document = [...documents, ...archivedDocuments].find(doc => doc.id === activity.documentId);
        const user = allUsers.find(u => u.id === activity.userId);
        
        return {
          ...activity,
          document: document ? {
            id: document.id,
            name: document.name
          } : { id: activity.documentId, name: activity.documentName },
          user: user ? {
            name: user.name
          } : { name: activity.userName }
        };
      });

      setRecentActivities(enrichedActivities.slice(0, 20));
    } catch (error: any) {
      console.error('Error loading activities:', error);
    }
  };

  const addActivity = async (type: string, documentId: string, documentName: string) => {
    if (!currentUser) return;

    try {
      const activityData = {
        type,
        documentId,
        documentName,
        userId: currentUser.id,
        userName: currentUser.name,
      };

      await apiClient.createActivity(activityData);
      await loadActivities(); // Refresh activities
    } catch (error: any) {
      console.error('Error adding activity:', error);
    }
  };

  const uploadDocument = async (file: File, category: DocumentCategory, accessUsers: string[]): Promise<void> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);

      const documentData = {
        category,
        accessUsers
      };

      const newDocument = await documentService.uploadDocument(documentData, file, currentUser.id);
      await addActivity('upload', newDocument.id, newDocument.name);
      await refreshDocuments();

      toast.success(`Document "${file.name}" uploaded successfully`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const archiveDocument = async (documentId: string): Promise<void> => {
    try {
      const doc = documents.find(d => d.id === documentId);
      await documentService.archiveDocument(documentId, currentUser?.id || '');
      await addActivity('archive', documentId, doc?.name || 'Unknown');
      await refreshDocuments();

      toast.success('Document moved to archive');
    } catch (error: any) {
      console.error('Error archiving document:', error);
      toast.error('Failed to archive document');
    }
  };

  const restoreDocument = async (documentId: string): Promise<void> => {
    try {
      const doc = archivedDocuments.find(d => d.id === documentId);
      await documentService.restoreDocument(documentId, currentUser?.id || '');
      await addActivity('restore', documentId, doc?.name || 'Unknown');
      await refreshDocuments();

      toast.success('Document restored from archive');
    } catch (error: any) {
      console.error('Error restoring document:', error);
      toast.error('Failed to restore document');
    }
  };

  const deleteDocument = async (documentId: string): Promise<void> => {
    try {
      const doc = archivedDocuments.find(d => d.id === documentId);
      await documentService.deleteDocument(documentId, currentUser?.id || '');
      await addActivity('delete', documentId, doc?.name || 'Unknown');
      await refreshDocuments();

      toast.success('Document permanently deleted');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const viewDocument = async (documentId: string): Promise<string> => {
    try {
      const url = await documentService.downloadDocument(documentId, currentUser?.id || '');
      const doc = [...documents, ...archivedDocuments].find(d => d.id === documentId);
      await addActivity('view', documentId, doc?.name || 'Unknown');
      return url;
    } catch (error: any) {
      console.error('Error viewing document:', error);
      toast.error('Failed to view document');
      throw error;
    }
  };

  const downloadDocument = async (documentId: string): Promise<void> => {
    try {
      const url = await documentService.downloadDocument(documentId, currentUser?.id || '');
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = url;
      const doc = documents.find(d => d.id === documentId) || archivedDocuments.find(d => d.id === documentId);
      link.download = doc?.name || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await addActivity('download', documentId, doc?.name || 'Unknown');
      toast.success('Document downloaded');
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const shareDocument = async (documentId: string, userIds: string[]): Promise<void> => {
    try {
      await documentService.shareDocument(documentId, userIds, currentUser?.id || '');
      await refreshDocuments();

      toast.success('Document shared successfully');
    } catch (error: any) {
      console.error('Error sharing document:', error);
      toast.error('Failed to share document');
    }
  };

  const value = {
    documents,
    archivedDocuments,
    recentActivities,
    categories,
    loading,
    uploadDocument,
    archiveDocument,
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