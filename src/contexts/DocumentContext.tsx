import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

// Define types
type DocumentCategory = 'SAP CMCT' | 'SAP FI' | 'SAP QM';

type Document = {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  category: DocumentCategory;
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
};

type Activity = {
  id: string;
  type: 'upload' | 'view' | 'download' | 'archive' | 'restore' | 'delete';
  document: {
    id: string;
    name: string;
  };
  user: {
    name: string;
  };
  timestamp: string;
};

type DocumentContextType = {
  documents: Document[];
  archivedDocuments: Document[];
  recentActivities: Activity[];
  categories: DocumentCategory[];
  uploadDocument: (document: any, file: File) => Promise<void>;
  moveToArchive: (documentId: string) => void;
  restoreDocument: (documentId: string) => void;
  deleteDocument: (documentId: string) => void;
  viewDocument: (documentId: string) => Promise<string>;
  downloadDocument: (documentId: string) => void;
  shareDocument: (documentId: string, userIds: string[]) => void;
};

const DocumentContext = createContext<DocumentContextType>({} as DocumentContextType);

export const useDocument = () => useContext(DocumentContext);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [archivedDocuments, setArchivedDocuments] = useState<Document[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  
  const categories: DocumentCategory[] = ['SAP CMCT', 'SAP FI', 'SAP QM'];
  
  useEffect(() => {
    if (currentUser) {
      // Initialize with sample data when user logs in
      const sampleDocs = generateSampleDocuments(currentUser);
      const sampleArchivedDocs = generateSampleArchivedDocuments(currentUser);
      
      setDocuments(sampleDocs);
      setArchivedDocuments(sampleArchivedDocs);
      setRecentActivities(generateSampleActivities(sampleDocs, sampleArchivedDocs));
    } else {
      setDocuments([]);
      setArchivedDocuments([]);
      setRecentActivities([]);
    }
  }, [currentUser]);

  const addActivity = (type: Activity['type'], document: Document) => {
    const newActivity: Activity = {
      id: uuidv4(),
      type,
      document: {
        id: document.id,
        name: document.name,
      },
      user: {
        name: currentUser?.name || 'Unknown User',
      },
      timestamp: new Date().toISOString(),
    };
    
    setRecentActivities(prev => [newActivity, ...prev]);
  };
  
  const uploadDocument = async (documentData: any, file: File): Promise<void> => {
    const newDocument: Document = {
      id: uuidv4(),
      name: file.name,
      type: file.name.split('.').pop() || '',
      size: file.size,
      uploadDate: new Date().toISOString(),
      category: documentData.category || 'SAP CMCT',
      uploader: {
        id: currentUser?.id || '',
        name: currentUser?.name || '',
        email: currentUser?.email || '',
      },
      access: documentData.access || [],
    };
    
    setDocuments(prev => [newDocument, ...prev]);
    addActivity('upload', newDocument);
    
    toast.success(`Document "${newDocument.name}" uploaded successfully`);
    return Promise.resolve();
  };
  
  const moveToArchive = (documentId: string) => {
    const documentToArchive = documents.find(doc => doc.id === documentId);
    
    if (!documentToArchive) {
      toast.error('Document not found');
      return;
    }
    
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    setArchivedDocuments(prev => [documentToArchive, ...prev]);
    addActivity('archive', documentToArchive);
    
    toast.success(`Document "${documentToArchive.name}" moved to archive`);
  };
  
  const restoreDocument = (documentId: string) => {
    const documentToRestore = archivedDocuments.find(doc => doc.id === documentId);
    
    if (!documentToRestore) {
      toast.error('Document not found in archive');
      return;
    }
    
    setArchivedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    setDocuments(prev => [documentToRestore, ...prev]);
    addActivity('restore', documentToRestore);
    
    toast.success(`Document "${documentToRestore.name}" restored from archive`);
  };
  
  const deleteDocument = (documentId: string) => {
    const documentToDelete = archivedDocuments.find(doc => doc.id === documentId);
    
    if (!documentToDelete) {
      toast.error('Document not found in archive');
      return;
    }
    
    setArchivedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    addActivity('delete', documentToDelete);
    
    toast.success(`Document "${documentToDelete.name}" permanently deleted`);
  };

  const viewDocument = async (documentId: string): Promise<string> => {
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      toast.error('Document not found');
      throw new Error('Document not found');
    }
    
    addActivity('view', document);
    // In a real app, this would return a URL to view the document
    return Promise.resolve('#');
  };

  const downloadDocument = (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      toast.error('Document not found');
      return;
    }
    
    addActivity('download', document);
    toast.success(`Document "${document.name}" downloaded`);
  };

  const shareDocument = (documentId: string, userIds: string[]) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          access: [
            ...doc.access,
            ...userIds.map(id => ({
              id,
              name: `User ${id}`,
              email: `user${id}@example.com`,
            })),
          ],
        };
      }
      return doc;
    }));
    
    toast.success('Document shared successfully');
  };
  
  return (
    <DocumentContext.Provider
      value={{
        documents,
        archivedDocuments,
        recentActivities,
        categories,
        uploadDocument,
        moveToArchive,
        restoreDocument,
        deleteDocument,
        viewDocument,
        downloadDocument,
        shareDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

// Helper function to generate sample documents
const generateSampleDocuments = (currentUser: any): Document[] => {
  if (!currentUser) return [];
  
  return [
    {
      id: '1',
      name: 'SAP CMCT Implementation Guide.pdf',
      type: 'pdf',
      size: 2500000,
      uploadDate: '2025-04-15T10:30:00Z',
      category: 'SAP CMCT' as DocumentCategory,
      uploader: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      },
      access: [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
        {
          id: '2',
          name: 'Editor User',
          email: 'editor@pln.com',
        },
      ],
    },
    {
      id: '2',
      name: 'SAP FI Configuration Manual.docx',
      type: 'docx',
      size: 1800000,
      uploadDate: '2025-04-14T14:20:00Z',
      category: 'SAP FI' as DocumentCategory,
      uploader: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      },
      access: [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
      ],
    },
    {
      id: '3',
      name: 'SAP QM Quality Planning.pptx',
      type: 'pptx',
      size: 3200000,
      uploadDate: '2025-04-13T09:15:00Z',
      category: 'SAP QM' as DocumentCategory,
      uploader: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      },
      access: [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
        {
          id: '3',
          name: 'Viewer User',
          email: 'viewer@pln.com',
        },
      ],
    },
    {
      id: '4',
      name: 'SAP CMCT Best Practices.pdf',
      type: 'pdf',
      size: 2100000,
      uploadDate: '2025-04-12T16:45:00Z',
      category: 'SAP CMCT' as DocumentCategory,
      uploader: {
        id: '2',
        name: 'Editor User',
        email: 'editor@pln.com',
      },
      access: [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
        {
          id: '2',
          name: 'Editor User',
          email: 'editor@pln.com',
        },
      ],
    },
    {
      id: '5',
      name: 'SAP FI Accounting Procedures.docx',
      type: 'docx',
      size: 1600000,
      uploadDate: '2025-04-11T11:30:00Z',
      category: 'SAP FI' as DocumentCategory,
      uploader: {
        id: '4',
        name: 'Budi Santoso',
        email: 'budi@pln.com',
      },
      access: [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
        {
          id: '4',
          name: 'Budi Santoso',
          email: 'budi@pln.com',
        },
      ],
    },
    {
      id: '6',
      name: 'SAP QM Inspection Process.pdf',
      type: 'pdf',
      size: 2800000,
      uploadDate: '2025-04-10T13:20:00Z',
      category: 'SAP QM' as DocumentCategory,
      uploader: {
        id: '2',
        name: 'Editor User',
        email: 'editor@pln.com',
      },
      access: [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
        {
          id: '2',
          name: 'Editor User',
          email: 'editor@pln.com',
        },
        {
          id: '3',
          name: 'Viewer User',
          email: 'viewer@pln.com',
        },
      ],
    },
  ];
};

// Helper function to generate sample archived documents
const generateSampleArchivedDocuments = (currentUser: any): Document[] => {
  if (!currentUser) return [];
  
  return [
    {
      id: '7',
      name: 'Outdated SAP CMCT Research.pdf',
      type: 'pdf',
      size: 1900000,
      uploadDate: '2025-02-15T08:30:00Z',
      category: 'SAP CMCT' as DocumentCategory,
      uploader: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      },
      access: [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
      ],
    },
    {
      id: '8',
      name: 'Old SAP FI Guidelines.docx',
      type: 'docx',
      size: 1400000,
      uploadDate: '2025-01-20T14:15:00Z',
      category: 'SAP FI' as DocumentCategory,
      uploader: {
        id: '2',
        name: 'Editor User',
        email: 'editor@pln.com',
      },
      access: [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
        {
          id: '2',
          name: 'Editor User',
          email: 'editor@pln.com',
        },
      ],
    },
  ];
};

// Helper function to generate sample activities
const generateSampleActivities = (documents: Document[], archivedDocuments: Document[]): Activity[] => {
  const allDocs = [...documents, ...archivedDocuments];
  
  const activities: Activity[] = [
    {
      id: '1',
      type: 'upload',
      document: {
        id: documents[0]?.id || '1',
        name: documents[0]?.name || 'Unknown Document',
      },
      user: {
        name: documents[0]?.uploader.name || 'Unknown User',
      },
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
    {
      id: '2',
      type: 'view',
      document: {
        id: documents[1]?.id || '2',
        name: documents[1]?.name || 'Unknown Document',
      },
      user: {
        name: 'Editor User',
      },
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    },
    {
      id: '3',
      type: 'download',
      document: {
        id: documents[2]?.id || '3',
        name: documents[2]?.name || 'Unknown Document',
      },
      user: {
        name: 'Viewer User',
      },
      timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    },
  ];
  
  return activities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};