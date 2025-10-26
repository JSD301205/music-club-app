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
          email: string | null
          avatar_url: string | null
          bio: string | null
          role: 'admin' | 'member' | 'enthusiast' | 'alumni'
          instruments: Json
          musical_interests: Json
          spotify_playlist: string | null
          batch_year: number | null
          is_profile_complete: boolean
          is_visible_in_community: boolean
          allow_messages_from: 'everyone' | 'members_only' | 'no_one'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'admin' | 'member' | 'enthusiast' | 'alumni'
          instruments?: Json
          musical_interests?: Json
          spotify_playlist?: string | null
          batch_year?: number | null
          is_profile_complete?: boolean
          is_visible_in_community?: boolean
          allow_messages_from?: 'everyone' | 'members_only' | 'no_one'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'admin' | 'member' | 'enthusiast' | 'alumni'
          instruments?: Json
          musical_interests?: Json
          spotify_playlist?: string | null
          batch_year?: number | null
          is_profile_complete?: boolean
          is_visible_in_community?: boolean
          allow_messages_from?: 'everyone' | 'members_only' | 'no_one'
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
      message_requests: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          status: 'pending' | 'approved' | 'rejected'
          message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          status?: 'pending' | 'approved' | 'rejected'
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          message?: string | null
          created_at?: string
          updated_at?: string
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
      can_message_user: {
        Args: {
          sender_id: string
          recipient_id: string
        }
        Returns: boolean
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
export type MessageRequest = Database['public']['Tables']['message_requests']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageRequestInsert = Database['public']['Tables']['message_requests']['Insert']

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']
export type MessageRequestUpdate = Database['public']['Tables']['message_requests']['Update']

// Role type for easy use
export type UserRole = 'admin' | 'member' | 'enthusiast' | 'alumni'
export type MessagePermission = 'everyone' | 'members_only' | 'no_one'
