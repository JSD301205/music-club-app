export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      conversation_members_backup: {
        Row: {
          conversation_id: string | null
          id: string | null
          is_admin: boolean | null
          joined_at: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          id?: string | null
          is_admin?: boolean | null
          joined_at?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          id?: string | null
          is_admin?: boolean | null
          joined_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          avatar_url: string | null
          created_at: string
          description: string | null
          id: string
          last_message_at: string | null
          name: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_message_at?: string | null
          name?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_message_at?: string | null
          name?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string
          created_at: string | null
          date: string
          description: string
          gallery_route: string | null
          id: number
          image: string
          location: string
          order: number | null
          registration_link: string | null
          status: string
          time: string
          title: string
          updated_at: string | null
          view_bands_link: string | null
          year: number
          youtube_url: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          date: string
          description: string
          gallery_route?: string | null
          id?: number
          image: string
          location: string
          order?: number | null
          registration_link?: string | null
          status?: string
          time: string
          title: string
          updated_at?: string | null
          view_bands_link?: string | null
          year?: number
          youtube_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          date?: string
          description?: string
          gallery_route?: string | null
          id?: number
          image?: string
          location?: string
          order?: number | null
          registration_link?: string | null
          status?: string
          time?: string
          title?: string
          updated_at?: string | null
          view_bands_link?: string | null
          year?: number
          youtube_url?: string | null
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          category: string
          created_at: string | null
          event: string | null
          id: number
          image: string
          order: number | null
          title: string
          type: string
          updated_at: string | null
          video_url: string | null
          year: number
        }
        Insert: {
          category: string
          created_at?: string | null
          event?: string | null
          id?: number
          image: string
          order?: number | null
          title: string
          type: string
          updated_at?: string | null
          video_url?: string | null
          year?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          event?: string | null
          id?: number
          image?: string
          order?: number | null
          title?: string
          type?: string
          updated_at?: string | null
          video_url?: string | null
          year?: number
        }
        Relationships: []
      }
      jam_post_responses: {
        Row: {
          created_at: string | null
          id: number
          message: string | null
          post_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          message?: string | null
          post_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: string | null
          post_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jam_post_responses_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "jam_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jam_post_responses_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "jam_posts_with_author"
            referencedColumns: ["id"]
          },
        ]
      }
      jam_posts: {
        Row: {
          author_id: string
          available_times: string[] | null
          created_at: string | null
          description: string
          genres: string[]
          id: number
          instruments_needed: string[]
          location: string | null
          responses_count: number | null
          skill_level: string
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          available_times?: string[] | null
          created_at?: string | null
          description: string
          genres?: string[]
          id?: number
          instruments_needed?: string[]
          location?: string | null
          responses_count?: number | null
          skill_level?: string
          status?: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          available_times?: string[] | null
          created_at?: string | null
          description?: string
          genres?: string[]
          id?: number
          instruments_needed?: string[]
          location?: string | null
          responses_count?: number | null
          skill_level?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allow_messages_from: string | null
          avatar_url: string | null
          batch_year: number | null
          bio: string | null
          created_at: string
          email: string | null
          email_notifications_enabled: boolean | null
          full_name: string | null
          id: string
          instruments: Json | null
          is_profile_complete: boolean | null
          is_visible_in_community: boolean | null
          last_email_sent_at: string | null
          musical_interests: Json | null
          role: string | null
          social_links: Json[] | null
          spotify_playlist: string | null
          updated_at: string
          username: string
        }
        Insert: {
          allow_messages_from?: string | null
          avatar_url?: string | null
          batch_year?: number | null
          bio?: string | null
          created_at?: string
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name?: string | null
          id: string
          instruments?: Json | null
          is_profile_complete?: boolean | null
          is_visible_in_community?: boolean | null
          last_email_sent_at?: string | null
          musical_interests?: Json | null
          role?: string | null
          social_links?: Json[] | null
          spotify_playlist?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          allow_messages_from?: string | null
          avatar_url?: string | null
          batch_year?: number | null
          bio?: string | null
          created_at?: string
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name?: string | null
          id?: string
          instruments?: Json | null
          is_profile_complete?: boolean | null
          is_visible_in_community?: boolean | null
          last_email_sent_at?: string | null
          musical_interests?: Json | null
          role?: string | null
          social_links?: Json[] | null
          spotify_playlist?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          instrument: string | null
          is_featured: boolean | null
          is_published: boolean | null
          resource_type: string
          resource_url: string | null
          skill_level: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          instrument?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          resource_type: string
          resource_url?: string | null
          skill_level?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          instrument?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          resource_type?: string
          resource_url?: string | null
          skill_level?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      jam_posts_with_author: {
        Row: {
          author_id: string | null
          available_times: string[] | null
          avatar_url: string | null
          created_at: string | null
          description: string | null
          favorite_genres: Json | null
          full_name: string | null
          genres: string[] | null
          id: number | null
          instruments: Json | null
          instruments_needed: string[] | null
          location: string | null
          responses_count: number | null
          skill_level: string | null
          status: string | null
          title: string | null
          type: string | null
          updated_at: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_or_create_conversation: {
        Args: { user1: string; user2: string }
        Returns: string
      }
      get_unread_message_count: { Args: { user_id: string }; Returns: number }
      get_user_conversations: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          created_by: string
          description: string
          id: string
          is_group: boolean
          last_message_at: string
          member_count: number
          name: string
          other_user_avatar: string
          other_user_full_name: string
          other_user_id: string
          other_user_username: string
          unread_count: number
          user1_id: string
          user2_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
