// API Response Types
export interface ApiResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  category?: string;
  type?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

// Document Types
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  storagePath: string;
  uploaderId: string;
  category: 'SAP_CMCT' | 'SAP_FI' | 'SAP_QM';
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    documentAccess: number;
  };
}

// Activity Types
export interface Activity {
  id: string;
  type: 'UPLOAD' | 'VIEW' | 'DOWNLOAD' | 'ARCHIVE' | 'RESTORE' | 'DELETE';
  documentId: string | null;
  userId: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  document: {
    id: string;
    name: string;
    type: string;
  } | null;
}

// Legacy type aliases for compatibility
export type DocumentWithRelations = Document;
export type ActivityWithRelations = Activity;
export type UserProfile = User;
export type DocumentCategory = 'SAP_CMCT' | 'SAP_FI' | 'SAP_QM';

export interface DocumentData {
  name: string;
  type: string;
  size: number;
  category: DocumentCategory;
  access: User[];
}