export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProjectStatus = 'planning' | 'active' | 'completed' | 'archived';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          status: ProjectStatus;
          start_date: string | null;
          due_date: string | null;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          status?: ProjectStatus;
          start_date?: string | null;
          due_date?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          status?: ProjectStatus;
          start_date?: string | null;
          due_date?: string | null;
          color?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          due_date: string | null;
          position: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          position?: number;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          project_id?: string;
          title?: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          position?: number;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      time_entries: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          started_at: string;
          ended_at: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          started_at?: string;
          ended_at?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          started_at?: string;
          ended_at?: string | null;
          description?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          project_id: string | null;
          type: string;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          project_id?: string | null;
          type: string;
          title: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          theme: ThemePreference;
          timezone: string;
          date_format: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: ThemePreference;
          timezone?: string;
          date_format?: string;
        };
        Update: {
          theme?: ThemePreference;
          timezone?: string;
          date_format?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      project_status: ProjectStatus;
      task_status: TaskStatus;
      task_priority: TaskPriority;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type TimeEntry = Database['public']['Tables']['time_entries']['Row'];
export type NotificationItem = Database['public']['Tables']['notifications']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];