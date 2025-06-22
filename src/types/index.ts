export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  category: 'SAP CMCT' | 'SAP FI' | 'SAP QM';
  uploaderId: string;
  uploaderName: string;
  blobUrl?: string;
  accessUsers: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface Activity {
  id: string;
  type: 'upload' | 'view' | 'download' | 'archive' | 'restore' | 'delete' | 'share';
  documentId: string;
  documentName: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}