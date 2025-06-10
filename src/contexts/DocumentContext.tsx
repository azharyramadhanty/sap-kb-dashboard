import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

type DocumentRow = Database['public']['Tables']['documents']['Row'];
type ActivityRow = Database['public']['Tables']['activities']['Row'];
type DocumentCategory = 'SAP CMCT' | 'SAP FI' | 'SAP QM';

type Document = DocumentRow & {
  uploader: {
    id: string;
    name: string;
    email: string;
  };
  access: Array<{
    id: string;
    name: string;
    email: string;
    role?: string;
  }>;
  category: DocumentCategory;
};

type Activity = ActivityRow & {
  document: {
    id: string;
    name: string;
  } | null;
  user: {
    name: string;
  } | null;
};

type DocumentContextType = {
  documents: Document[];
  archivedDocuments: Document[];
  recentActivities: Activity[];
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

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [archivedDocuments, setArchivedDocuments] = useState<Document[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const categories: DocumentCategory[] = ['SAP CMCT', 'SAP FI', 'SAP QM'];

  useEffect(() => {
    if (currentUser) {
      refreshDocuments();
      loadActivities();
    }
  }, [currentUser]);

  const refreshDocuments = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      // Load documents with uploader and access information
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select(`
          *,
          uploader:users!documents_uploader_id_fkey(id, name, email),
          document_access(
            user_id,
            users(id, name, email, role)
          )
        `)
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (documentsError) {
        throw documentsError;
      }

      // Load archived documents
      const { data: archivedData, error: archivedError } = await supabase
        .from('documents')
        .select(`
          *,
          uploader:users!documents_uploader_id_fkey(id, name, email),
          document_access(
            user_id,
            users(id, name, email, role)
          )
        `)
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false });

      if (archivedError) {
        throw archivedError;
      }

      // Transform the data to match our Document type
      const transformDocument = (doc: any): Document => ({
        ...doc,
        uploader: doc.uploader || { id: '', name: 'Unknown', email: '' },
        access: doc.document_access?.map((access: any) => ({
          id: access.users?.id || '',
          name: access.users?.name || 'Unknown',
          email: access.users?.email || '',
          role: access.users?.role || 'viewer',
        })) || [],
        category: getCategoryFromName(doc.name),
      });

      setDocuments(documentsData?.map(transformDocument) || []);
      setArchivedDocuments(archivedData?.map(transformDocument) || []);
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
      const { data: activitiesData, error } = await supabase
        .from('activities')
        .select(`
          *,
          documents(id, name),
          users(name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      const transformedActivities: Activity[] = activitiesData?.map(activity => ({
        ...activity,
        document: activity.documents ? {
          id: activity.documents.id,
          name: activity.documents.name,
        } : null,
        user: activity.users ? {
          name: activity.users.name,
        } : null,
      })) || [];

      setRecentActivities(transformedActivities);
    } catch (error: any) {
      console.error('Error loading activities:', error);
    }
  };

  const getCategoryFromName = (name: string): DocumentCategory => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('cmct')) return 'SAP CMCT';
    if (nameLower.includes('fi')) return 'SAP FI';
    if (nameLower.includes('qm')) return 'SAP QM';
    return 'SAP CMCT'; // Default category
  };

  const addActivity = async (type: string, documentId: string) => {
    if (!currentUser) return;

    try {
      await supabase
        .from('activities')
        .insert([{
          type,
          document_id: documentId,
          user_id: currentUser.id,
          created_at: new Date().toISOString(),
        }]);

      // Refresh activities
      await loadActivities();
    } catch (error: any) {
      console.error('Error adding activity:', error);
    }
  };

  const uploadDocument = async (documentData: any, file: File): Promise<void> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Insert document record
      const { data: newDocument, error: insertError } = await supabase
        .from('documents')
        .insert([{
          name: file.name,
          type: file.name.split('.').pop() || '',
          size: file.size,
          uploader_id: currentUser.id,
          storage_path: filePath,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (insertError) {
        // Clean up uploaded file if document creation fails
        await supabase.storage.from('documents').remove([filePath]);
        throw insertError;
      }

      // Add document access for shared users
      if (documentData.access && documentData.access.length > 0) {
        const accessRecords = documentData.access
          .filter((user: any) => user.id !== currentUser.id)
          .map((user: any) => ({
            document_id: newDocument.id,
            user_id: user.id,
          }));

        if (accessRecords.length > 0) {
          await supabase
            .from('document_access')
            .insert(accessRecords);
        }
      }

      // Add activity
      await addActivity('upload', newDocument.id);

      // Refresh documents
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

  const moveToArchive = async (documentId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) {
        throw error;
      }

      await addActivity('archive', documentId);
      await refreshDocuments();

      toast.success('Document moved to archive');
    } catch (error: any) {
      console.error('Error archiving document:', error);
      toast.error('Failed to archive document');
    }
  };

  const restoreDocument = async (documentId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          archived_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) {
        throw error;
      }

      await addActivity('restore', documentId);
      await refreshDocuments();

      toast.success('Document restored from archive');
    } catch (error: any) {
      console.error('Error restoring document:', error);
      toast.error('Failed to restore document');
    }
  };

  const deleteDocument = async (documentId: string): Promise<void> => {
    try {
      // Get document info first
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Delete from storage if storage_path exists
      if (document.storage_path) {
        await supabase.storage
          .from('documents')
          .remove([document.storage_path]);
      }

      // Delete document record (this will cascade delete access and activities)
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        throw deleteError;
      }

      await refreshDocuments();

      toast.success('Document permanently deleted');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const viewDocument = async (documentId: string): Promise<string> => {
    try {
      // Get document storage path
      const { data: document, error } = await supabase
        .from('documents')
        .select('storage_path, name')
        .eq('id', documentId)
        .single();

      if (error || !document.storage_path) {
        throw new Error('Document not found or no storage path');
      }

      // Get signed URL for viewing
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.storage_path, 3600); // 1 hour expiry

      if (urlError) {
        throw urlError;
      }

      await addActivity('view', documentId);

      return signedUrlData.signedUrl;
    } catch (error: any) {
      console.error('Error viewing document:', error);
      toast.error('Failed to view document');
      throw error;
    }
  };

  const downloadDocument = async (documentId: string): Promise<void> => {
    try {
      // Get document info
      const { data: documents, error } = await supabase
        .from('documents')
        .select('storage_path, name')
        .eq('id', documentId)
        .single();

      if (error || !documents.storage_path) {
        throw new Error('Document not found or no storage path');
      }

      // Get signed URL for download
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(documents.storage_path, 300); // 5 minutes expiry

      if (urlError) {
        throw urlError;
      }

      //Treat signedUrl as a blob to enable force download
      const response = await fetch(signedUrlData.signedUrl);
      const blob = await response.blob();

      // Create a temporary object URL and force download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documents.name ?? 'file');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up

      await addActivity('download', documentId);

      toast.success(`Document "${documents.name}" downloaded`);
      return;
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const shareDocument = async (documentId: string, userIds: string[]): Promise<void> => {
    try {
      // Remove existing access for these users
      await supabase
        .from('document_access')
        .delete()
        .eq('document_id', documentId)
        .in('user_id', userIds);

      // Add new access records
      const accessRecords = userIds.map(userId => ({
        document_id: documentId,
        user_id: userId,
      }));

      const { error } = await supabase
        .from('document_access')
        .insert(accessRecords);

      if (error) {
        throw error;
      }

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