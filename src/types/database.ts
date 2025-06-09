export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'editor' | 'viewer'
          status: 'active' | 'inactive'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'editor' | 'viewer'
          status?: 'active' | 'inactive'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'editor' | 'viewer'
          status?: 'active' | 'inactive'
          created_at?: string | null
          updated_at?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          name: string
          type: string
          size: number
          uploader_id: string
          created_at: string | null
          updated_at: string | null
          archived_at: string | null
          storage_path: string | null
        }
        Insert: {
          id?: string
          name: string
          type: string
          size: number
          uploader_id: string
          created_at?: string | null
          updated_at?: string | null
          archived_at?: string | null
          storage_path?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          size?: number
          uploader_id?: string
          created_at?: string | null
          updated_at?: string | null
          archived_at?: string | null
          storage_path?: string | null
        }
      }
      document_access: {
        Row: {
          document_id: string
          user_id: string
          created_at: string | null
        }
        Insert: {
          document_id: string
          user_id: string
          created_at?: string | null
        }
        Update: {
          document_id?: string
          user_id?: string
          created_at?: string | null
        }
      }
      activities: {
        Row: {
          id: string
          type: string
          document_id: string | null
          user_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          type: string
          document_id?: string | null
          user_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          document_id?: string | null
          user_id?: string | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}