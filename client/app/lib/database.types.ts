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
      announcements: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: number
          is_active: boolean | null
          metadata: Json | null
          priority: number | null
          start_date: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: number
          is_active?: boolean | null
          metadata?: Json | null
          priority?: number | null
          start_date?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: number
          is_active?: boolean | null
          metadata?: Json | null
          priority?: number | null
          start_date?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          color: string | null
          created_at: string | null
          description: string
          icon: string
          id: string
          is_active: boolean | null
          name: string
          requirement_count: number | null
          requirement_type: string
          updated_at: string | null
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string | null
          description: string
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          requirement_count?: number | null
          requirement_type: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          requirement_count?: number | null
          requirement_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      band_member_username_mappings: {
        Row: {
          band_member_name: string
          created_at: string | null
          created_by: string | null
          id: number
          is_active: boolean | null
          notes: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          band_member_name: string
          created_at?: string | null
          created_by?: string | null
          id?: number
          is_active?: boolean | null
          notes?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          band_member_name?: string
          created_at?: string | null
          created_by?: string | null
          id?: number
          is_active?: boolean | null
          notes?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      band_members: {
        Row: {
          band_id: number
          created_at: string | null
          id: number
          image: string
          instrument: string
          name: string
          order: number | null
          updated_at: string | null
        }
        Insert: {
          band_id: number
          created_at?: string | null
          id?: number
          image: string
          instrument: string
          name: string
          order?: number | null
          updated_at?: string | null
        }
        Update: {
          band_id?: number
          created_at?: string | null
          id?: number
          image?: string
          instrument?: string
          name?: string
          order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "band_members_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
        ]
      }
      bands: {
        Row: {
          created_at: string | null
          description: string
          id: number
          image: string
          is_published: boolean | null
          name: string
          order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: number
          image: string
          is_published?: boolean | null
          name: string
          order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: number
          image?: string
          is_published?: boolean | null
          name?: string
          order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
          featured_members: string[] | null
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
          featured_members?: string[] | null
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
          featured_members?: string[] | null
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
      global_chat_messages: {
        Row: {
          created_at: string | null
          edited_at: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_deleted: boolean | null
          message: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          message?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          message?: string | null
          user_id?: string
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
          content: string | null
          conversation_id: string
          created_at: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
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
      poll_votes: {
        Row: {
          id: number
          poll_id: number | null
          selected_options: Json
          user_id: string | null
          voted_at: string | null
        }
        Insert: {
          id?: number
          poll_id?: number | null
          selected_options: Json
          user_id?: string | null
          voted_at?: string | null
        }
        Update: {
          id?: number
          poll_id?: number | null
          selected_options?: Json
          user_id?: string | null
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          allow_multiple: boolean | null
          announcement_id: number | null
          created_at: string | null
          id: number
          options: Json
          question: string
        }
        Insert: {
          allow_multiple?: boolean | null
          announcement_id?: number | null
          created_at?: string | null
          id?: number
          options: Json
          question: string
        }
        Update: {
          allow_multiple?: boolean | null
          announcement_id?: number | null
          created_at?: string | null
          id?: number
          options?: Json
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
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
      quiz_questions: {
        Row: {
          announcement_id: number | null
          category: string | null
          correct_answer: string
          created_at: string | null
          difficulty: string | null
          explanation: string | null
          id: number
          options: Json
          question: string
        }
        Insert: {
          announcement_id?: number | null
          category?: string | null
          correct_answer: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: number
          options: Json
          question: string
        }
        Update: {
          announcement_id?: number | null
          category?: string | null
          correct_answer?: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: number
          options?: Json
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          answer: string
          id: number
          is_correct: boolean
          question_id: number | null
          responded_at: string | null
          user_id: string | null
        }
        Insert: {
          answer: string
          id?: number
          is_correct: boolean
          question_id?: number | null
          responded_at?: string | null
          user_id?: string | null
        }
        Update: {
          answer?: string
          id?: number
          is_correct?: boolean
          question_id?: number | null
          responded_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      team_member_username_mappings: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number
          is_active: boolean | null
          notes: string | null
          team_member_name: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          is_active?: boolean | null
          notes?: string | null
          team_member_name: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          is_active?: boolean | null
          notes?: string | null
          team_member_name?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string
          category: string
          created_at: string | null
          id: number
          image: string
          is_published: boolean | null
          name: string
          order: number | null
          position: string | null
          role: string
          social_links: Json | null
          updated_at: string | null
          year: number
        }
        Insert: {
          bio: string
          category: string
          created_at?: string | null
          id?: number
          image: string
          is_published?: boolean | null
          name: string
          order?: number | null
          position?: string | null
          role: string
          social_links?: Json | null
          updated_at?: string | null
          year: number
        }
        Update: {
          bio?: string
          category?: string
          created_at?: string | null
          id?: number
          image?: string
          is_published?: boolean | null
          name?: string
          order?: number | null
          position?: string | null
          role?: string
          social_links?: Json | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_at: string | null
          badge_id: string
          id: string
          progress: number | null
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          badge_id: string
          id?: string
          progress?: number | null
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          badge_id?: string
          id?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
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
      award_badge_to_user: {
        Args: { p_badge_name: string; p_user_id: string }
        Returns: Json
      }
      check_and_award_badge: {
        Args: {
          p_current_count: number
          p_requirement_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      cleanup_old_global_messages: { Args: never; Returns: undefined }
      get_or_create_conversation: {
        Args: { user1: string; user2: string }
        Returns: string
      }
      get_unread_message_count: { Args: { user_id: string }; Returns: number }
      get_user_badge_progress: {
        Args: { p_user_id: string }
        Returns: {
          awarded_at: string
          badge_description: string
          badge_icon: string
          badge_name: string
          current_progress: number
          is_earned: boolean
          requirement_count: number
          requirement_type: string
        }[]
      }
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
      update_all_badge_progress: {
        Args: { p_user_id: string }
        Returns: undefined
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
