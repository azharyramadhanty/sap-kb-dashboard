import React, { createContext, useContext, useState, useEffect } from 'react';
import { Document, Activity } from '../types';
import { documentService } from '../lib/documentService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface DocumentContextType {
  documents: Document[];
  archivedDocuments: Document[];
  recentActivities: Activity[];
  loading: boolean;
  uploadDocument: (file: File, category: string, accessUsers?: string[]) => Promise<void>;
  archiveDocument: (documentId: string) => Promise<void>;
  restoreDocument: (documentId: string) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  shareDocument: (documentId: string, userIds: string[]) => Promise<void>;
  downloadDocument: (documentId: string) => Promise<void>;
  viewDocument: (documentId: string) => Promise<string>;
  refreshDocuments: () => void;
}

const DocumentContext = createContext<DocumentContextType>({} as DocumentContextType);

export const useDocument = () => useContext(DocumentContext);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [archivedDocuments, setArchivedDocuments] = useState<Document[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshDocuments = () => {
    if (!currentUser) return;
    
    setDocuments(documentService.getDocuments());
    setArchivedDocuments(documentService.getArchivedDocuments());
    setRecentActivities(documentService.getRecentActivities());
  };

  useEffect(() => {
    refreshDocuments();
  }, [currentUser]);

  const uploadDocument = async (file: File, category: string, accessUsers: string[] = []): Promise<void> => {
    try {
      setLoading(true);
      await documentService.uploadDocument(file, category, accessUsers);
      refreshDocuments();
      toast.success(`Document "${file.name}" uploaded successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const archiveDocument = async (documentId: string): Promise<void> => {
    try {
      await documentService.archiveDocument(documentId);
      refreshDocuments();
      toast.success('Document archived successfully');
    } catch (error: any) {
      toast.error(error.message || 'Archive failed');
    }
  };

  const restoreDocument = async (documentId: string): Promise<void> => {
    try {
      await documentService.restoreDocument(documentId);
      refreshDocuments();
      toast.success('Document restored successfully');
    } catch (error: any) {
      toast.error(error.message || 'Restore failed');
    }
  };

  const deleteDocument = async (documentId: string): Promise<void> => {
    try {
      await documentService.deleteDocument(documentId);
      refreshDocuments();
      toast.success('Document deleted permanently');
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    }
  };

  const shareDocument = async (documentId: string, userIds: string[]): Promise<void> => {
    try {
      await documentService.shareDocument(documentId, userIds);
      refreshDocuments();
      toast.success('Document shared successfully');
    } catch (error: any) {
      toast.error(error.message || 'Share failed');
    }
  };

  const downloadDocument = async (documentId: string): Promise<void> => {
    try {
      const url = await documentService.downloadDocument(documentId);
      // Simulate download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document';
      link.click();
      refreshDocuments();
      toast.success('Download started');
    } catch (error: any) {
      toast.error(error.message || 'Download failed');
    }
  };

  const viewDocument = async (documentId: string): Promise<string> => {
    try {
      const url = await documentService.viewDocument(documentId);
      refreshDocuments();
      return url;
    } catch (error: any) {
      toast.error(error.message || 'View failed');
      throw error;
    }
  };

  const value = {
    documents,
    archivedDocuments,
    recentActivities,
    loading,
    uploadDocument,
    archiveDocument,
    restoreDocument,
    deleteDocument,
    shareDocument,
    downloadDocument,
    viewDocument,
    refreshDocuments,
  };

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
};