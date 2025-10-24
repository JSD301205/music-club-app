// Database types for Supabase tables
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
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          role: 'admin' | 'member' | 'student'
          instruments: Json
          musical_interests: Json
          spotify_playlist: string | null
          batch_year: number | null
          is_profile_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'admin' | 'member' | 'student'
          instruments?: Json
          musical_interests?: Json
          spotify_playlist?: string | null
          batch_year?: number | null
          is_profile_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'admin' | 'member' | 'student'
          instruments?: Json
          musical_interests?: Json
          spotify_playlist?: string | null
          batch_year?: number | null
          is_profile_complete?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          last_message_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          last_message_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          last_message_at?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_conversation: {
        Args: {
          user1: string
          user2: string
        }
        Returns: string
      }
      get_unread_message_count: {
        Args: {
          user_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']
