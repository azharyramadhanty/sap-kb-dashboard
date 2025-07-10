import { User, Document, DocumentAccess, Activity, Role, Status, Category, ActivityType } from '@prisma/client';

export type { User, Document, DocumentAccess, Activity, Role, Status, Category, ActivityType };

export type DocumentWithRelations = Document & {
  uploader: User;
  documentAccess: (DocumentAccess & {
    user: User;
  })[];
};

export type ActivityWithRelations = Activity & {
  document: Document | null;
  user: User | null;
};

export type UserProfile = User;

export type DocumentCategory = 'SAP_CMCT' | 'SAP_FI' | 'SAP_QM';

export interface DocumentData {
  name: string;
  type: string;
  size: number;
  category: DocumentCategory;
  access: User[];
}

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